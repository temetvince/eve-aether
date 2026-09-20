/**
 * Taking a file from the browser.
 */

/**
 * Reads a file the user picked as text.
 *
 * Never rejects, so a caller has one failure to handle rather than two.
 *
 * @param file - File to read.
 * @returns The contents, or `null` when the browser could not read the file.
 */
export const readText = async (file: File): Promise<string | null> => {
  try {
    return await file.text();
  } catch {
    return null;
  }
};
