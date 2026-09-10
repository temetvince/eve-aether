import { useRef, type JSX } from 'react';
import type { ToolbarProps } from './ToolbarProps';

/**
 * Fleet-wide actions.
 *
 * Import is a styled `<label>` driving a real file input rather than a button
 * that clicks a hidden one, so it is reachable by keyboard and announced as a
 * file control.
 *
 * @param props - See {@link ToolbarProps}.
 * @returns The toolbar navigation landmark.
 */
const Toolbar = ({
  onOpenRegistry,
  onImport,
  onExport,
  canExport,
}: ToolbarProps): JSX.Element => {
  const input = useRef<HTMLInputElement>(null);

  return (
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

      <label className='btn'>
        Import fleet
        <input
          className='sr-only'
          ref={input}
          type='file'
          accept='application/json,.json'
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file !== undefined) onImport(file);
            // Clear the value so choosing the same file twice fires again.
            if (input.current !== null) input.current.value = '';
          }}
        />
      </label>

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
};

export default Toolbar;
