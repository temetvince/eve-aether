import type { ReactNode } from 'react';

/** Contract for {@link Modal}. */
export interface ModalProps {
  /** Accessible name for the dialog, shown as its heading. */
  readonly title: string;
  /** Optional line under the heading giving context. */
  readonly subtitle?: string | undefined;
  /** Body content. */
  readonly children: ReactNode;
  /** Buttons for the footer bar. Omit for a dialog with no actions. */
  readonly footer?: ReactNode | undefined;
  /**
   * Called once the dialog has closed, by any route: the close button, the
   * backdrop, or the Escape key.
   *
   * The parent owns whether the dialog is mounted and must unmount it here.
   */
  readonly onClose: () => void;
}
