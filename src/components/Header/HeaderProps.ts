/** Contract for {@link Header}. */
export interface HeaderProps {
  /** How many ships are commissioned. */
  readonly fleetCount: number;
  /** How many names the registry holds. */
  readonly registryCount: number;
  /** How many registered names no ship is currently using. */
  readonly availableCount: number;
}
