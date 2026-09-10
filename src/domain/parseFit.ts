import {
  isSlotSection,
  type Fit,
  type FitEntry,
  type FitParseResult,
  type FitSection,
  type SlotKind,
} from './Fit';

/**
 * Reads the EFT-style text the EVE client puts on the clipboard.
 *
 * The format is a header line naming the hull and the fit, then blocks of
 * module names separated by blank lines.
 *
 * How many blank lines fall between two blocks is not dependable, so the parser
 * leans on block order and block contents instead. It also keeps the text it
 * was given verbatim, so a fit it reads imperfectly can still be handed back to
 * the game unchanged.
 */

/** `[Prospect, Prospect Gas Fast Kites Rats]` — hull before the first comma. */
const HEADER = /^\[\s*([^,\]]+?)\s*,\s*(.*?)\s*\]$/u;

/** `[Empty Low slot]`, written by the client for a slot left unfilled. */
const EMPTY_SLOT = /^\[empty\s+.*\bslot\]$/iu;

/** ` x16` — a stack count, only ever written on drone, fighter and cargo lines. */
const QUANTITY = /\s+x(\d+)$/u;

/** ` /OFFLINE` — a module exported in the offline state. */
const OFFLINE = /\s*\/OFFLINE$/iu;

/** A blank-line-delimited run of lines from the body of a fit. */
type Block = readonly string[];

/**
 * Splits the body of a fit into its blank-line-delimited blocks.
 *
 * Empty blocks are dropped. The client uses one to say "this hull has no such
 * section", but that signal does not survive a round trip through an editor or
 * a chat window, so the parser does not depend on it.
 *
 * @param lines - Body lines, with the header already removed.
 * @returns One entry per block, in file order.
 */
const splitBlocks = (lines: readonly string[]): readonly Block[] => {
  const blocks: string[][] = [[]];

  for (const line of lines) {
    if (line === '') {
      blocks.push([]);
    } else {
      blocks.at(-1)?.push(line);
    }
  }

  return blocks.filter((block) => block.length > 0);
};

/**
 * Reads one body line into an entry.
 *
 * Suffixes are stripped in the order the client writes them: the offline marker
 * last, then the stack count, leaving `Module, Charge` to split on its comma.
 *
 * @param line - A non-blank line that is not an empty-slot placeholder.
 * @returns The parsed entry; `quantity` is at least `1`.
 */
const parseEntry = (line: string): FitEntry => {
  const offline = OFFLINE.test(line);
  const withoutOffline = line.replace(OFFLINE, '');

  const quantityMatch = QUANTITY.exec(withoutOffline);
  const quantity = Number(quantityMatch?.[1] ?? '1');
  const withoutQuantity = withoutOffline.replace(QUANTITY, '');

  const comma = withoutQuantity.indexOf(',');
  const name = comma === -1 ? withoutQuantity : withoutQuantity.slice(0, comma);
  const charge = comma === -1 ? null : withoutQuantity.slice(comma + 1).trim();

  return {
    name: name.trim(),
    charge: charge === null || charge === '' ? null : charge,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    offline,
  };
};

/** Number of slot sections that always precede the subsystems: low, mid, high, rig. */
const FIXED_SLOTS: readonly SlotKind[] = ['low', 'mid', 'high', 'rig'];

/** The holds, in the order the client writes them. */
const HOLDS: readonly SlotKind[] = ['drone', 'fighter', 'cargo'];

/** Whether a line carries a stack count, which only a hold entry ever does. */
const hasQuantity = (line: string): boolean =>
  QUANTITY.test(line.replace(OFFLINE, ''));

/**
 * Labels each block with the section it describes.
 *
 * The number of blank lines between sections is not dependable — text that has
 * been through an editor or a chat client loses the empty blocks that say "this
 * hull has no such section" — so blocks are identified by their order and their
 * contents rather than by absolute position.
 *
 * Three facts carry the whole classification:
 *
 * 1. Low, mid, high and rig always come first, in that order, on every hull.
 * 2. A stack count can only appear in a hold, never in a slot, so the first
 *    block past the rigs that carries one is where the holds begin.
 * 3. Anything between the rigs and that point is subsystems, which only tech 3
 *    cruisers have.
 *
 * The holds are then matched against `drone, fighter, cargo` by count, since
 * cargo is always written last.
 *
 * @param blocks - Blocks in file order.
 * @returns One {@link SlotKind} per block, positionally aligned with `blocks`.
 */
const assignKinds = (blocks: readonly Block[]): readonly SlotKind[] => {
  const holdStart = blocks.findIndex((block) =>
    block.some((line) => hasQuantity(line)),
  );

  // A slot section carrying a stack count means the input has lost structure
  // the parser cannot recover. Keep the contents rather than mislabel them as
  // modules: read everything from that point on as cargo.
  if (holdStart !== -1 && holdStart < FIXED_SLOTS.length) {
    return blocks.map((_, index) => FIXED_SLOTS[index] ?? 'cargo');
  }

  const firstHold = holdStart === -1 ? blocks.length : holdStart;
  const lastHold = blocks.length - 1;

  return blocks.map((_, index) => {
    if (index < FIXED_SLOTS.length) return FIXED_SLOTS[index] ?? 'cargo';
    if (index < firstHold) return 'subsystem';
    // Cargo is always written last; the holds before it fill from the left, so
    // a fit with one hold is cargo and a fit with two is a drone bay and cargo.
    if (index === lastHold) return 'cargo';
    return HOLDS[index - firstHold] ?? 'cargo';
  });
};

/**
 * Turns one labelled block into a section.
 *
 * @param kind - Section the block describes.
 * @param block - Lines of the block.
 * @returns The section; `emptySlots` is always `0` for a hold, since a hold has
 * no fixed capacity to leave unfilled.
 */
const toSection = (kind: SlotKind, block: Block): FitSection => {
  const filled = block.filter((line) => !EMPTY_SLOT.test(line));

  return {
    kind,
    entries: filled.map((line) => parseEntry(line)),
    emptySlots: isSlotSection(kind) ? block.length - filled.length : 0,
  };
};

/**
 * Parses a fitting copied from the EVE client.
 *
 * Never throws: malformed input comes back as a failed result carrying a reason
 * fit to show the user. On success `fit.source` is the input verbatim, so the
 * fit can always be copied back into the game unchanged even if a section was
 * interpreted imperfectly.
 *
 * @param raw - Text pasted by the user. Any line endings; may be padded with
 * blank lines at either end.
 * @returns A {@link Fit}, or the reason the text could not be read as one.
 */
export const parseFit = (raw: string): FitParseResult => {
  const lines = raw
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .split('\n')
    .map((line) => line.trim());

  const headerIndex = lines.findIndex((line) => line !== '');

  if (headerIndex === -1) {
    return { ok: false, reason: 'Nothing to read — paste a fit first.' };
  }

  const header = HEADER.exec(lines[headerIndex] ?? '');

  if (header === null) {
    return {
      ok: false,
      reason:
        'That does not start with a fit header. The first line should look like [Prospect, My Fit].',
    };
  }

  const hull = header[1]?.trim() ?? '';
  const title = header[2]?.trim() ?? '';

  if (hull === '') {
    return { ok: false, reason: 'The fit header does not name a hull.' };
  }

  const blocks = splitBlocks(lines.slice(headerIndex + 1));
  const kinds = assignKinds(blocks);

  const sections = blocks
    .map((block, index) => toSection(kinds[index] ?? 'cargo', block))
    .filter((section) => section.entries.length > 0 || section.emptySlots > 0);

  if (sections.length === 0) {
    return {
      ok: false,
      reason: `No modules found under the header for ${hull}.`,
    };
  }

  const fit: Fit = { hull, title, sections, source: raw.trim() };

  return { ok: true, fit };
};
