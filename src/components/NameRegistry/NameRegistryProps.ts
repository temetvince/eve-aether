/**
 * The outcome of the last import, for showing inside the dialog.
 *
 * `bad` is carried as a field rather than left to styling, so a failure is told
 * apart in words and markup as well as in colour.
 */
export interface RegistryNotice {
  /** Whether the import was refused. */
  readonly bad: boolean;
  /** What to tell the user. */
  readonly text: string;
}

/** Contract for {@link NameRegistry}. */
export interface NameRegistryProps {
  /** Registered names, in display order. */
  readonly names: readonly string[];
  /**
   * Reports whether a ship is currently flying under a registry name.
   *
   * Passed as a predicate so the dialog does not need to know that names are
   * compared case-insensitively.
   */
  readonly isDeployed: (name: string) => boolean;
  /** Adds a name. The caller deduplicates case-insensitively. */
  readonly onAdd: (name: string) => void;
  /** Removes a name from the registry. Ships keep the names they were given. */
  readonly onRemove: (name: string) => void;
  /**
   * Reads names from a file the user chose and merges them in.
   *
   * The dialog does no file handling itself; the caller reads the file and
   * reports back through {@link NameRegistryProps.notice}.
   */
  readonly onImport: (file: File) => void;
  /** Downloads the registry as a file. Only offered when there are names. */
  readonly onExport: () => void;
  /** Outcome of the last import, or `null` when there is nothing to report. */
  readonly notice: RegistryNotice | null;
  /** Empties the registry. */
  readonly onClear: () => void;
  /** Restores the registry to the names the app ships with. */
  readonly onRestoreDefaults: () => void;
  /** Closes the dialog. */
  readonly onClose: () => void;
}
