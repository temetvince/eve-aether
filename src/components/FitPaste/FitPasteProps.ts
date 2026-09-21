import type { FitParseResult } from '../../domain/Fit';

/** Contract for {@link FitPaste}. */
export interface FitPasteProps {
  /** What the field is for, as its label. */
  readonly label: string;
  /** How to fill the field in, shown beneath the label. */
  readonly hint: string;
  /** Lines of text the field shows before it scrolls. At least 1. */
  readonly rows: number;
  /** Fit text as currently typed. */
  readonly text: string;
  /** Called on every change to the field. */
  readonly onTextChange: (text: string) => void;
  /**
   * Verdict on {@link FitPasteProps.text}, or `null` while the field is empty
   * and there is nothing to report. A failure carries the reason to show,
   * whatever rule produced it.
   */
  readonly parsed: FitParseResult | null;
}
