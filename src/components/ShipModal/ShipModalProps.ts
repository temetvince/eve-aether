import type { Ship } from '../../domain/Ship';

/** Contract for {@link ShipModal}. */
export interface ShipModalProps {
  /** The ship being inspected. */
  readonly ship: Ship;
  /**
   * Renames the ship. Receives the new name.
   *
   * The caller decides whether the name is free; the dialog reports what it is
   * told through {@link ShipModalProps.renameError}.
   */
  readonly onRename: (name: string) => void;
  /** Why the last rename was refused, or `null` when the name is free. */
  readonly renameError: string | null;
  /** Removes the ship from the fleet. */
  readonly onDecommission: () => void;
  /** Closes the dialog. */
  readonly onClose: () => void;
}
