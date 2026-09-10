import { useEffect, useMemo, useReducer } from 'react';
import { availableNames, suggestName } from '../domain/Fleet';
import { sameName } from '../domain/text';
import { DEFAULT_NAMES } from '../data/names';
import {
  loadFleet,
  loadNames,
  saveFleet,
  saveNames,
} from '../storage/fleetStorage';
import {
  fleetReducer,
  rejectRename,
  type FleetAction,
  type FleetState,
} from './fleetReducer';

/** What {@link useFleet} hands back. */
export interface FleetController extends FleetState {
  /** Registered names no ship is currently using. */
  readonly available: readonly string[];
  /** Applies one change to the fleet or the registry. */
  readonly dispatch: (action: FleetAction) => void;
  /**
   * Picks a registered name no ship is using.
   *
   * @param excluding - Names to leave out on top of those already flying. Use
   * this straight after dispatching, when the new state is not yet visible.
   * @returns A random unused name, or `null` when there is none.
   */
  readonly suggest: (excluding?: readonly string[]) => string | null;
  /**
   * Checks a proposed rename.
   *
   * @returns The reason to refuse, or `null` when the rename is allowed.
   */
  readonly rejectRename: (id: string, next: string) => string | null;
}

/**
 * Reads the initial state out of the browser.
 *
 * Passed to `useReducer` as an initialiser so it runs once rather than on every
 * render.
 *
 * @returns The stored fleet and registry, falling back to an empty fleet and
 * the built-in names.
 */
const initialise = (): FleetState => ({
  fleet: loadFleet(),
  registry: loadNames(DEFAULT_NAMES),
});

/**
 * Holds the fleet and the registry, and keeps them persisted.
 *
 * Reads storage once on mount and writes back whenever either collection
 * changes. Call once, at the composition root.
 *
 * @returns The controller described by {@link FleetController}.
 */
export const useFleet = (): FleetController => {
  const [state, dispatch] = useReducer(fleetReducer, undefined, initialise);

  useEffect(() => {
    saveFleet(state.fleet);
  }, [state.fleet]);

  useEffect(() => {
    saveNames(state.registry);
  }, [state.registry]);

  const available = useMemo(
    () => availableNames(state.registry, state.fleet),
    [state.registry, state.fleet],
  );

  return {
    fleet: state.fleet,
    registry: state.registry,
    available,
    dispatch,
    suggest: (excluding = []) =>
      suggestName(
        state.registry.filter(
          (name) => !excluding.some((other) => sameName(name, other)),
        ),
        state.fleet,
      ),
    rejectRename: (id, next) => rejectRename(state, id, next),
  };
};
