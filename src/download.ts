/**
 * Handing a generated file to the browser.
 */

/**
 * Downloads text as a file.
 *
 * Creates and revokes its own object URL, so it leaks nothing.
 *
 * @param filename - Name to save the file under.
 * @param text - File contents, saved as JSON.
 */
export const download = (filename: string, text: string): void => {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'application/json' }),
  );
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

/**
 * Builds the filename for a fleet export.
 *
 * @returns A name carrying a UTC timestamp, so exports sort chronologically and
 * two exports never collide.
 */
export const exportName = (): string =>
  `aether-${new Date().toISOString().replaceAll(/[:.]/gu, '-')}-fleet.json`;
