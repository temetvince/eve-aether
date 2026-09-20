import type { Ship } from './Ship';
import { compareNames, distinctNames, foldName, sameName } from './text';

/**
 * The rules relating the name registry to the ships actually flying.
 *
 * The registry is a pool of names to draw on; the fleet is what has been
 * commissioned. A registry name is *deployed* when a ship in the fleet bears
 * it, and names match case-insensitively throughout, so typing `prospect alpha`
 * takes the registry's `Prospect Alpha` out of circulation rather than sitting
 * beside it as a near-duplicate.
 */

/**
 * Reports whether a name is already flying.
 *
 * @param fleet - Ships currently commissioned.
 * @param name - Name to test.
 * @returns `true` when some ship bears this name, ignoring case and whitespace.
 */
export const isDeployed = (fleet: readonly Ship[], name: string): boolean =>
  fleet.some((ship) => sameName(ship.name, name));

/**
 * Finds a registry entry matching a typed name.
 *
 * Use this to recover the registry's spelling of a name the user typed in a
 * different case.
 *
 * @param registry - Registered names.
 * @param name - Name as typed.
 * @returns The registry's spelling, or `null` when the name is not registered.
 */
export const findRegistered = (
  registry: readonly string[],
  name: string,
): string | null => registry.find((entry) => sameName(entry, name)) ?? null;

/**
 * Lists the registered names not currently flying.
 *
 * This is the pool a suggestion is drawn from, so a name never gets recommended
 * while a ship is already using it.
 *
 * @param registry - Registered names.
 * @param fleet - Ships currently commissioned.
 * @returns Registry entries no ship bears, in registry order.
 */
export const availableNames = (
  registry: readonly string[],
  fleet: readonly Ship[],
): readonly string[] => {
  const taken = new Set(fleet.map((ship) => foldName(ship.name)));
  return registry.filter((name) => !taken.has(foldName(name)));
};

/**
 * Picks a name to recommend.
 *
 * @param registry - Registered names.
 * @param fleet - Ships currently commissioned.
 * @returns A uniformly random name that is registered and not yet flying, or
 * `null` when every registered name is in use.
 */
export const suggestName = (
  registry: readonly string[],
  fleet: readonly Ship[],
): string | null => {
  const pool = availableNames(registry, fleet);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
};

/**
 * Folds a commissioned name into the registry.
 *
 * A name the player typed becomes a registry entry so it can be tracked as
 * deployed and offered again once the ship is decommissioned. A name that is
 * already registered under a different capitalisation is left exactly as the
 * registry spells it, so the pool never accumulates near-duplicates.
 *
 * @param registry - Registered names.
 * @param name - Name just given to a ship. Must not be blank.
 * @returns The registry including this name, sorted for display. Returns the
 * original array unchanged when the name was already registered.
 */
export const registerName = (
  registry: readonly string[],
  name: string,
): readonly string[] =>
  findRegistered(registry, name) === null ?
    distinctNames([...registry, name])
  : registry;

/**
 * What the registry and the fleet have to say about a name.
 *
 * Because names match case-insensitively, a typed name can collide with a
 * registry entry or a flying ship that is spelled differently. Each variant
 * that involves such a match carries the other spelling so it can be shown.
 */
export type NameStatus =
  /** Nothing typed. */
  | { readonly kind: 'blank' }
  /** A ship is already flying under this name. */
  | { readonly kind: 'flying'; readonly registered: string }
  /** Registered and free to use. `registered` is the registry's spelling. */
  | { readonly kind: 'available'; readonly registered: string }
  /** Not registered; using it will add it to the registry. */
  | { readonly kind: 'new' };

/**
 * Classifies a name against the registry and the fleet.
 *
 * @param registry - Registered names.
 * @param fleet - Ships currently commissioned.
 * @param name - Name as typed, trimmed or not.
 * @returns The name's status. Only `flying` should block commissioning.
 */
export const nameStatus = (
  registry: readonly string[],
  fleet: readonly Ship[],
  name: string,
): NameStatus => {
  const trimmed = name.trim();
  if (trimmed === '') return { kind: 'blank' };

  const flying = fleet.find((ship) => sameName(ship.name, trimmed));
  if (flying !== undefined) {
    return { kind: 'flying', registered: flying.name };
  }

  const registered = findRegistered(registry, trimmed);
  if (registered !== null) return { kind: 'available', registered };

  return { kind: 'new' };
};

/**
 * Settles which spelling of a name to use.
 *
 * A name already in the registry keeps the registry's capitalisation, so the
 * pool never ends up holding two spellings of one name.
 *
 * @param registry - Registered names.
 * @param name - Name as typed.
 * @returns The registry's spelling when the name is registered, otherwise the
 * trimmed input.
 */
export const canonicalName = (
  registry: readonly string[],
  name: string,
): string => findRegistered(registry, name.trim()) ?? name.trim();

/**
 * Picks out the names a registry does not already hold.
 *
 * Use it to tell the user what an import will add before merging it in.
 *
 * @param registry - Registered names.
 * @param incoming - Names being offered, in any casing, possibly repeating.
 * @returns The distinct, trimmed incoming names that match no registry entry,
 * ignoring case. Blank entries are dropped.
 */
export const unregisteredNames = (
  registry: readonly string[],
  incoming: readonly string[],
): readonly string[] =>
  distinctNames(incoming).filter(
    (name) => findRegistered(registry, name) === null,
  );

/**
 * Orders a fleet for display.
 *
 * @param fleet - Ships to order.
 * @returns A new array sorted by ship name, ignoring case.
 */
export const sortFleet = (fleet: readonly Ship[]): readonly Ship[] =>
  fleet.toSorted((a, b) => compareNames(a.name, b.name));
