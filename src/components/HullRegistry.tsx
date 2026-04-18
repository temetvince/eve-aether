import React from 'react';
import { makeAetherFilename } from '../utils/fleet';
import { Hull } from '../types';

interface Props {
  hulls: Hull[];
  addHull: (h: Hull) => void;
  removeHull: (ship: string) => void;
  onImportHulls?: (h: Hull[]) => void;
  onClear?: () => void;
  onRestoreDefaults?: () => void;
  close: () => void;
}

const HullRegistry: React.FC<Props> = ({
  hulls,
  addHull,
  removeHull,
  onImportHulls,
  onClear,
  onRestoreDefaults,
  close,
}) => (
  <div
    className='modal-overlay'
    onClick={close}
  >
    <div
      className='modal-content modal-large'
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
    >
      <div className='modal-header'>
        <div>HULL REGISTRY</div>
        <button
          onClick={close}
          className='close-btn'
        >
          ×
        </button>
      </div>

      <div className='modal-body'>
        <div className='add-row'>
          <button
            className='btn-export'
            onClick={() => {
              try {
                const blob = new Blob([JSON.stringify(hulls, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = makeAetherFilename('hulls.json');
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch {}
            }}
          >
            Export
          </button>

          <label className='btn-import'>
            Import
            <input
              type='file'
              accept='application/json'
              className='hidden-file-input'
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const fr = new FileReader();
                fr.onload = () => {
                  try {
                    const result = fr.result;
                    if (typeof result !== 'string') return;
                    let parsed: unknown;
                    try {
                      parsed = JSON.parse(result);
                    } catch {
                      return;
                    }
                    if (
                      Array.isArray(parsed) &&
                      parsed.every(
                        (p) =>
                          p &&
                          typeof p === 'object' &&
                          'Ship' in (p as Record<string, unknown>),
                      )
                    ) {
                      onImportHulls?.(parsed as Hull[]);
                    }
                  } catch {}
                };
                fr.readAsText(f);
                e.currentTarget.value = '';
              }}
            />
          </label>

          <button
            className='btn-defaults'
            onClick={() => {
              if (
                !confirm(
                  'Restore default hulls? This will overwrite the current hull registry.',
                )
              )
                return;
              onRestoreDefaults?.();
            }}
          >
            Defaults
          </button>
          <button
            className='btn-clear'
            onClick={() => onClear?.()}
          >
            Clear All
          </button>
        </div>

        <div className='add-row'>
          <input
            id='hull-ship'
            placeholder='Ship name'
            className='registry-input flex-2'
          />
          <input
            id='hull-type'
            placeholder='Type'
            className='registry-input flex-1 input-sm'
          />
          <input
            id='hull-tech'
            placeholder='Tech'
            className='registry-input flex-1 input-sm'
          />
          <input
            id='hull-faction'
            placeholder='Faction'
            className='registry-input flex-1 input-sm'
          />
          <button
            onClick={() => {
              const ship = (
                document.getElementById('hull-ship') as HTMLInputElement
              ).value.trim();
              if (!ship) return;
              const type = (
                document.getElementById('hull-type') as HTMLInputElement
              ).value.trim();
              const tech = (
                document.getElementById('hull-tech') as HTMLInputElement
              ).value.trim();
              const faction = (
                document.getElementById('hull-faction') as HTMLInputElement
              ).value.trim();
              addHull({ Ship: ship, Type: type, Tech: tech, Faction: faction });
              (document.getElementById('hull-ship') as HTMLInputElement).value =
                '';
              (document.getElementById('hull-type') as HTMLInputElement).value =
                '';
              (document.getElementById('hull-tech') as HTMLInputElement).value =
                '';
              (
                document.getElementById('hull-faction') as HTMLInputElement
              ).value = '';
            }}
            className='registry-add-btn'
          >
            ADD
          </button>
        </div>

        <div className='manage-list'>
          {hulls.map((h) => (
            <div
              key={h.Ship}
              className='manage-row'
            >
              <div>
                <strong>{h.Ship}</strong>
                <div className='small-icon muted-text'>
                  {h.Type} • {h.Tech} • {h.Faction}
                </div>
              </div>
              <div className='flex-gap-8'>
                <button
                  onClick={() => {
                    removeHull(h.Ship);
                  }}
                  className='small-btn remove-small'
                >
                  REMOVE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default HullRegistry;
