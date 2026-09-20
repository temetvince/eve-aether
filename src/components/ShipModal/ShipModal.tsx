import { useEffect, useRef, useState, type JSX } from 'react';
import Modal from '../Modal/Modal';
import FitSheet from '../FitSheet/FitSheet';
import RefitForm from '../RefitForm/RefitForm';
import type { ShipModalProps } from './ShipModalProps';

/**
 * A ship's full record: its fitting, its name, and the way out of the fleet.
 *
 * The fit is offered back as the exact text it was pasted from, so it can be
 * copied straight into the game's fitting window.
 *
 * The dialog has two modes. Normally it shows the fitting; while a replacement
 * fit is being pasted, the fitting gives way to the paste field and the footer
 * offers only Save and Cancel, so a half-typed fit cannot be left behind by
 * some other action.
 *
 * @param props - See {@link ShipModalProps}.
 * @returns The dialog.
 */
const ShipModal = ({
  ship,
  onRename,
  renameError,
  checkFit,
  onChangeFit,
  onDecommission,
  onClose,
}: ShipModalProps): JSX.Element => {
  const [draft, setDraft] = useState(ship.name);
  const [copied, setCopied] = useState(false);
  // `null` while the fitting is on show; the typed text while replacing it.
  const [refit, setRefit] = useState<string | null>(null);

  const changeFitButton = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  const editing = refit !== null;

  // Leaving edit mode removes the button that held focus. Hand focus back to
  // the control that opened the mode rather than letting it fall to the page.
  useEffect(() => {
    if (wasEditing.current && !editing) changeFitButton.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const parsed = refit === null || refit.trim() === '' ? null : checkFit(refit);
  const canSave = parsed?.ok === true && parsed.fit.source !== ship.fit.source;

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

  const saveFit = (): void => {
    if (parsed?.ok !== true) return;
    onChangeFit(parsed.fit);
    setRefit(null);
    // "Copied" described the old fit.
    setCopied(false);
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
        editing ?
          <>
            <button
              type='button'
              className='btn'
              onClick={() => {
                setRefit(null);
              }}
            >
              Cancel
            </button>
            <button
              type='button'
              className='btn btn--primary'
              onClick={saveFit}
              disabled={!canSave}
            >
              Save Fit
            </button>
          </>
        : <>
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
              {copied ? 'Copied' : 'Copy Fit'}
            </button>
            <button
              type='button'
              className='btn'
              ref={changeFitButton}
              onClick={() => {
                setRefit(ship.fit.source);
              }}
            >
              Change Fit
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

      {refit === null ?
        <FitSheet fit={ship.fit} />
      : <RefitForm
          text={refit}
          onTextChange={setRefit}
          parsed={parsed}
        />
      }
    </Modal>
  );
};

export default ShipModal;
