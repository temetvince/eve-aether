import { isRecord } from './json';

/**
 * The name registry as a file, for moving a registry between browsers.
 *
 * The format is a JSON array of strings. Nothing else is stored, so a file
 * written by hand in any editor imports just as well as one this app exported.
 */

/**
 * Reads a name list out of a file.
 *
 * Accepts the array this app writes, and an object wrapping it under `names`.
 * Entries that are not strings are skipped rather than failing the whole file.
 * Never throws.
 *
 * @param text - File contents.
 * @returns The names the file held, untrimmed and possibly repeating, or `null`
 * when the file is not a name list. An empty array is a valid result.
 */
export const parseNamesFile = (text: string): readonly string[] | null => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  const list =
    isRecord(parsed) && !Array.isArray(parsed) ? parsed['names'] : parsed;
  if (!Array.isArray(list)) return null;

  return list.filter((value): value is string => typeof value === 'string');
};

/**
 * Serialises a registry for export.
 *
 * @param names - Registry to serialise.
 * @returns A pretty-printed JSON array, in the order given.
 */
export const serialiseNames = (names: readonly string[]): string =>
  JSON.stringify(names, null, 2);
