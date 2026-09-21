import { useEffect, useRef, useState, type JSX } from 'react';
import { compareFits } from '../../domain/compareFits';
import Modal from '../Modal/Modal';
import FitSheet from '../FitSheet/FitSheet';
import FitPaste from '../FitPaste/FitPaste';
import FitDiffSheet from '../FitDiffSheet/FitDiffSheet';
import type { ShipModalProps } from './ShipModalProps';

/**
 * What the dialog is showing: the saved fitting, the field for replacing it, or
 * the field for comparing it with what the ship is flying now.
 */
type Mode = 'view' | 'refit' | 'compare';

/**
 * A ship's full record: its fitting, its name, and the way out of the fleet.
 *
 * The fit is offered back as the exact text it was pasted from, so it can be
 * copied straight into the game's fitting window.
 *
 * The dialog has three modes. Normally it shows the fitting. While a
 * replacement fit is being pasted, the fitting gives way to the paste field and
 * the footer offers only Save and Cancel, so a half-typed fit cannot be left
 * behind by some other action. While the current fit is being compared, the
 * paste field is followed by what differs, and the footer offers only Done.
 * Comparing never changes the ship, so the field for renaming it is not shown
 * in that mode. A name half-typed before comparing is kept for afterwards.
 *
 * @param props - See {@link ShipModalProps}.
 * @returns The dialog.
 */
const ShipModal = ({
  ship,
  onRename,
  renameError,
  checkFit,
  checkCurrentFit,
  onChangeFit,
  onDecommission,
  onClose,
}: ShipModalProps): JSX.Element => {
  const [draft, setDraft] = useState(ship.name);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<Mode>('view');
  // The text in the paste field. Meaningless in `view` mode.
  const [pasted, setPasted] = useState('');

  const changeFitButton = useRef<HTMLButtonElement>(null);
  const compareFitButton = useRef<HTMLButtonElement>(null);
  const lastMode = useRef<Mode>('view');

  // Leaving a paste mode removes the button that held focus. Hand focus back to
  // the control that opened the mode rather than letting it fall to the page.
  useEffect(() => {
    if (mode === 'view' && lastMode.current === 'refit') {
      changeFitButton.current?.focus();
    }
    if (mode === 'view' && lastMode.current === 'compare') {
      compareFitButton.current?.focus();
    }
    lastMode.current = mode;
  }, [mode]);

  const check = mode === 'compare' ? checkCurrentFit : checkFit;
  const parsed = mode === 'view' || pasted.trim() === '' ? null : check(pasted);
  const canSave = parsed?.ok === true && parsed.fit.source !== ship.fit.source;

  const open = (next: Mode, text: string): void => {
    setPasted(text);
    setMode(next);
  };

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
    setMode('view');
    // "Copied" described the old fit.
    setCopied(false);
  };

  const backToView = (label: string): JSX.Element => (
    <button
      type='button'
      className='btn'
      onClick={() => {
        setMode('view');
      }}
    >
      {label}
    </button>
  );

  const renameField = (
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
  );

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
        mode === 'refit' ?
          <>
            {backToView('Cancel')}
            <button
              type='button'
              className='btn btn--primary'
              onClick={saveFit}
              disabled={!canSave}
            >
              Save Fit
            </button>
          </>
        : mode === 'compare' ?
          backToView('Done')
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
              ref={compareFitButton}
              onClick={() => {
                open('compare', '');
              }}
            >
              Compare Fit
            </button>
            <button
              type='button'
              className='btn'
              ref={changeFitButton}
              onClick={() => {
                open('refit', ship.fit.source);
              }}
            >
              Change Fit
            </button>
          </>

      }
    >
      {/* Comparing is about the fitting alone, so the name is left out of it. */}
      {mode !== 'compare' && renameField}

      {mode === 'view' && <FitSheet fit={ship.fit} />}

      {mode === 'refit' && (
        <FitPaste
          label='New fitting'
          hint='Paste the replacement over the current fit. It must be for the same hull. The ship keeps its name.'
          rows={14}
          text={pasted}
          onTextChange={setPasted}
          parsed={parsed}
        />
      )}

      {mode === 'compare' && (
        <>
          <FitPaste
            label='Fitting the ship has now'
            hint='In the fitting window, right-click the ship and choose Copy to Clipboard, then paste it here. It is compared with the saved fit and is not saved.'
            rows={8}
            text={pasted}
            onTextChange={setPasted}
            parsed={parsed}
          />
          <FitDiffSheet
            diff={
              parsed?.ok === true ? compareFits(ship.fit, parsed.fit) : null
            }
          />
        </>
      )}
    </Modal>
  );
};

export default ShipModal;
