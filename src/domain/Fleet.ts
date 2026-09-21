import type { Ship } from './Ship';
import { compareNames, distinctNames, foldName, sameName } from './text';

/**
 * The rules relating the name registry to the ships actually flying.
 *
 * The registry is a pool of names to draw on; the fleet is what has been
 * commissioned. A registry name is *deployed* when a ship in the fleet bears
 * it. Names match exactly, case included, so `prospect alpha` and
 * `Prospect Alpha` are two names and can both be flying. Only stray whitespace
 * is ignored.
 */

/**
 * Reports whether a name is already flying.
 *
 * @param fleet - Ships currently commissioned.
 * @param name - Name to test.
 * @returns `true` when some ship bears this name, ignoring stray whitespace but
 * not case.
 */
export const isDeployed = (fleet: readonly Ship[], name: string): boolean =>
  fleet.some((ship) => sameName(ship.name, name));

/**
 * Finds a registry entry matching a typed name.
 *
 * Use this to recover the registry's spelling of a name the user typed with
 * different spacing. A name typed in a different case is a different name, and
 * is not found.
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
 * already registered is not added twice. A name that differs from a registered
 * one in case is a new name, and is added beside it.
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
 * Because stray whitespace is ignored, a typed name can match a registry entry
 * or a flying ship that is spaced differently. Each variant that involves such
 * a match carries the other spelling so it can be shown.
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
 * A name already in the registry keeps the registry's spacing, so the pool
 * never ends up holding two spacings of one name. Case is part of the name, and
 * is left as typed.
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
 * @returns The distinct, trimmed incoming names that match no registry entry.
 * A name differing from an entry in case does not match it. Blank entries are
 * dropped.
 */
export const unregisteredNames = (
  registry: readonly string[],
  incoming: readonly string[],
): readonly string[] =>
  distinctNames(incoming).filter(
    (name) => findRegistered(registry, name) === null,
  );

/**
 * Picks out the ships a fleet could take on without a name clash.
 *
 * Use it to tell the user what a merge will add before doing it, and to do the
 * merge itself, so the two can never disagree.
 *
 * @param fleet - Ships currently commissioned.
 * @param incoming - Ships being offered, possibly repeating a name.
 * @returns The incoming ships, in their original order, whose names no ship in
 * `fleet` bears. Case counts, so `apex` does not clash with `Apex`. When several
 * incoming ships share a name, only
 * the first is kept. The ships themselves are returned unchanged.
 */
export const unflownShips = (
  fleet: readonly Ship[],
  incoming: readonly Ship[],
): readonly Ship[] => {
  const taken = new Set(fleet.map((ship) => foldName(ship.name)));
  const accepted: Ship[] = [];

  for (const ship of incoming) {
    const folded = foldName(ship.name);
    if (taken.has(folded)) continue;

    taken.add(folded);
    accepted.push(ship);
  }

  return accepted;
};

/**
 * Orders a fleet for display.
 *
 * @param fleet - Ships to order.
 * @returns A new array sorted by ship name, as `compareNames` orders names.
 */
export const sortFleet = (fleet: readonly Ship[]): readonly Ship[] =>
  fleet.toSorted((a, b) => compareNames(a.name, b.name));
