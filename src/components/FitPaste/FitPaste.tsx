import { useEffect, useRef, type JSX } from 'react';
import type { FitParseResult } from '../../domain/Fit';
import type { FitPasteProps } from './FitPasteProps';

/**
 * Words for the state of the pasted fit.
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
 * A field for pasting a fit into a dialog, with a live verdict beneath it.
 *
 * Takes focus when it appears and selects what is in it, so a paste replaces
 * any text already there while a small hand edit is still possible. Render at
 * most one at a time: its element ids are fixed.
 *
 * @param props - See {@link FitPasteProps}.
 * @returns The field and its live parse status.
 */
const FitPaste = ({
  label,
  hint,
  rows,
  text,
  onTextChange,
  parsed,
}: FitPasteProps): JSX.Element => {
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    field.current?.focus();
    field.current?.select();
  }, []);

  return (
    <div className='field'>
      <label
        className='field__label'
        htmlFor='fit-paste'
      >
        {label}
      </label>
      <p
        className='field__hint'
        id='fit-paste-hint'
      >
        {hint}
      </p>
      <textarea
        id='fit-paste'
        className='field__input field__input--fit'
        ref={field}
        aria-describedby='fit-paste-hint'
        aria-invalid={parsed?.ok === false}
        rows={rows}
        spellCheck={false}
        value={text}
        onChange={(event) => {
          onTextChange(event.target.value);
        }}
      />
      <output
        className={`notice ${parsed?.ok === false ? 'notice--bad' : 'notice--good'}`}
        htmlFor='fit-paste'
      >
        {statusText(parsed)}
      </output>
    </div>
  );
};

export default FitPaste;
