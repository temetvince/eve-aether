import { parseFit } from '../domain/parseFit';
import { newShipId, type Ship } from '../domain/Ship';
import { distinctNames } from '../domain/text';

/**
 * Reading and writing the fleet to the browser.
 *
 * A ship is stored as the name it was given plus the fit text the player
 * pasted, never as the parsed structure. Re-parsing on load keeps `parseFit`
 * the single authority on what a fit means, so a parser improvement reaches
 * fits that were saved before it, and a stored fit can never drift out of step
 * with the code that interprets it.
 */

/** `localStorage` key holding the commissioned fleet. */
const FLEET_KEY = 'aetherFleet';

/** `localStorage` key holding the name registry. */
const NAMES_KEY = 'aetherShipNames';

/** A ship as it is written to storage. */
interface StoredShip {
  readonly id: string;
  readonly name: string;
  readonly source: string;
}

/**
 * Reads a JSON array out of `localStorage`.
 *
 * Storage is shared with the user's browser and can hold anything, so the
 * result is deliberately `unknown[]` and every caller must narrow it. Never
 * throws: unreadable or absent values come back as `null`.
 *
 * @param key - Key to read.
 * @returns The parsed array, or `null` when the key is absent, unparseable, or
 * does not hold an array.
 */
const readArray = (key: string): readonly unknown[] | null => {
  try {
    const raw = globalThis.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    // A quota-blocked, disabled, or corrupt store is not an error worth
    // interrupting the user for; the app simply starts empty.
    return null;
  }
};

/**
 * Writes a value to `localStorage`, ignoring failure.
 *
 * Storage can be full or disabled outright. Losing persistence degrades the app
 * without breaking it, so a failed write is swallowed rather than surfaced.
 *
 * @param key - Key to write.
 * @param value - JSON-serialisable value.
 */
const write = (key: string, value: unknown): void => {
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Intentionally ignored; see above.
  }
};

/**
 * Recognises any non-null object as something with readable properties.
 *
 * Every property still reads as `unknown`, so this widens what can be indexed
 * without claiming anything about what is inside.
 *
 * @param value - Candidate of unknown type.
 * @returns `true` when `value` is a non-null object.
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Reads a string property, treating anything else as absent.
 *
 * @param record - Object to read from.
 * @param key - Property name.
 * @returns The trimmed value, or `''` when the property is missing or is not a
 * string.
 */
const readString = (
  record: Readonly<Record<string, unknown>>,
  key: string,
): string => {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Narrows one stored entry, tolerating anything.
 *
 * @param value - Candidate read from storage or an imported file.
 * @returns The entry, or `null` when it does not carry a name and a fit.
 */
const toStoredShip = (value: unknown): StoredShip | null => {
  if (!isRecord(value)) return null;

  const name = readString(value, 'name');
  const source = readString(value, 'source');
  const id = readString(value, 'id');

  if (name === '' || source === '') return null;

  return { id: id === '' ? newShipId() : id, name, source };
};

/**
 * Rebuilds ships from stored entries, re-parsing each fit.
 *
 * @param values - Candidate entries.
 * @returns The ships that survived narrowing and parsing. An entry whose fit no
 * longer parses is dropped rather than shown broken.
 */
const toFleet = (values: readonly unknown[]): readonly Ship[] => {
  const ships: Ship[] = [];

  for (const value of values) {
    const stored = toStoredShip(value);
    if (stored === null) continue;

    const parsed = parseFit(stored.source);
    if (!parsed.ok) continue;

    ships.push({ id: stored.id, name: stored.name, fit: parsed.fit });
  }

  return ships;
};

/**
 * Loads the commissioned fleet.
 *
 * @returns The stored fleet, or an empty fleet when nothing readable is stored.
 */
export const loadFleet = (): readonly Ship[] =>
  toFleet(readArray(FLEET_KEY) ?? []);

/**
 * Saves the commissioned fleet, replacing what was there.
 *
 * @param fleet - Fleet to persist.
 */
export const saveFleet = (fleet: readonly Ship[]): void => {
  write(
    FLEET_KEY,
    fleet.map((ship): StoredShip => ({
      id: ship.id,
      name: ship.name,
      source: ship.fit.source,
    })),
  );
};

/**
 * Loads the name registry.
 *
 * @param fallback - Registry to use when nothing is stored, normally the
 * built-in defaults.
 * @returns The stored registry, deduplicated and sorted, or `fallback`.
 */
export const loadNames = (fallback: readonly string[]): readonly string[] => {
  const stored = readArray(NAMES_KEY);
  if (stored === null) return fallback;

  return distinctNames(
    stored.filter((value): value is string => typeof value === 'string'),
  );
};

/**
 * Saves the name registry, replacing what was there.
 *
 * An empty registry is persisted as such, so clearing the registry survives a
 * reload instead of silently reverting to the defaults.
 *
 * @param names - Registry to persist.
 */
export const saveNames = (names: readonly string[]): void => {
  write(NAMES_KEY, names);
};

/**
 * Reads a fleet out of an exported file.
 *
 * Accepts both the array this app writes and an object wrapping it under
 * `fleet`. Never throws.
 *
 * @param text - File contents.
 * @returns The ships the file described, or `null` when it is not a fleet
 * export. An empty array is a valid result and means the file held no ships.
 */
export const parseFleetFile = (text: string): readonly Ship[] | null => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (Array.isArray(parsed)) return toFleet(parsed);

  if (isRecord(parsed)) {
    const wrapped = parsed['fleet'];
    if (Array.isArray(wrapped)) return toFleet(wrapped);
  }

  return null;
};

/**
 * Serialises a fleet for export.
 *
 * @param fleet - Fleet to serialise.
 * @returns Pretty-printed JSON holding each ship's name and verbatim fit text.
 */
export const serialiseFleet = (fleet: readonly Ship[]): string =>
  JSON.stringify(
    fleet.map((ship) => ({
      id: ship.id,
      name: ship.name,
      source: ship.fit.source,
    })),
    null,
    2,
  );
