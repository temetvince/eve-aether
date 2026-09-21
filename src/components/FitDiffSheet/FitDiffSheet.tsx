import type { JSX } from 'react';
import { SECTION_LABEL, isSlotSection, type SlotKind } from '../../domain/Fit';
import type { FitChange, FitDiff } from '../../domain/compareFits';
import type { FitDiffSheetProps } from './FitDiffSheetProps';

/** One change, put into words. */
interface Step {
  /** What to do, as one word. It carries the meaning; no colour does. */
  readonly verb: string;
  /** What to do it to. */
  readonly item: string;
  /** Where, for a charge going into or coming out of a module; else `''`. */
  readonly detail: string;
}

/**
 * Puts a change into words.
 *
 * @param change - The change.
 * @param kind - Section it is in, since a module is fitted and cargo is added.
 * @returns The words for it.
 */
const toStep = (change: FitChange, kind: SlotKind): Step => {
  if (change.kind === 'add') {
    return {
      verb: isSlotSection(kind) ? 'Fit' : 'Add',
      item: change.item,
      detail: '',
    };
  }

  if (change.kind === 'remove') {
    return { verb: 'Remove', item: change.item, detail: '' };
  }

  if (change.to === null) {
    return {
      verb: 'Unload',
      item: change.from ?? '',
      detail: `from ${change.module}`,
    };
  }

  return {
    verb: 'Load',
    item: change.to,
    detail:
      change.from === null ?
        `into ${change.module}`
      : `into ${change.module}, replacing ${change.from}`,
  };
};

/**
 * Sums a comparison up in a sentence.
 *
 * @param diff - The comparison, or `null` when there is none yet.
 * @returns The sentence, or `''` for `null`.
 */
const summary = (diff: FitDiff | null): string => {
  if (diff === null) return '';

  const steps = diff.reduce(
    (total, section) => total + section.changes.length,
    0,
  );

  if (steps === 0) return 'This matches the saved fit. There is nothing to do.';

  return `${String(steps)} ${
    steps === 1 ? 'difference' : 'differences'
  } from the saved fit. Doing the following brings the ship back to it.`;
};

/**
 * Lists what to do to a ship to bring it back to its saved fit.
 *
 * Laid out like the fit sheet, section by section, so a change is found where
 * the module or the cargo it concerns would be. The summary is a live region
 * that is always present, so a screen reader hears the result arrive when a fit
 * is pasted.
 *
 * @param props - See {@link FitDiffSheetProps}.
 * @returns The summary, and the changes when there are any.
 */
const FitDiffSheet = ({ diff }: FitDiffSheetProps): JSX.Element => (
  <>
    <output className='notice notice--good'>{summary(diff)}</output>

    <div className='sheet'>
      {(diff ?? []).map((section) => (
        <section
          className='sheet__section'
          key={section.kind}
        >
          <h3 className='sheet__heading'>{SECTION_LABEL[section.kind]}</h3>
          <ul className='sheet__list'>
            {section.changes.map((change) => {
              const step = toStep(change, section.kind);

              return (
                <li
                  // No two changes in a section share all three: an item is
                  // never both added and removed, and reloads of one module
                  // differ in the charge they load or replace.
                  key={`${step.verb}-${step.item}-${step.detail}`}
                  className='sheet__item'
                >
                  <span className='diff__verb'>{step.verb}</span>
                  <span className='sheet__name'>
                    {step.item}
                    {step.detail !== '' && (
                      <span className='diff__detail'>{step.detail}</span>
                    )}
                  </span>
                  <span className='sheet__qty'>&times;{change.count}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  </>
);

export default FitDiffSheet;
