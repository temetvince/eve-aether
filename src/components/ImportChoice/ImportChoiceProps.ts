/**
 * The words of an import question.
 *
 * Kept apart from the callbacks so the page can build the wording for whatever
 * is being imported and hand it over whole.
 */
export interface ImportChoiceCopy {
  /** Names the dialog, and what is being imported. */
  readonly title: string;
  /** What the chosen file holds. */
  readonly subtitle: string;
  /** What the user already has, and that a choice is needed. */
  readonly lead: string;
  /**
   * What merging would do, or why there is nothing to merge.
   *
   * Must describe the second case whenever
   * {@link ImportChoiceProps.canMerge} is `false`, because the disabled button
   * gives no reason of its own.
   */
  readonly merge: string;
  /** What overwriting would do, including what it removes. */
  readonly overwrite: string;
}

/** Contract for {@link ImportChoice}. */
export interface ImportChoiceProps extends ImportChoiceCopy {
  /** Whether merging would add anything. When `false`, Merge is disabled. */
  readonly canMerge: boolean;
  /** Adds what the file holds to what is already there. */
  readonly onMerge: () => void;
  /** Replaces what is already there with what the file holds. */
  readonly onOverwrite: () => void;
  /** Closes the dialog, leaving everything as it is. */
  readonly onClose: () => void;
}
