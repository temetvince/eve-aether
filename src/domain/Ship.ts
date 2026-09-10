import type { Fit } from './Fit';

/**
 * A commissioned ship: a name the player chose, and the fit it is flying.
 *
 * A ship cannot exist without a fit. The fit is what supplies the hull, so
 * there is no way for a ship's hull and its fitting to disagree.
 */
export interface Ship {
  /**
   * Stable identity, independent of the name.
   *
   * Renaming a ship keeps its id, so the fleet can be re-sorted and a ship
   * still be addressed by the UI.
   */
  readonly id: string;
  /** The player's name for this ship. Never blank. */
  readonly name: string;
  /** The fitting it is flying, which also names its hull. */
  readonly fit: Fit;
}

/**
 * Mints an id for a newly commissioned ship.
 *
 * @returns An identifier unique within this browser.
 */
export const newShipId = (): string => globalThis.crypto.randomUUID();
