import type { Ship } from '../../domain/Ship';

/** Contract for {@link ShipCard}. */
export interface ShipCardProps {
  /** The ship to summarise. */
  readonly ship: Ship;
  /** Opens this ship's full fitting. Receives the ship's id. */
  readonly onOpen: (id: string) => void;
  /**
   * Removes this ship from the fleet. Receives the ship's id.
   *
   * The card does not confirm first; the caller decides whether to.
   */
  readonly onDecommission: (id: string) => void;
}
