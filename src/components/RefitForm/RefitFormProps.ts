import type { FitParseResult } from '../../domain/Fit';

/** Contract for {@link RefitForm}. */
export interface RefitFormProps {
  /** Replacement fit text as currently typed. */
  readonly text: string;
  /** Called on every change to the field. */
  readonly onTextChange: (text: string) => void;
  /**
   * Verdict on {@link RefitFormProps.text}, or `null` while the field is empty
   * and there is nothing to report. A failure carries the reason to show,
   * whatever rule produced it.
   */
  readonly parsed: FitParseResult | null;
}
