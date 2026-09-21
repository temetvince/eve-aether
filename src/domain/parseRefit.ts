import type { FitParseResult } from './Fit';
import { parseFit, withHullSpelling } from './parseFit';
import { sameHull } from './text';

/**
 * Parses a fit that has to be for the hull a ship already flies.
 *
 * Hull names are compared ignoring case and whitespace. Like {@link parseFit},
 * this never throws.
 *
 * The ship's spelling of the hull always wins. It arrived from the game when
 * the ship was commissioned, so an accepted fit whose header spells the hull
 * differently is re-spelled to match, in its text as well as its `hull`. A
 * header that already matches leaves the text exactly as pasted.
 *
 * @param currentHull - Hull of the ship, as the ship spells it.
 * @param raw - Text pasted by the user.
 * @param advice - A sentence on what to do instead, shown after the refusal
 * when the fit is for a different hull.
 * @returns The parsed fit with `hull` equal to `currentHull`, or the reason it
 * was refused: either the text is not a fit at all, or it is a fit for a
 * different hull.
 */
const parseForHull = (
  currentHull: string,
  raw: string,
  advice: string,
): FitParseResult => {
  const parsed = parseFit(raw);
  if (!parsed.ok) return parsed;

  if (!sameHull(parsed.fit.hull, currentHull)) {
    return {
      ok: false,
      reason: `That fit is for a ${parsed.fit.hull}, and this ship is a ${currentHull}. ${advice}`,
    };
  }

  return parsed.fit.hull === currentHull ?
      parsed
    : { ok: true, fit: withHullSpelling(parsed.fit, currentHull) };
};

/**
 * Parses a replacement fit for a ship that already exists.
 *
 * A ship is its hull, so a refit must be for the hull the ship already flies.
 *
 * @param currentHull - Hull of the ship being refitted, as the ship spells it.
 * @param raw - Text pasted by the user.
 * @returns The parsed fit with `hull` equal to `currentHull`, or the reason it
 * was refused. Never throws.
 */
export const parseRefit = (currentHull: string, raw: string): FitParseResult =>
  parseForHull(currentHull, raw, 'Commission a new ship for a different hull.');

/**
 * Parses the fit a ship is flying now, for comparing against its saved fit.
 *
 * Comparing fits for two different hulls would report nearly everything as
 * different and say nothing useful, so the hull has to match.
 *
 * @param currentHull - Hull of the ship being compared, as the ship spells it.
 * @param raw - Text pasted by the user.
 * @returns The parsed fit with `hull` equal to `currentHull`, or the reason it
 * was refused. Never throws.
 */
export const parseCurrentFit = (
  currentHull: string,
  raw: string,
): FitParseResult =>
  parseForHull(
    currentHull,
    raw,
    'Open the ship it belongs to and compare it there.',
  );
