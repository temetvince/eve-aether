import type { Fit } from '../domain/Fit';
import { newShipId, type Ship } from '../domain/Ship';
import {
  canonicalName,
  isDeployed,
  registerName,
  sortFleet,
  unflownShips,
} from '../domain/Fleet';
import { distinctNames, sameHull, sameName } from '../domain/text';
import { DEFAULT_NAMES } from '../data/names';

/**
 * The fleet and the registry as one value, changed only through this reducer.
 *
 * The two are kept together because they have to move together: commissioning a
 * ship both adds the ship and registers its name, and doing that in two steps
 * would leave a moment where the fleet holds a name the registry has never
 * heard of. Every transition here is a pure function of the state and the
 * action, so the invariant can be checked without rendering anything.
 */
export interface FleetState {
  /** Commissioned ships, ordered by name. */
  readonly fleet: readonly Ship[];
  /** Registered names, ordered for display. */
  readonly registry: readonly string[];
}

/** Everything that can change {@link FleetState}. */
export type FleetAction =
  /** Adds a ship and registers its name. Ignored if the name is already flying. */
  | { readonly type: 'commission'; readonly name: string; readonly fit: Fit }
  /** Removes one ship, returning its name to the available pool. */
  | { readonly type: 'decommission'; readonly id: string }
  /**
   * Renames a ship and registers the new name.
   *
   * Assumes the name is free; call {@link rejectRename} first.
   */
  | { readonly type: 'rename'; readonly id: string; readonly name: string }
  /**
   * Swaps a ship's fitting, keeping its id and its name.
   *
   * Ignored when the fit is for a different hull, since a ship is its hull.
   * Check with `parseRefit` first to get a reason worth showing. An unknown id
   * changes nothing.
   */
  | { readonly type: 'refit'; readonly id: string; readonly fit: Fit }
  /** Removes every ship, leaving the registry intact. */
  | { readonly type: 'clearFleet' }
  /**
   * Replaces the fleet, folding the incoming names into the registry.
   *
   * Ignored when `ships` holds no ship that can be taken on, so a fleet is
   * never replaced by nothing. Use `clearFleet` to empty it.
   */
  | { readonly type: 'replaceFleet'; readonly ships: readonly Ship[] }
  /**
   * Adds ships to the fleet, folding their names into the registry.
   *
   * Nothing is removed. A ship whose name is already flying is left out, as
   * {@link unflownShips} describes. Call that first to learn which ones.
   */
  | { readonly type: 'mergeFleet'; readonly ships: readonly Ship[] }
  /** Adds one name to the registry. */
  | { readonly type: 'addName'; readonly name: string }
  /**
   * Merges a list of names into the registry.
   *
   * Nothing is removed, and a name already registered is not added twice. A
   * name differing from a registered one in case is added beside it.
   */
  | { readonly type: 'importNames'; readonly names: readonly string[] }
  /**
   * Replaces the registry with a list of names.
   *
   * Blank and repeated names are dropped. Names differing in case are not
   * repeats, and are all kept.
   * Ships keep the names they were given, registered or not.
   */
  | { readonly type: 'replaceNames'; readonly names: readonly string[] }
  /** Removes one name. Ships already carrying it keep it. */
  | { readonly type: 'removeName'; readonly name: string }
  /** Empties the registry. */
  | { readonly type: 'clearNames' }
  /** Restores the registry to the names the app ships with. */
  | { readonly type: 'restoreNames' };

/**
 * Checks whether a rename can go ahead.
 *
 * Separate from the reducer because the answer is worth showing the user, and a
 * reducer has nowhere to put a reason.
 *
 * @param state - Current state.
 * @param id - Ship being renamed.
 * @param next - Proposed name.
 * @returns The reason to refuse, or `null` when the rename is allowed.
 */
export const rejectRename = (
  state: FleetState,
  id: string,
  next: string,
): string | null => {
  const trimmed = next.trim();
  if (trimmed === '') return 'A ship needs a name.';

  const clash = state.fleet.find(
    (ship) => ship.id !== id && sameName(ship.name, trimmed),
  );

  return clash === undefined ? null : `${clash.name} is already flying.`;
};

/**
 * Adds a ship, registering its name.
 *
 * @param state - Current state.
 * @param name - Name for the ship, as typed.
 * @param fit - The fitting it will fly.
 * @returns The new state, or `state` unchanged when the name is blank or is
 * already flying.
 */
const commission = (state: FleetState, name: string, fit: Fit): FleetState => {
  const settled = canonicalName(state.registry, name);
  if (settled === '' || isDeployed(state.fleet, settled)) return state;

  return {
    fleet: sortFleet([...state.fleet, { id: newShipId(), name: settled, fit }]),
    registry: registerName(state.registry, settled),
  };
};

/**
 * Renames a ship, registering the new name.
 *
 * @param state - Current state.
 * @param id - Ship to rename. An unknown id leaves the fleet untouched.
 * @param name - New name, already checked by {@link rejectRename}.
 * @returns The new state.
 */
const rename = (state: FleetState, id: string, name: string): FleetState => {
  const settled = canonicalName(state.registry, name);

  return {
    fleet: sortFleet(
      state.fleet.map((ship) =>
        ship.id === id ? { ...ship, name: settled } : ship,
      ),
    ),
    registry: registerName(state.registry, settled),
  };
};

/**
 * Takes on ships that came from outside this state, such as from a file.
 *
 * @param state - Current state.
 * @param ships - Ships being offered, in any state of repair.
 * @param keeping - Ships of the current fleet that stay. Pass the fleet to
 * merge, or nothing to replace it.
 * @returns The new state, or `state` unchanged when no offered ship can be
 * taken on. A ship is left out when its name is already borne by a kept ship or
 * by an earlier offered one, so no two ships ever share a name. Each ship taken
 * on is spelled the way the registry spells its name, and is given a fresh id
 * if the one it arrived with is already in use. Offered names join the
 * registry, so an imported ship reads as deployed rather than as an unknown
 * name.
 */
const adoptShips = (
  state: FleetState,
  ships: readonly Ship[],
  keeping: readonly Ship[],
): FleetState => {
  const ids = new Set(keeping.map((ship) => ship.id));

  const adopted = unflownShips(keeping, ships).map((ship): Ship => {
    const id = ids.has(ship.id) ? newShipId() : ship.id;
    ids.add(id);

    return {
      id,
      name: canonicalName(state.registry, ship.name),
      fit: ship.fit,
    };
  });

  if (adopted.length === 0) return state;

  return {
    fleet: sortFleet([...keeping, ...adopted]),
    registry: distinctNames([
      ...state.registry,
      ...adopted.map((ship) => ship.name),
    ]),
  };
};

/**
 * Applies one action.
 *
 * Pure, and total over {@link FleetAction}: adding a variant without handling
 * it is a compile error rather than a silent no-op.
 *
 * @param state - Current state.
 * @param action - What to do.
 * @returns The new state, or `state` itself when the action changes nothing.
 */
export const fleetReducer = (
  state: FleetState,
  action: FleetAction,
): FleetState => {
  switch (action.type) {
    case 'commission': {
      return commission(state, action.name, action.fit);
    }
    case 'decommission': {
      return {
        ...state,
        fleet: state.fleet.filter((ship) => ship.id !== action.id),
      };
    }
    case 'rename': {
      return rename(state, action.id, action.name);
    }
    case 'refit': {
      return {
        ...state,
        fleet: state.fleet.map((ship) =>
          ship.id === action.id && sameHull(ship.fit.hull, action.fit.hull) ?
            { ...ship, fit: action.fit }
          : ship,
        ),
      };
    }
    case 'clearFleet': {
      return { ...state, fleet: [] };
    }
    case 'replaceFleet': {
      return adoptShips(state, action.ships, []);
    }
    case 'mergeFleet': {
      return adoptShips(state, action.ships, state.fleet);
    }
    case 'addName': {
      return { ...state, registry: registerName(state.registry, action.name) };
    }
    case 'importNames': {
      return {
        ...state,
        // Existing entries come first, so theirs is the spacing that survives.
        registry: distinctNames([...state.registry, ...action.names]),
      };
    }
    case 'replaceNames': {
      return { ...state, registry: distinctNames(action.names) };
    }
    case 'removeName': {
      return {
        ...state,
        registry: state.registry.filter(
          (entry) => !sameName(entry, action.name),
        ),
      };
    }
    case 'clearNames': {
      return { ...state, registry: [] };
    }
    case 'restoreNames': {
      return { ...state, registry: DEFAULT_NAMES };
    }
    default: {
      // Exhaustive: a new FleetAction variant makes this a type error.
      action satisfies never;
      return state;
    }
  }
};
