import { useState, type JSX } from 'react';
import Modal from '../Modal/Modal';
import FitSheet from '../FitSheet/FitSheet';
import type { ShipModalProps } from './ShipModalProps';

/**
 * A ship's full record: its fitting, its name, and the way out of the fleet.
 *
 * The fit is offered back as the exact text it was pasted from, so it can be
 * copied straight into the game's fitting window.
 *
 * @param props - See {@link ShipModalProps}.
 * @returns The dialog.
 */
const ShipModal = ({
  ship,
  onRename,
  renameError,
  onDecommission,
  onClose,
}: ShipModalProps): JSX.Element => {
  const [draft, setDraft] = useState(ship.name);
  const [copied, setCopied] = useState(false);

  const copyFit = async (): Promise<void> => {
    try {
      await globalThis.navigator.clipboard.writeText(ship.fit.source);
      setCopied(true);
    } catch {
      // Clipboard access can be refused outright. The fitting is on screen and
      // selectable, so there is still a way to get at it.
      setCopied(false);
    }
  };

  return (
    <Modal
      title={ship.name}
      subtitle={
        ship.fit.title === '' ?
          ship.fit.hull
        : `${ship.fit.hull} — ${ship.fit.title}`
      }
      onClose={onClose}
      footer={
        <>
          <button
            type='button'
            className='btn btn--danger'
            onClick={onDecommission}
          >
            Decommission
          </button>
          <button
            type='button'
            className='btn'
            onClick={() => {
              void copyFit();
            }}
          >
            {copied ? 'Copied' : 'Copy fit'}
          </button>
        </>
      }
    >
      <div className='field'>
        <label
          className='field__label'
          htmlFor='rename'
        >
          Ship name
        </label>
        <div className='field__row'>
          <input
            id='rename'
            className='field__input'
            type='text'
            autoComplete='off'
            aria-invalid={renameError !== null}
            aria-describedby='rename-error'
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
          />
          <button
            type='button'
            className='btn'
            onClick={() => {
              onRename(draft);
            }}
            disabled={draft.trim() === '' || draft === ship.name}
          >
            Rename
          </button>
        </div>
        <p
          className='notice notice--bad'
          id='rename-error'
        >
          {renameError ?? ''}
        </p>
      </div>

      <FitSheet fit={ship.fit} />
    </Modal>
  );
};

export default ShipModal;
