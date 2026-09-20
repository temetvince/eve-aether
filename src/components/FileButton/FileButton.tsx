import { useRef, type JSX } from 'react';
import type { FileButtonProps } from './FileButtonProps';

/**
 * A button that opens the system file picker.
 *
 * It is a styled `<label>` around a real file input rather than a button that
 * clicks a hidden one. The input stays in the tab order and is announced as a
 * file control, and the label shows the focus ring on its behalf.
 *
 * @param props - See {@link FileButtonProps}.
 * @returns The control.
 */
const FileButton = ({
  label,
  accept,
  onPick,
}: FileButtonProps): JSX.Element => {
  const input = useRef<HTMLInputElement>(null);

  return (
    <label className='btn'>
      {label}
      <input
        className='sr-only'
        ref={input}
        type='file'
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file !== undefined) onPick(file);
          // Clear the value so choosing the same file twice fires again.
          if (input.current !== null) input.current.value = '';
        }}
      />
    </label>
  );
};

export default FileButton;
