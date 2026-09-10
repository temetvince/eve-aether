import { useEffect, useRef, type JSX } from 'react';
import type { ModalProps } from './ModalProps';

/**
 * A modal dialog.
 *
 * Built on the native `<dialog>` element, so the platform supplies the focus
 * trap, the Escape key, the inertness of the page behind, and the restoration
 * of focus on close. None of that is re-implemented here, and none of it can
 * drift.
 *
 * The parent decides whether the dialog exists: render it to open it, and
 * unmount it from {@link ModalProps.onClose}.
 *
 * @param props - See {@link ModalProps}.
 * @returns The dialog.
 */
const Modal = ({
  title,
  subtitle,
  children,
  footer,
  onClose,
}: ModalProps): JSX.Element => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null || dialog.open) return;
    dialog.showModal();
  }, []);

  return (
    // Dismissing by backdrop is a pointer convenience layered on top of the two
    // routes that already close this dialog for everyone: the Escape key, which
    // `<dialog>` handles natively, and the close button below. It adds no
    // capability a keyboard user lacks, which is what these rules exist to
    // prevent.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      className='modal'
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // A click landing on the dialog itself rather than on its contents came
        // from the backdrop, which fills the rest of the viewport.
        if (event.target === ref.current) ref.current?.close();
      }}
    >
      <div className='modal__panel'>
        <header className='modal__head'>
          <div>
            <h2 className='modal__title'>{title}</h2>
            {subtitle !== undefined && subtitle !== '' && (
              <p className='modal__subtitle'>{subtitle}</p>
            )}
          </div>
          <button
            type='button'
            className='icon-btn'
            onClick={() => ref.current?.close()}
          >
            <span aria-hidden='true'>&times;</span>
            <span className='sr-only'>Close</span>
          </button>
        </header>

        <div className='modal__body'>{children}</div>

        {footer !== undefined && (
          <footer className='modal__foot'>{footer}</footer>
        )}
      </div>
    </dialog>
  );
};

export default Modal;
