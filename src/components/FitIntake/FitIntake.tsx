import type { JSX } from 'react';
import type { FitIntakeProps, NameStatus } from './FitIntakeProps';

/** Copy for each state the typed name can be in. */
const nameMessage = (status: NameStatus): string => {
  switch (status.kind) {
    case 'flying': {
      return `${status.registered} is already flying. Pick another name.`;
    }
    case 'available': {
      return `Registered as "${status.registered}" — it will be marked deployed.`;
    }
    case 'new': {
      return 'A new name. It will be added to the registry.';
    }
    case 'blank': {
      return 'Take the suggestion or type your own.';
    }
    default: {
      // Exhaustive: adding a NameStatus variant makes this a type error rather
      // than silently falling through to a generic message.
      status satisfies never;
      return '';
    }
  }
};

/**
 * The commissioning panel: paste a fit, name the ship, add it to the fleet.
 *
 * The hull is never asked for. It comes from the fit's header line, which is
 * shown back once the paste parses so the player can confirm the app read the
 * right ship.
 *
 * @param props - See {@link FitIntakeProps}.
 * @returns The panel.
 */
const FitIntake = ({
  name,
  onNameChange,
  onSuggestName,
  canSuggest,
  nameStatus,
  fitText,
  onFitTextChange,
  parsed,
  onCommission,
}: FitIntakeProps): JSX.Element => {
  const blocked = nameStatus.kind === 'flying';
  const ready = parsed?.ok === true && name.trim() !== '' && !blocked;

  return (
    <section
      className='intake'
      aria-labelledby='intake-heading'
    >
      <h2 id='intake-heading'>Commission a ship</h2>

      <div className='field'>
        <label
          className='field__label'
          htmlFor='fit-text'
        >
          Fitting
        </label>
        <p
          className='field__hint'
          id='fit-hint'
        >
          In the fitting window, right-click the ship and choose Copy to
          Clipboard, then paste it here.
        </p>
        <textarea
          id='fit-text'
          className='field__input field__input--fit'
          aria-describedby='fit-hint'
          rows={10}
          spellCheck={false}
          placeholder={
            '[Prospect, Gas Fast Kites Rats]\nOverdrive Injector System II\n...'
          }
          value={fitText}
          onChange={(event) => {
            onFitTextChange(event.target.value);
          }}
        />
      </div>

      <output
        className={`notice ${parsed?.ok === false ? 'notice--bad' : 'notice--good'}`}
        htmlFor='fit-text'
      >
        {parsed === null ?
          'Waiting for a fit.'
        : parsed.ok ?
          `${parsed.fit.hull}${parsed.fit.title === '' ? '' : ` — ${parsed.fit.title}`}`
        : parsed.reason}
      </output>

      <div className='field'>
        <label
          className='field__label'
          htmlFor='ship-name'
        >
          Ship name
        </label>
        <div className='field__row'>
          <input
            id='ship-name'
            className='field__input'
            type='text'
            autoComplete='off'
            aria-describedby='name-status'
            aria-invalid={blocked}
            value={name}
            onChange={(event) => {
              onNameChange(event.target.value);
            }}
          />
          <button
            type='button'
            className='btn'
            onClick={onSuggestName}
            disabled={!canSuggest}
          >
            Suggest
          </button>
        </div>
        <p
          className={`notice ${blocked ? 'notice--bad' : 'notice--muted'}`}
          id='name-status'
        >
          {nameMessage(nameStatus)}
        </p>
      </div>

      <button
        type='button'
        className='btn btn--primary btn--wide'
        onClick={onCommission}
        disabled={!ready}
      >
        Commission Ship
      </button>
    </section>
  );
};

export default FitIntake;
