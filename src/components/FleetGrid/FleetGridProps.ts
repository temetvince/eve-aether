import type { Ship } from '../../domain/Ship';

/** Contract for {@link FleetGrid}. */
export interface FleetGridProps {
  /** Ships to show, in the order they should appear. */
  readonly ships: readonly Ship[];
  /** Opens a ship's full fitting. Receives the ship's id. */
  readonly onOpen: (id: string) => void;
  /** Removes one ship. Receives the ship's id. */
  readonly onDecommission: (id: string) => void;
  /** Removes every ship. */
  readonly onClearAll: () => void;
}
