import type { Ship } from './domain/Ship';

/** Which dialog, if any, is open. */
export type Dialog =
  | { readonly kind: 'none' }
  | { readonly kind: 'ship'; readonly id: string }
  | { readonly kind: 'registry' }
  /** Ships read from a file, waiting on the choice to merge or overwrite. */
  | { readonly kind: 'importFleet'; readonly ships: readonly Ship[] }
  /**
   * Names read from a file, waiting on the same choice.
   *
   * The registry dialog stays open beneath this one.
   */
  | { readonly kind: 'importNames'; readonly names: readonly string[] };
