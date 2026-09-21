// The stylesheet is loaded for its side effect; webpack's style-loader turns
// this import into a <style> tag. There is no binding to assign.
// oxlint-disable-next-line import/no-unassigned-import
import './styles/app.css';

import { useMemo, useState, type JSX } from 'react';

import Header from './components/Header/Header';
import Toolbar from './components/Toolbar/Toolbar';
import FitIntake from './components/FitIntake/FitIntake';
import FleetGrid from './components/FleetGrid/FleetGrid';
import ShipModal from './components/ShipModal/ShipModal';
import NameRegistry from './components/NameRegistry/NameRegistry';
import type { RegistryNotice } from './components/NameRegistry/NameRegistryProps';
import ImportChoice from './components/ImportChoice/ImportChoice';

import { parseFit } from './domain/parseFit';
import { parseRefit } from './domain/parseRefit';
import {
  isDeployed,
  nameStatus,
  unflownShips,
  unregisteredNames,
} from './domain/Fleet';
import { useFleet } from './state/useFleet';
import { serialiseFleet } from './storage/fleetStorage';
import { serialiseNames } from './storage/namesFile';
import { download, exportName } from './download';
import type { Dialog } from './dialog';
import { importFlow } from './imports';
import { fleetImportCopy, namesImportCopy } from './importCopy';

/**
 * The application.
 *
 * Composes the page and owns the things that are purely of the page: what is
 * typed but not yet committed, which dialog is open, and which questions get
 * put to the user before a destructive action. The fleet itself lives in
 * {@link useFleet}, and no component below this point reaches for storage or
 * decides whether a name is free.
 *
 * @returns The page.
 */
const App = (): JSX.Element => {
  const fleet = useFleet();

  const [draftName, setDraftName] = useState<string>(
    () => fleet.suggest() ?? '',
  );
  const [draftFit, setDraftFit] = useState('');
  const [dialog, setDialog] = useState<Dialog>({ kind: 'none' });
  const [renameError, setRenameError] = useState<string | null>(null);
  const [registryNotice, setRegistryNotice] = useState<RegistryNotice | null>(
    null,
  );

  const parsed = useMemo(
    () => (draftFit.trim() === '' ? null : parseFit(draftFit)),
    [draftFit],
  );

  const status = useMemo(
    () => nameStatus(fleet.registry, fleet.fleet, draftName),
    [fleet.registry, fleet.fleet, draftName],
  );

  const commission = (): void => {
    if (parsed === null || !parsed.ok) return;
    fleet.dispatch({ type: 'commission', name: draftName, fit: parsed.fit });
    setDraftFit('');
    // The reducer's new state is not visible yet, so the name just used has to
    // be excluded explicitly or it could be suggested straight back.
    setDraftName(fleet.suggest([draftName]) ?? '');
  };

  const decommission = (id: string): void => {
    const ship = fleet.fleet.find((candidate) => candidate.id === id);
    if (ship === undefined) return;
    if (!globalThis.confirm(`Decommission ${ship.name}?`)) return;

    fleet.dispatch({ type: 'decommission', id });
    setDialog({ kind: 'none' });
  };

  const imports = importFlow(fleet, setDialog, setRegistryNotice);

  // How many of the things waiting on an import question a merge would add.
  const adding =
    dialog.kind === 'importFleet' ?
      unflownShips(fleet.fleet, dialog.ships).length
    : dialog.kind === 'importNames' ?
      unregisteredNames(fleet.registry, dialog.names).length
    : 0;

  const shown =
    dialog.kind === 'ship' ?
      (fleet.fleet.find((ship) => ship.id === dialog.id) ?? null)
    : null;

  return (
    <>
      <div
        className='starfield'
        aria-hidden='true'
      />

      <div className='app'>
        <Header
          fleetCount={fleet.fleet.length}
          registryCount={fleet.registry.length}
          availableCount={fleet.available.length}
        />

        <main className='main'>
          {/* Everything in here is a cell of one grid, laid out by the
              stylesheet: the intake is a large cell and the ships flow around
              it. */}
          <Toolbar
            onOpenRegistry={() => {
              setRegistryNotice(null);
              setDialog({ kind: 'registry' });
            }}
            onImport={(file) => {
              void imports.pickFleet(file);
            }}
            onExport={() => {
              download(exportName('fleet'), serialiseFleet(fleet.fleet));
            }}
            canExport={fleet.fleet.length > 0}
          />

          <FitIntake
            name={draftName}
            onNameChange={setDraftName}
            onSuggestName={() => {
              setDraftName(fleet.suggest() ?? '');
            }}
            canSuggest={fleet.available.length > 0}
            nameStatus={status}
            fitText={draftFit}
            onFitTextChange={setDraftFit}
            parsed={parsed}
            onCommission={commission}
          />

          <FleetGrid
            ships={fleet.fleet}
            onOpen={(id) => {
              setRenameError(null);
              setDialog({ kind: 'ship', id });
            }}
            onDecommission={decommission}
            onClearAll={() => {
              if (globalThis.confirm('Decommission the entire fleet?')) {
                fleet.dispatch({ type: 'clearFleet' });
              }
            }}
          />
        </main>
      </div>

      {shown !== null && (
        <ShipModal
          key={shown.id}
          ship={shown}
          onRename={(next) => {
            const refusal = fleet.rejectRename(shown.id, next);
            setRenameError(refusal);
            if (refusal === null) {
              fleet.dispatch({ type: 'rename', id: shown.id, name: next });
            }
          }}
          renameError={renameError}
          checkFit={(text) => parseRefit(shown.fit.hull, text)}
          onChangeFit={(fit) => {
            fleet.dispatch({ type: 'refit', id: shown.id, fit });
          }}
          onDecommission={() => {
            decommission(shown.id);
          }}
          onClose={() => {
            setDialog({ kind: 'none' });
          }}
        />
      )}

      {dialog.kind === 'importFleet' && (
        <ImportChoice
          {...fleetImportCopy(fleet.fleet.length, dialog.ships.length, adding)}
          canMerge={adding > 0}
          onMerge={() => {
            imports.mergeFleet(dialog.ships);
          }}
          onOverwrite={() => {
            imports.replaceFleet(dialog.ships);
          }}
          onClose={() => {
            setDialog({ kind: 'none' });
          }}
        />
      )}

      {/* The registry stays open beneath the question about a name import, so
          answering it returns to the registry rather than to the page. */}
      {(dialog.kind === 'registry' || dialog.kind === 'importNames') && (
        <NameRegistry
          names={fleet.registry}
          isDeployed={(name) => isDeployed(fleet.fleet, name)}
          onAdd={(name) => {
            fleet.dispatch({ type: 'addName', name });
          }}
          onRemove={(name) => {
            fleet.dispatch({ type: 'removeName', name });
          }}
          onImport={(file) => {
            void imports.pickNames(file);
          }}
          onExport={() => {
            download(exportName('names'), serialiseNames(fleet.registry));
          }}
          notice={registryNotice}
          onClear={() => {
            if (globalThis.confirm('Clear every name from the registry?')) {
              fleet.dispatch({ type: 'clearNames' });
            }
          }}
          onRestoreDefaults={() => {
            fleet.dispatch({ type: 'restoreNames' });
          }}
          onClose={() => {
            setDialog({ kind: 'none' });
          }}
        />
      )}

      {dialog.kind === 'importNames' && (
        <ImportChoice
          {...namesImportCopy(
            fleet.registry.length,
            dialog.names.length,
            adding,
          )}
          canMerge={adding > 0}
          onMerge={() => {
            imports.mergeNames(dialog.names);
          }}
          onOverwrite={() => {
            imports.replaceNames(dialog.names);
          }}
          onClose={() => {
            setDialog({ kind: 'registry' });
          }}
        />
      )}
    </>
  );
};

export default App;
