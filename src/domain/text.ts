/**
 * Name identity for the fleet.
 *
 * Ship names, hull names and registry entries are all compared case- and
 * whitespace-insensitively. `Prospect Alpha`, `prospect alpha` and
 * ` PROSPECT ALPHA ` are the same name everywhere in the app, so every
 * comparison in the domain layer routes through the helpers here rather than
 * calling `toLowerCase` at the point of use.
 */

/**
 * Reduces a name to its comparison key.
 *
 * The key is an implementation detail of comparison and is never displayed:
 * the spelling the user typed is what gets stored and rendered.
 *
 * @param value - Raw name, as typed or as read from storage.
 * @returns A key equal for any two names that differ only in case or in
 * leading, trailing, or repeated internal whitespace.
 */
export const foldName = (value: string): string =>
  value.trim().replaceAll(/\s+/gu, ' ').toLowerCase();

/**
 * Tests two names for domain identity.
 *
 * @param a - First name.
 * @param b - Second name.
 * @returns `true` when both fold to the same key.
 */
export const sameName = (a: string, b: string): boolean =>
  foldName(a) === foldName(b);

/**
 * Orders names for display: alphabetical, ignoring case and accents.
 *
 * @param a - First name.
 * @param b - Second name.
 * @returns Negative, zero, or positive, per the `Array.prototype.sort`
 * comparator contract.
 */
export const compareNames = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { sensitivity: 'base' });

/**
 * Sorts names for display without mutating the input.
 *
 * @param names - Names to sort.
 * @returns A new array ordered by {@link compareNames}.
 */
export const sortNames = (names: readonly string[]): readonly string[] =>
  names.toSorted(compareNames);

/**
 * Collapses a list of names to its distinct members, sorted for display.
 *
 * Blank entries are dropped. Where several spellings fold to the same key the
 * first one wins, so an existing registry entry keeps its capitalisation when a
 * differently-cased duplicate is merged in.
 *
 * @param names - Names to deduplicate, in priority order.
 * @returns A new array of distinct, trimmed names ordered by
 * {@link compareNames}.
 */
export const distinctNames = (names: readonly string[]): readonly string[] => {
  const byKey = new Map<string, string>();

  for (const name of names) {
    const trimmed = name.trim();
    const key = foldName(trimmed);
    if (key !== '' && !byKey.has(key)) byKey.set(key, trimmed);
  }

  return sortNames([...byKey.values()]);
};
