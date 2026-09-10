import type { Fit } from '../../domain/Fit';

/** Contract for {@link FitSheet}. */
export interface FitSheetProps {
  /** The fitting to lay out. */
  readonly fit: Fit;
}
