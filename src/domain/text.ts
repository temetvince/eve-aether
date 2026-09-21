/**
 * Name identity for the fleet.
 *
 * Ship names and registry entries are compared exactly, case included, but
 * ignoring stray whitespace. `Prospect Alpha` and ` Prospect  Alpha ` are the
 * same name everywhere in the app, while `prospect alpha` is a different one.
 * Hull names are the exception and ignore case too, because the game decides
 * how a hull is spelled and a hand-typed `vedmak` means `Vedmak`. Every
 * comparison in the domain layer routes through the helpers here rather than
 * deciding the rule at the point of use.
 */

/**
 * Reduces a name to its comparison key.
 *
 * The key is an implementation detail of comparison and is never displayed:
 * the spelling the user typed is what gets stored and rendered.
 *
 * @param value - Raw name, as typed or as read from storage.
 * @returns A key equal for any two names that differ only in leading, trailing,
 * or repeated internal whitespace. Names that differ in case get different
 * keys.
 */
export const foldName = (value: string): string =>
  value.trim().replaceAll(/\s+/gu, ' ');

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
 * Tests whether two hull names mean the same hull.
 *
 * @param a - First hull name.
 * @param b - Second hull name.
 * @returns `true` when they differ at most in case and stray whitespace.
 */
export const sameHull = (a: string, b: string): boolean =>
  foldName(a).toLowerCase() === foldName(b).toLowerCase();

/**
 * Orders names for display: alphabetical, with upper and lower case mixed
 * together rather than one sorted after the other.
 *
 * @param a - First name.
 * @param b - Second name.
 * @returns Negative, zero, or positive, per the `Array.prototype.sort`
 * comparator contract. Zero only for identical strings, so names that differ
 * only in case still have a fixed order.
 */
export const compareNames = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { sensitivity: 'variant' });

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
 * Blank entries are dropped. Where several entries fold to the same key the
 * first one wins. Entries that differ in case are different names, and all of
 * them are kept.
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
