import { distinctNames } from '../domain/text';
import nameTable from '../../public/names.json';

/**
 * The ship names the app ships with.
 *
 * This is the starting registry, and what "restore defaults" restores to. The
 * player is free to add to it or clear it entirely.
 */
export const DEFAULT_NAMES: readonly string[] = distinctNames(nameTable);
