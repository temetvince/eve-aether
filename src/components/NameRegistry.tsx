import React from 'react';
import { makeAetherFilename } from '../utils/fleet';

interface Props {
  shipNames: string[];
  addNewName: (s: string) => void;
  removeName: (s: string) => void;
  onImportNames?: (names: string[]) => void;
  onClearAll?: () => void;
  onRestoreDefaults?: () => void;
  close: () => void;
}

const NameRegistry: React.FC<Props> = ({
  shipNames,
  addNewName,
  removeName,
  onImportNames,
  onClearAll,
  onRestoreDefaults,
  close,
}) => (
  <div
    className='modal-overlay'
    onClick={close}
  >
    <div
      className='modal-content modal-medium'
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
    >
      <div className='modal-header'>
        <div>SHIP NAME REGISTRY</div>
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
                const blob = new Blob([JSON.stringify(shipNames, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = makeAetherFilename('ship-names.json');
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
                      parsed.every((p): p is string => typeof p === 'string')
                    ) {
                      onImportNames?.(parsed);
                    } else if (parsed && typeof parsed === 'object') {
                      const obj = parsed as Record<string, unknown>;
                      const maybe = (obj.names ?? obj) as unknown;
                      if (
                        Array.isArray(maybe) &&
                        maybe.every((x): x is string => typeof x === 'string')
                      ) {
                        onImportNames?.(maybe);
                      }
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
                  'Restore default ship names? This will overwrite the current registry.',
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
            onClick={() => {
              if (
                !confirm(
                  'Clear all names from the registry? This cannot be undone.',
                )
              )
                return;
              onClearAll?.();
            }}
          >
            Clear All
          </button>
        </div>

        <div className='add-row mb-2'>
          <input
            id='new-name'
            placeholder='Add custom name...'
            className='registry-input flex-1'
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                'new-name',
              ) as HTMLInputElement;
              if (input.value) {
                addNewName(input.value.trim());
                input.value = '';
              }
            }}
            className='registry-add-btn'
          >
            ADD
          </button>
        </div>

        <div className='manage-list'>
          {shipNames.map((name) => (
            <div
              key={name}
              className='manage-row'
            >
              <span>{name}</span>
              <button
                onClick={() => {
                  removeName(name);
                }}
                className='small-btn remove-small'
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default NameRegistry;
