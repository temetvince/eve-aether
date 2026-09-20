/**
 * Narrowing values that arrive from outside the type system.
 *
 * `localStorage` and imported files can hold anything, so everything read from
 * them starts as `unknown` and is narrowed here rather than asserted.
 */

/**
 * Recognises any non-null object as something with readable properties.
 *
 * Every property still reads as `unknown`, so this widens what can be indexed
 * without claiming anything about what is inside.
 *
 * @param value - Candidate of unknown type.
 * @returns `true` when `value` is a non-null object.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
