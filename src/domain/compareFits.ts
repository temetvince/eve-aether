import {
  SECTION_ORDER,
  entryText,
  isSlotSection,
  type Fit,
  type FitEntry,
  type SlotKind,
} from './Fit';

/**
 * Comparing the fit a ship is flying against the fit it was saved with.
 *
 * The result is a list of things to do to the ship to bring it back to the
 * saved fit, which is the question a pilot has after a fight: how much ammo to
 * buy, and what got swapped out.
 */

/**
 * One thing to do to the ship to bring it back to the saved fit.
 *
 * `count` is always at least `1`.
 */
export type FitChange =
  /** The ship has too few of this. In a slot, that means fitting a module. */
  | { readonly kind: 'add'; readonly item: string; readonly count: number }
  /** The ship has too many of this, or has it when the saved fit does not. */
  | { readonly kind: 'remove'; readonly item: string; readonly count: number }
  /**
   * The right module is fitted with the wrong charge.
   *
   * `from` is what is loaded now and `to` is what the saved fit loads. Either
   * may be `null`, meaning no charge, but never both.
   */
  | {
      readonly kind: 'reload';
      readonly module: string;
      readonly from: string | null;
      readonly to: string | null;
      readonly count: number;
    };

/** The changes that belong to one section of the fit. Never empty. */
export interface FitDiffSection {
  /** Which part of the ship the changes are in. */
  readonly kind: SlotKind;
  /** What to do there: fitting and loading first, then removing. */
  readonly changes: readonly FitChange[];
}

/**
 * Everything that differs, in the order the game lists its sections.
 *
 * Empty when the ship already matches the saved fit.
 */
export type FitDiff = readonly FitDiffSection[];

/** A run of identical things: so many of one item, loaded with one charge. */
interface Stack {
  readonly name: string;
  readonly charge: string | null;
  readonly count: number;
}

/** The holds, which have no slots and are compared as one pool. */
const HOLDS: readonly SlotKind[] = SECTION_ORDER.filter(
  (kind) => !isSlotSection(kind),
);

/**
 * Evens out the spacing of a type name, so that spacing never makes two items
 * look different.
 *
 * The same fit reaches the clipboard with different whitespace depending on
 * where it has been: a chat window turns spaces into non-breaking ones, and an
 * editor doubles or strips them. Case is left alone, because the game spells
 * its own type names.
 *
 * @param value - A module, charge or item name.
 * @returns The name trimmed, with each run of whitespace of any kind replaced
 * by one ordinary space.
 */
const spaced = (value: string): string => value.trim().replaceAll(/\s+/gu, ' ');

/**
 * Lists a fit's entries for some of its sections.
 *
 * @param fit - Fit to read.
 * @param kinds - Sections wanted.
 * @returns Their entries, in section order.
 */
const entriesOf = (fit: Fit, kinds: readonly SlotKind[]): readonly FitEntry[] =>
  fit.sections
    .filter((section) => kinds.includes(section.kind))
    .flatMap((section) => section.entries);

/**
 * Adds entries up into stacks.
 *
 * @param entries - Entries to count.
 * @param byCharge - Whether the same item with a different charge is a
 * different stack. When `false`, every stack's `charge` is `null`.
 * @returns One stack per distinct item, in order of first appearance.
 */
const tally = (
  entries: readonly FitEntry[],
  byCharge: boolean,
): readonly Stack[] => {
  const stacks = new Map<string, Stack>();

  for (const entry of entries) {
    const name = spaced(entry.name);
    const charge =
      byCharge && entry.charge !== null ? spaced(entry.charge) : null;
    // Spacing is folded to single spaces, so a line break cannot occur in
    // either part and the key cannot collide.
    const key = `${name}\n${charge ?? ''}`;

    stacks.set(key, {
      name,
      charge,
      count: (stacks.get(key)?.count ?? 0) + entry.quantity,
    });
  }

  return [...stacks.values()];
};

/**
 * Finds what one tally has more of than another.
 *
 * @param wanted - The tally to satisfy. No two stacks alike.
 * @param held - What is already there. No two stacks alike.
 * @returns A stack for each item `held` is short of, sized by the shortfall.
 */
const shortfall = (
  wanted: readonly Stack[],
  held: readonly Stack[],
): readonly Stack[] => {
  const short: Stack[] = [];

  for (const stack of wanted) {
    const match = held.find(
      (other) => other.name === stack.name && other.charge === stack.charge,
    );
    const count = stack.count - (match?.count ?? 0);
    if (count > 0)
      short.push({ name: stack.name, charge: stack.charge, count });
  }

  return short;
};

/** Text for a stack, as the game writes the line. */
const stackText = (stack: Stack): string =>
  entryText({ name: stack.name, charge: stack.charge });

/**
 * Turns what is missing and what is surplus into changes.
 *
 * A missing stack and a surplus stack of the same module differ only in their
 * charge, so as many of them as pair up are one reload rather than a module to
 * remove and an identical module to fit.
 *
 * @param missing - What the saved fit has and the ship does not.
 * @param surplus - What the ship has and the saved fit does not.
 * @returns Reloads and additions, in the order of `missing`, then removals.
 */
const toChanges = (
  missing: readonly Stack[],
  surplus: readonly Stack[],
): readonly FitChange[] => {
  const changes: FitChange[] = [];
  const spare = new Map(surplus.map((stack) => [stack, stack.count]));

  for (const need of missing) {
    let wanted = need.count;

    for (const stack of surplus) {
      const count = Math.min(wanted, spare.get(stack) ?? 0);
      if (stack.name !== need.name || count === 0) continue;

      spare.set(stack, (spare.get(stack) ?? 0) - count);
      wanted -= count;
      changes.push({
        kind: 'reload',
        module: need.name,
        from: stack.charge,
        to: need.charge,
        count,
      });
    }

    if (wanted > 0) {
      changes.push({ kind: 'add', item: stackText(need), count: wanted });
    }
  }

  for (const [stack, count] of spare) {
    if (count > 0)
      changes.push({ kind: 'remove', item: stackText(stack), count });
  }

  return changes;
};

/**
 * Compares one slot section.
 *
 * @param saved - The saved fit.
 * @param current - The fit the ship is flying.
 * @param kind - A slot section.
 * @returns The changes for that section, possibly none.
 */
const compareSlots = (
  saved: Fit,
  current: Fit,
  kind: SlotKind,
): readonly FitChange[] => {
  const wanted = tally(entriesOf(saved, [kind]), true);
  const held = tally(entriesOf(current, [kind]), true);

  return toChanges(shortfall(wanted, held), shortfall(held, wanted));
};

/**
 * Finds which hold each item is kept in.
 *
 * @param saved - The saved fit, whose placement wins.
 * @param current - The fit the ship is flying, for items the saved fit lacks.
 * @returns The first hold each item appears in.
 */
const homes = (saved: Fit, current: Fit): ReadonlyMap<string, SlotKind> => {
  const home = new Map<string, SlotKind>();

  for (const fit of [saved, current]) {
    for (const section of fit.sections) {
      if (isSlotSection(section.kind)) continue;

      for (const entry of section.entries) {
        const name = spaced(entry.name);
        if (!home.has(name)) home.set(name, section.kind);
      }
    }
  }

  return home;
};

/**
 * Compares the holds: drone bay, fighter bay and cargo.
 *
 * The three are pooled before comparing. A fit with a single hold left does not
 * say which hold it is, so the parser cannot always tell a drone bay from cargo,
 * and comparing hold by hold would report drones as missing from one and
 * surplus in the other. Pooled, only a real difference in quantity shows. Each
 * change is then filed under the hold the saved fit keeps that item in.
 *
 * @param saved - The saved fit.
 * @param current - The fit the ship is flying.
 * @returns One section per hold that has changes.
 */
const compareHolds = (saved: Fit, current: Fit): FitDiff => {
  const wanted = tally(entriesOf(saved, HOLDS), false);
  const held = tally(entriesOf(current, HOLDS), false);
  const changes = toChanges(shortfall(wanted, held), shortfall(held, wanted));
  const home = homes(saved, current);

  return HOLDS.map((kind) => ({
    kind,
    changes: changes.filter(
      (change) => change.kind !== 'reload' && home.get(change.item) === kind,
    ),
  }));
};

/**
 * Works out how to bring a ship back to its saved fit.
 *
 * Modules are compared slot section by slot section, by type and loaded charge.
 * Hold contents are compared by total quantity per item, so a stack split in
 * two still counts as one amount. Offline state, slot order and the fit's name
 * are not compared. Neither is whitespace of any kind: blank lines, line
 * endings, indentation and the spacing inside a name never count as a
 * difference.
 *
 * @param saved - The fit to get back to.
 * @param current - The fit the ship is flying now. Should be for the same hull;
 * nothing here checks.
 * @returns The changes to make to `current`, section by section, or an empty
 * list when there is nothing to do.
 */
export const compareFits = (saved: Fit, current: Fit): FitDiff =>
  [
    ...SECTION_ORDER.filter((kind) => isSlotSection(kind)).map((kind) => ({
      kind,
      changes: compareSlots(saved, current, kind),
    })),
    ...compareHolds(saved, current),
  ].filter((section) => section.changes.length > 0);
