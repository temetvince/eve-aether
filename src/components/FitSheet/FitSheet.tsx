import type { JSX } from 'react';
import { SECTION_LABEL, type FitEntry } from '../../domain/Fit';
import type { FitSheetProps } from './FitSheetProps';

/**
 * Renders one line of a fitting.
 *
 * @param entry - The entry to describe.
 * @returns Text of the form `Module, Charge` with its stack count, if any.
 */
const entryText = (entry: FitEntry): string =>
  entry.charge === null ? entry.name : `${entry.name}, ${entry.charge}`;

/**
 * Lays a parsed fitting out section by section.
 *
 * Sections appear in the order the game writes them. Slots the player left
 * unfilled are stated in words rather than drawn as blanks, so the count is
 * available to a screen reader.
 *
 * @param props - See {@link FitSheetProps}.
 * @returns The fitting sheet.
 */
const FitSheet = ({ fit }: FitSheetProps): JSX.Element => (
  <div className='sheet'>
    {fit.sections.map((section) => (
      <section
        className='sheet__section'
        key={section.kind}
      >
        <h3 className='sheet__heading'>{SECTION_LABEL[section.kind]}</h3>
        <ul className='sheet__list'>
          {section.entries.map((entry, index) => (
            <li
              // A fit routinely repeats a module, so the name alone is not a
              // key. The list is rendered from an immutable parse in file
              // order, and never reordered, so the index is stable.
              key={`${entry.name}-${String(index)}`}
              className='sheet__item'
            >
              <span className='sheet__name'>{entryText(entry)}</span>
              {entry.offline && <span className='badge'>offline</span>}
              {entry.quantity > 1 && (
                <span className='sheet__qty'>&times;{entry.quantity}</span>
              )}
            </li>
          ))}
          {section.emptySlots > 0 && (
            <li className='sheet__item sheet__item--empty'>
              {section.emptySlots} empty{' '}
              {section.emptySlots === 1 ? 'slot' : 'slots'}
            </li>
          )}
        </ul>
      </section>
    ))}
  </div>
);

export default FitSheet;
