import type { FitDiff } from '../../domain/compareFits';

/** Contract for {@link FitDiffSheet}. */
export interface FitDiffSheetProps {
  /**
   * What to do to the ship to bring it back to its saved fit, or `null` while
   * there is no readable fit to compare yet. An empty list means the two
   * already match, which is reported as such rather than shown as nothing.
   */
  readonly diff: FitDiff | null;
}
