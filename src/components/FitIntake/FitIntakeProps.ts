import type { FitParseResult } from '../../domain/Fit';

/**
 * What the registry has to say about the name currently typed.
 *
 * Stray whitespace is ignored when names are matched, so a typed name can match
 * a registry entry or a flying ship that is spaced differently.
 */
export type NameStatus =
  /** Nothing typed yet. */
  | { readonly kind: 'blank' }
  /** A ship is already flying under this name; commissioning is blocked. */
  | { readonly kind: 'flying'; readonly registered: string }
  /** Registered and free. `registered` is the registry's own spelling. */
  | { readonly kind: 'available'; readonly registered: string }
  /** Not in the registry; commissioning will add it. */
  | { readonly kind: 'new' };

/** Contract for {@link FitIntake}. */
export interface FitIntakeProps {
  /** Ship name as currently typed. */
  readonly name: string;
  /** Called on every keystroke in the name field. */
  readonly onNameChange: (name: string) => void;
  /** Replaces the name with a fresh suggestion from the registry. */
  readonly onSuggestName: () => void;
  /** Whether the registry still has an unused name to suggest. */
  readonly canSuggest: boolean;
  /** What the registry says about {@link FitIntakeProps.name}. */
  readonly nameStatus: NameStatus;

  /** Fit text as currently pasted. */
  readonly fitText: string;
  /** Called on every change to the fit field. */
  readonly onFitTextChange: (text: string) => void;
  /**
   * Result of parsing {@link FitIntakeProps.fitText}, or `null` while the field
   * is empty and there is nothing to report.
   */
  readonly parsed: FitParseResult | null;

  /**
   * Commissions the ship.
   *
   * Only called when the fit parses and the name is free, so the handler does
   * not need to re-check either.
   */
  readonly onCommission: () => void;
}
