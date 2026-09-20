/**
 * Spelling a hull the way the game does.
 *
 * A fit's header normally comes from the game and is already right. One typed
 * or edited by hand may not be, and the app has no table of hulls to check it
 * against. It does not need one: hull names follow a plain capitalisation rule,
 * and the rule is only applied to a header that visibly did not come from the
 * game, so a genuine spelling is never second-guessed.
 */

/** A run of characters between spaces and hyphens, e.g. `Tash` in `Tash-Murkon`. */
const WORD = /[^\s-]+/gu;

/** Words the game capitalises in a way the plain rule cannot produce. */
const IRREGULAR: Readonly<Record<string, string>> = {
  interbus: 'InterBus',
};

/**
 * Reports whether a word could have been written by the game.
 *
 * The game starts every word of a hull name with a capital and never writes a
 * word entirely in capitals.
 *
 * @param word - One word of a hull name. Never blank.
 * @returns `false` for a word such as `vedmak`, `vEDMAK` or `VEDMAK`.
 */
const looksGameSpelled = (word: string): boolean => {
  const first = word.charAt(0);
  const shouts =
    word.length > 1 &&
    word === word.toUpperCase() &&
    word !== word.toLowerCase();

  return first === first.toUpperCase() && !shouts;
};

/**
 * Capitalises one word the way the game would.
 *
 * Only the first letter is raised, so `goru's` becomes `Goru's`.
 *
 * @param word - One word of a hull name, in any casing.
 * @returns The word with a leading capital, or its irregular spelling.
 */
const capitalise = (word: string): string => {
  const lower = word.toLowerCase();
  return IRREGULAR[lower] ?? lower.charAt(0).toUpperCase() + lower.slice(1);
};

/**
 * Settles the spelling of a hull name taken from a fit header.
 *
 * @param hull - Hull name as written in the header. Already trimmed.
 * @returns `hull` unchanged when every word could have been written by the
 * game, which is always the case for a fit copied out of the client. Otherwise
 * the name with each word capitalised, so `vedmak` and `VEDMAK` both become
 * `Vedmak`. Spacing and hyphens are kept as written.
 */
export const gameSpelling = (hull: string): string => {
  const words = hull.match(WORD) ?? [];

  return words.every((word) => looksGameSpelled(word)) ? hull : (
      hull.replaceAll(WORD, (word) => capitalise(word))
    );
};
