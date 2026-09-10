import { useState, type JSX } from 'react';
import Modal from '../Modal/Modal';
import type { NameRegistryProps } from './NameRegistryProps';

/**
 * The pool of ship names to draw on.
 *
 * A name in use is marked in words as well as in style, so the distinction does
 * not rest on colour alone. Removing a name here does not touch the ship
 * carrying it; the registry only decides what gets suggested next.
 *
 * @param props - See {@link NameRegistryProps}.
 * @returns The dialog.
 */
const NameRegistry = ({
  names,
  isDeployed,
  onAdd,
  onRemove,
  onClear,
  onRestoreDefaults,
  onClose,
}: NameRegistryProps): JSX.Element => {
  const [draft, setDraft] = useState('');

  const add = (): void => {
    const trimmed = draft.trim();
    if (trimmed === '') return;
    onAdd(trimmed);
    setDraft('');
  };

  return (
    <Modal
      title='Name registry'
      subtitle={`${names.length} ${names.length === 1 ? 'name' : 'names'}`}
      onClose={onClose}
      footer={
        <>
          <button
            type='button'
            className='btn btn--danger'
            onClick={onClear}
          >
            Clear all
          </button>
          <button
            type='button'
            className='btn'
            onClick={onRestoreDefaults}
          >
            Restore defaults
          </button>
        </>
      }
    >
      <form
        className='field'
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <label
          className='field__label'
          htmlFor='new-name'
        >
          Add a name
        </label>
        <div className='field__row'>
          <input
            id='new-name'
            className='field__input'
            type='text'
            autoComplete='off'
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
          />
          <button
            type='submit'
            className='btn'
            disabled={draft.trim() === ''}
          >
            Add
          </button>
        </div>
      </form>

      {names.length === 0 ?
        <p className='notice notice--muted'>
          The registry is empty. Add a name, or restore the defaults.
        </p>
      : <ul className='registry'>
          {names.map((name) => {
            const inUse = isDeployed(name);

            return (
              <li
                className='registry__row'
                key={name}
              >
                <span className='registry__name'>{name}</span>
                {inUse && <span className='badge'>deployed</span>}
                <button
                  type='button'
                  className='icon-btn'
                  onClick={() => {
                    onRemove(name);
                  }}
                >
                  <span aria-hidden='true'>&times;</span>
                  <span className='sr-only'>Remove {name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      }
    </Modal>
  );
};

export default NameRegistry;
