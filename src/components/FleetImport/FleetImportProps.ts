/** Contract for {@link FleetImport}. */
export interface FleetImportProps {
  /** Ships currently commissioned. At least 1, or there is nothing to ask. */
  readonly currentCount: number;
  /** Ships the chosen file holds. At least 1. */
  readonly incomingCount: number;
  /**
   * Ships a merge would add, from 0 to {@link FleetImportProps.incomingCount}.
   *
   * The rest are ships whose names are already taken. Passed as a count so the
   * dialog does not need to know how names are compared.
   */
  readonly addCount: number;
  /** Adds the file's ships to the fleet. Only offered when some would be added. */
  readonly onMerge: () => void;
  /** Replaces the fleet with the file's ships. */
  readonly onOverwrite: () => void;
  /** Closes the dialog, leaving the fleet as it is. */
  readonly onClose: () => void;
}
