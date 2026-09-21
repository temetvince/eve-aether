import type { RegistryNotice } from './components/NameRegistry/NameRegistryProps';
import type { Dialog } from './dialog';
import type { Ship } from './domain/Ship';
import { unregisteredNames } from './domain/Fleet';
import type { FleetController } from './state/useFleet';
import { namesAddedNotice, namesReplacedNotice } from './importCopy';
import { uploadFleet, uploadNames } from './upload';

/**
 * The import flow: from a picked file to a changed fleet or registry.
 *
 * An import that would land on top of existing data stops to ask whether to
 * merge or overwrite, by opening a dialog. With nothing to lose and nothing to
 * merge with, there is no question, and the file is simply taken.
 */

/** What {@link importFlow} hands back. */
export interface ImportFlow {
  /** Takes a picked fleet file. Refusals are shown in an alert. */
  readonly pickFleet: (file: File) => Promise<void>;
  /** Takes a picked name file. Refusals are shown in the registry dialog. */
  readonly pickNames: (file: File) => Promise<void>;
  /** Answers the fleet question with "merge", and closes it. */
  readonly mergeFleet: (ships: readonly Ship[]) => void;
  /** Answers the fleet question with "overwrite", and closes it. */
  readonly replaceFleet: (ships: readonly Ship[]) => void;
  /** Answers the names question with "merge", and returns to the registry. */
  readonly mergeNames: (names: readonly string[]) => void;
  /** Answers the names question with "overwrite", and returns to the registry. */
  readonly replaceNames: (names: readonly string[]) => void;
}

/**
 * Builds the fleet half of the flow.
 *
 * @param fleet - The fleet, as it is in this render.
 * @param setDialog - Opens or closes a dialog.
 * @returns The fleet handlers.
 */
const fleetImports = (
  fleet: FleetController,
  setDialog: (dialog: Dialog) => void,
): Pick<ImportFlow, 'pickFleet' | 'mergeFleet' | 'replaceFleet'> => ({
  pickFleet: async (file) => {
    const picked = await uploadFleet(file);

    if (!picked.ok) {
      globalThis.alert(picked.reason);
    } else if (fleet.fleet.length === 0) {
      fleet.dispatch({ type: 'replaceFleet', ships: picked.value });
    } else {
      setDialog({ kind: 'importFleet', ships: picked.value });
    }
  },

  mergeFleet: (ships) => {
    fleet.dispatch({ type: 'mergeFleet', ships });
    setDialog({ kind: 'none' });
  },

  replaceFleet: (ships) => {
    fleet.dispatch({ type: 'replaceFleet', ships });
    setDialog({ kind: 'none' });
  },
});

/**
 * Builds the names half of the flow.
 *
 * @param fleet - The registry, as it is in this render.
 * @param setDialog - Opens or closes a dialog.
 * @param setNotice - Shows the outcome of a name import in the registry dialog.
 * @returns The name handlers. Each one that changes the registry leaves the
 * registry dialog open with a notice saying what happened.
 */
const nameImports = (
  fleet: FleetController,
  setDialog: (dialog: Dialog) => void,
  setNotice: (notice: RegistryNotice) => void,
): Pick<ImportFlow, 'pickNames' | 'mergeNames' | 'replaceNames'> => {
  const done = (text: string): void => {
    setNotice({ bad: false, text });
    setDialog({ kind: 'registry' });
  };

  const replaceNames = (names: readonly string[]): void => {
    fleet.dispatch({ type: 'replaceNames', names });
    done(namesReplacedNotice(names.length));
  };

  return {
    pickNames: async (file) => {
      const picked = await uploadNames(file);

      if (!picked.ok) {
        setNotice({ bad: true, text: picked.reason });
      } else if (fleet.registry.length === 0) {
        replaceNames(picked.value);
      } else {
        setDialog({ kind: 'importNames', names: picked.value });
      }
    },

    mergeNames: (names) => {
      // Counted before dispatching, while the registry is still the old one.
      const added = unregisteredNames(fleet.registry, names).length;

      fleet.dispatch({ type: 'importNames', names });
      done(namesAddedNotice(added));
    },

    replaceNames,
  };
};

/**
 * Builds the import handlers for the page.
 *
 * Holds no state of its own, so it can be called on every render.
 *
 * @param fleet - The fleet and registry, as they are in this render.
 * @param setDialog - Opens or closes a dialog.
 * @param setNotice - Shows the outcome of a name import in the registry dialog.
 * @returns The handlers. None of them throws or rejects.
 */
export const importFlow = (
  fleet: FleetController,
  setDialog: (dialog: Dialog) => void,
  setNotice: (notice: RegistryNotice) => void,
): ImportFlow => ({
  ...fleetImports(fleet, setDialog),
  ...nameImports(fleet, setDialog, setNotice),
});
