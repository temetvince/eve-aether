/** Contract for {@link Toolbar}. */
export interface ToolbarProps {
  /** Opens the name registry. */
  readonly onOpenRegistry: () => void;
  /** Reads a fleet from a file the user chose. */
  readonly onImport: (file: File) => void;
  /** Downloads the fleet as JSON. */
  readonly onExport: () => void;
  /** Whether there is anything to export. */
  readonly canExport: boolean;
}
