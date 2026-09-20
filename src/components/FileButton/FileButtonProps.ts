/** Contract for {@link FileButton}. */
export interface FileButtonProps {
  /** Visible text, which is also the control's accessible name. */
  readonly label: string;
  /** Value for the file input's `accept` attribute. */
  readonly accept: string;
  /**
   * Receives the file the user chose.
   *
   * Called once per choice, including when the same file is chosen twice in a
   * row. Not called when the picker is dismissed.
   */
  readonly onPick: (file: File) => void;
}
