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
  /** Empties the registry. */
  readonly onClear: () => void;
  /** Restores the registry to the names the app ships with. */
  readonly onRestoreDefaults: () => void;
  /** Closes the dialog. */
  readonly onClose: () => void;
}
