/**
 * The shape of a fitting copied out of the EVE client.
 *
 * A {@link Fit} is produced only by `parseFit`; nothing else in the app
 * constructs one. It always carries the verbatim text it was parsed from, so a
 * fit can be handed back to the game byte-for-byte no matter how the structured
 * view below chose to interpret it.
 */

/**
 * Which part of the ship a {@link FitSection} describes.
 *
 * The order of this union is the order the EVE client writes the sections in,
 * and `parseFit` relies on that order.
 */
export type SlotKind =
  'low' | 'mid' | 'high' | 'rig' | 'subsystem' | 'drone' | 'fighter' | 'cargo';

/**
 * The section order the EVE client emits, which is also the display order.
 *
 * The client writes a block for every section, including the ones the hull does
 * not have, so a block's position alone identifies it.
 */
export const SECTION_ORDER: readonly SlotKind[] = [
  'low',
  'mid',
  'high',
  'rig',
  'subsystem',
  'drone',
  'fighter',
  'cargo',
];

/** Human-readable heading for each section, for display in a fit sheet. */
export const SECTION_LABEL: Readonly<Record<SlotKind, string>> = {
  low: 'Low Slots',
  mid: 'Mid Slots',
  high: 'High Slots',
  rig: 'Rigs',
  subsystem: 'Subsystems',
  drone: 'Drone Bay',
  fighter: 'Fighter Bay',
  cargo: 'Cargo',
};

/**
 * One line of a fitting: a fitted module, a drone, or a stack of cargo.
 *
 * `quantity` is `1` for anything occupying a slot, since a slot holds exactly
 * one module. Only drone, fighter and cargo entries carry a larger count.
 */
export interface FitEntry {
  /** Type name, e.g. `Gas Cloud Scoop II`. Never blank. */
  readonly name: string;
  /** Ammo or script loaded into the module, or `null` when it takes none. */
  readonly charge: string | null;
  /** Stack size. Always `1` for a slotted module; at least `1` everywhere. */
  readonly quantity: number;
  /** Whether the module was exported offline (`/OFFLINE`). */
  readonly offline: boolean;
}

/**
 * One section of a fitting, with the entries the player put in it.
 *
 * A section with no entries and no empty slots is dropped during parsing, so
 * every section reaching the UI has something to show.
 */
export interface FitSection {
  /** Which part of the ship this section describes. */
  readonly kind: SlotKind;
  /** Entries in the order the client wrote them. */
  readonly entries: readonly FitEntry[];
  /**
   * Count of `[Empty ... slot]` placeholders. Present only for slot sections;
   * always `0` for `drone`, `fighter` and `cargo`.
   */
  readonly emptySlots: number;
}

/**
 * A parsed EVE fitting.
 *
 * Invariant: `source` is the exact text the fit was parsed from, so
 * round-tripping a fit back into the game never loses information that the
 * structured view failed to model.
 */
export interface Fit {
  /** Hull name from the header line, e.g. `Prospect`. Never blank. */
  readonly hull: string;
  /** Fit name from the header line. May be blank if the player left it so. */
  readonly title: string;
  /** Non-empty sections, in {@link SECTION_ORDER}. */
  readonly sections: readonly FitSection[];
  /** The verbatim text this fit was parsed from. */
  readonly source: string;
}

/**
 * Outcome of parsing pasted text.
 *
 * Parsing never throws and never partially succeeds: callers get either a whole
 * {@link Fit} or a reason to show the user.
 */
export type FitParseResult =
  | { readonly ok: true; readonly fit: Fit }
  | { readonly ok: false; readonly reason: string };

/**
 * Counts the drones a fit carries.
 *
 * Cargo is deliberately not counted with them: a hold routinely holds a
 * thousand rounds of ammunition, and adding that to a total makes the number
 * say nothing about the ship.
 *
 * @param fit - Fit to measure.
 * @returns Total drones across the drone and fighter bays.
 */
export const countDrones = (fit: Fit): number =>
  fit.sections
    .filter((section) => section.kind === 'drone' || section.kind === 'fighter')
    .reduce(
      (total, section) =>
        total + section.entries.reduce((sum, entry) => sum + entry.quantity, 0),
      0,
    );

/**
 * Counts the modules a fit puts into slots.
 *
 * Drones, fighters and cargo are excluded, so this is the number of things
 * actually bolted to the hull.
 *
 * @param fit - Fit to measure.
 * @returns Number of fitted modules, ignoring empty slots.
 */
export const countModules = (fit: Fit): number =>
  fit.sections
    .filter((section) => isSlotSection(section.kind))
    .reduce((total, section) => total + section.entries.length, 0);

/**
 * Reports whether a section holds modules bolted to the hull.
 *
 * Slot sections have a fixed capacity and can contain empty placeholders;
 * `drone`, `fighter` and `cargo` are free-form holds that cannot.
 *
 * @param kind - Section to classify.
 * @returns `true` for `low`, `mid`, `high`, `rig` and `subsystem`.
 */
export const isSlotSection = (kind: SlotKind): boolean =>
  kind !== 'drone' && kind !== 'fighter' && kind !== 'cargo';
