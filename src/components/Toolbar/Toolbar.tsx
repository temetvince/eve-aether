import type { JSX } from 'react';
import FileButton from '../FileButton/FileButton';
import type { ToolbarProps } from './ToolbarProps';

/**
 * Fleet-wide actions.
 *
 * @param props - See {@link ToolbarProps}.
 * @returns The toolbar navigation landmark.
 */
const Toolbar = ({
  onOpenRegistry,
  onImport,
  onExport,
  canExport,
}: ToolbarProps): JSX.Element => (
  <nav
    className='toolbar'
    aria-label='Fleet actions'
  >
    <button
      type='button'
      className='btn'
      onClick={onOpenRegistry}
    >
      Name registry
    </button>

    <FileButton
      label='Import fleet'
      accept='application/json,.json'
      onPick={onImport}
    />

    <button
      type='button'
      className='btn'
      onClick={onExport}
      disabled={!canExport}
    >
      Export fleet
    </button>
  </nav>
);

export default Toolbar;
