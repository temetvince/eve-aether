import type { Fit, FitParseResult } from '../../domain/Fit';
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
  /**
   * Judges pasted text as a replacement fit for this ship, for live feedback
   * while it is typed. Every rule a replacement must meet belongs in here; the
   * dialog shows whatever reason comes back and enforces nothing of its own.
   *
   * Must be pure: it is called during render, on every keystroke.
   */
  readonly checkFit: (text: string) => FitParseResult;
  /**
   * Replaces the ship's fitting.
   *
   * Only called with a fit that {@link ShipModalProps.checkFit} accepted, so
   * the handler does not need to validate it again.
   */
  readonly onChangeFit: (fit: Fit) => void;
  /** Removes the ship from the fleet. */
  readonly onDecommission: () => void;
  /** Closes the dialog. */
  readonly onClose: () => void;
}
