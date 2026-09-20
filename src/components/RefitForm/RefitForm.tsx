import { useEffect, useRef, type JSX } from 'react';
import type { FitParseResult } from '../../domain/Fit';
import type { RefitFormProps } from './RefitFormProps';

/**
 * Words for the state of the replacement fit.
 *
 * @param parsed - Verdict on the text, or `null` for an empty field.
 * @returns The hull and fit name when accepted, otherwise the reason it was
 * refused.
 */
const statusText = (parsed: FitParseResult | null): string => {
  if (parsed === null) return 'Waiting for a fit.';
  if (!parsed.ok) return parsed.reason;

  const { hull, title } = parsed.fit;
  return title === '' ? hull : `${hull} — ${title}`;
};

/**
 * The field for pasting a replacement fit.
 *
 * Takes focus when it appears and selects what is in it, so a paste replaces
 * the old text outright while a small hand edit is still possible.
 *
 * @param props - See {@link RefitFormProps}.
 * @returns The field and its live parse status.
 */
const RefitForm = ({
  text,
  onTextChange,
  parsed,
}: RefitFormProps): JSX.Element => {
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    field.current?.focus();
    field.current?.select();
  }, []);

  return (
    <div className='field'>
      <label
        className='field__label'
        htmlFor='refit-text'
      >
        New fitting
      </label>
      <p
        className='field__hint'
        id='refit-hint'
      >
        Paste the replacement over the current fit. It must be for the same
        hull. The ship keeps its name.
      </p>
      <textarea
        id='refit-text'
        className='field__input field__input--fit'
        ref={field}
        aria-describedby='refit-hint'
        aria-invalid={parsed?.ok === false}
        rows={14}
        spellCheck={false}
        value={text}
        onChange={(event) => {
          onTextChange(event.target.value);
        }}
      />
      <output
        className={`notice ${parsed?.ok === false ? 'notice--bad' : 'notice--good'}`}
        htmlFor='refit-text'
      >
        {statusText(parsed)}
      </output>
    </div>
  );
};

export default RefitForm;
