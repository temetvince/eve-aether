import type { Fit } from '../domain/Fit';
import { newShipId, type Ship } from '../domain/Ship';
import {
  canonicalName,
  isDeployed,
  registerName,
  sortFleet,
} from '../domain/Fleet';
import { distinctNames, sameName } from '../domain/text';
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
  /** Removes every ship, leaving the registry intact. */
  | { readonly type: 'clearFleet' }
  /** Replaces the fleet, folding the incoming names into the registry. */
  | { readonly type: 'replaceFleet'; readonly ships: readonly Ship[] }
  /** Adds one name to the registry. */
  | { readonly type: 'addName'; readonly name: string }
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
    case 'clearFleet': {
      return { ...state, fleet: [] };
    }
    case 'replaceFleet': {
      return {
        fleet: sortFleet(action.ships),
        // Names arriving with the ships join the registry, so an imported ship
        // reads as deployed rather than as an unknown name.
        registry: distinctNames([
          ...state.registry,
          ...action.ships.map((ship) => ship.name),
        ]),
      };
    }
    case 'addName': {
      return { ...state, registry: registerName(state.registry, action.name) };
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
