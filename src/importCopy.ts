import type { ImportChoiceCopy } from './components/ImportChoice/ImportChoiceProps';

/**
 * The wording of the two import questions.
 *
 * Both are the same question asked of different things, so they share one
 * builder and differ only in the words passed to it.
 */

/** The words that differ between one import question and another. */
interface Subject {
  /** Dialog title. */
  readonly title: string;
  /** Singular noun for one imported thing. */
  readonly one: string;
  /** Plural noun. */
  readonly many: string;
  /** Where merged things go, as in "to your fleet". */
  readonly home: string;
  /** Why a thing is skipped, worded to follow "that is" or "that are". */
  readonly taken: string;
  /** Verb for what overwriting does to the existing things, capitalised. */
  readonly removes: string;
  /** A sentence appended to the overwrite outcome, or `''`. */
  readonly aside: string;
}

/**
 * Builds the wording for one import question.
 *
 * @param subject - The words for what is being imported.
 * @param current - How many the user already has. At least 1.
 * @param incoming - How many the file holds. At least 1.
 * @param adding - How many of those a merge would add, from 0 to `incoming`.
 * @returns The wording. `merge` explains why there is nothing to merge exactly
 * when `adding` is 0.
 */
const importCopy = (
  subject: Subject,
  current: number,
  incoming: number,
  adding: number,
): ImportChoiceCopy => {
  const count = (value: number): string =>
    `${String(value)} ${value === 1 ? subject.one : subject.many}`;

  const skipping = incoming - adding;
  const added = `Adds ${count(adding)} to your ${subject.home} and removes nothing.`;
  const skipped =
    skipping === 0 ? '' : (
      ` Skips ${count(skipping)} ${skipping === 1 ? 'that is' : 'that are'} ${subject.taken}.`
    );

  return {
    title: subject.title,
    subtitle: `${count(incoming)} in the file`,
    lead: `You already have ${count(current)}. Choose what happens to ${
      current === 1 ? 'it' : 'them'
    }.`,
    merge:
      adding === 0 ?
        `There is nothing to merge. Every ${subject.one} in the file is ${subject.taken}.`
      : `${added}${skipped}`,
    overwrite: `${subject.removes} your ${count(current)} and replaces ${
      current === 1 ? 'it' : 'them'
    } with the ${count(incoming)} in the file.${subject.aside}`,
  };
};

/**
 * Reports a merged name import.
 *
 * @param added - Names the merge added, 0 or more.
 * @returns A sentence for the registry dialog.
 */
export const namesAddedNotice = (added: number): string =>
  `Added ${String(added)} ${added === 1 ? 'name' : 'names'}.`;

/**
 * Reports a name import that replaced the registry.
 *
 * @param count - Names the registry now holds.
 * @returns A sentence for the registry dialog.
 */
export const namesReplacedNotice = (count: number): string =>
  `Replaced the registry with ${String(count)} ${count === 1 ? 'name' : 'names'}.`;

/**
 * Words the question asked when a fleet file is imported over a fleet.
 *
 * @param current - Ships already commissioned. At least 1.
 * @param incoming - Ships the file holds. At least 1.
 * @param adding - Ships a merge would add, from 0 to `incoming`.
 * @returns The wording for the dialog.
 */
export const fleetImportCopy = (
  current: number,
  incoming: number,
  adding: number,
): ImportChoiceCopy =>
  importCopy(
    {
      title: 'Import Fleet',
      one: 'ship',
      many: 'ships',
      home: 'fleet',
      taken: 'named the same as a ship you already have',
      removes: 'Decommissions',
      aside: '',
    },
    current,
    incoming,
    adding,
  );

/**
 * Words the question asked when a name file is imported over a registry.
 *
 * @param current - Names already registered. At least 1.
 * @param incoming - Distinct names the file holds. At least 1.
 * @param adding - Names a merge would add, from 0 to `incoming`.
 * @returns The wording for the dialog.
 */
export const namesImportCopy = (
  current: number,
  incoming: number,
  adding: number,
): ImportChoiceCopy =>
  importCopy(
    {
      title: 'Import Names',
      one: 'name',
      many: 'names',
      home: 'registry',
      taken: 'already registered',
      removes: 'Removes',
      aside: ' Ships keep the names they were given.',
    },
    current,
    incoming,
    adding,
  );
