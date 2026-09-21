import type { Ship } from './domain/Ship';
import { distinctNames } from './domain/text';
import { parseFleetFile } from './storage/fleetStorage';
import { parseNamesFile } from './storage/namesFile';

/**
 * Taking a file from the browser.
 */

/** A file's contents, or the reason to give the user for refusing it. */
export type Upload<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: string };

/**
 * Reads a file the user picked as text.
 *
 * Never rejects, so a caller has one failure to handle rather than two.
 *
 * @param file - File to read.
 * @returns The contents, or `null` when the browser could not read the file.
 */
const readText = async (file: File): Promise<string | null> => {
  try {
    return await file.text();
  } catch {
    return null;
  }
};

/**
 * Reads a picked file and makes sense of it.
 *
 * @param file - File to read.
 * @param parse - Turns the text into a list, or `null` when it is the wrong
 * kind of file.
 * @param wrongKind - Reason to give when `parse` returns `null`.
 * @param empty - Reason to give when the list is empty.
 * @returns The list, which is never empty, or the reason the file was refused.
 * Never rejects.
 */
const upload = async <T>(
  file: File,
  parse: (text: string) => readonly T[] | null,
  wrongKind: string,
  empty: string,
): Promise<Upload<readonly T[]>> => {
  const text = await readText(file);
  if (text === null)
    return { ok: false, reason: 'That file could not be read.' };

  const value = parse(text);
  if (value === null) return { ok: false, reason: wrongKind };
  if (value.length === 0) return { ok: false, reason: empty };

  return { ok: true, value };
};

/**
 * Reads a fleet export the user picked.
 *
 * @param file - File to read.
 * @returns At least one ship, no two sharing a name, or the reason the file was
 * refused. Never rejects.
 */
export const uploadFleet = (file: File): Promise<Upload<readonly Ship[]>> =>
  upload(
    file,
    parseFleetFile,
    'That file is not a fleet export.',
    'That file holds no ships.',
  );

/**
 * Reads a name list the user picked.
 *
 * @param file - File to read.
 * @returns At least one name, trimmed and with no two the same, or the reason
 * the file was refused. Names differing in case are not the same. Never
 * rejects.
 */
export const uploadNames = (file: File): Promise<Upload<readonly string[]>> =>
  upload(
    file,
    (text) => {
      const names = parseNamesFile(text);
      return names === null ? null : distinctNames(names);
    },
    'That file is not a name list. It should be a JSON array of names.',
    'That file holds no names.',
  );
