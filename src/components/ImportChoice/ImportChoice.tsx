import type { JSX } from 'react';
import Modal from '../Modal/Modal';
import type { ImportChoiceProps } from './ImportChoiceProps';

/**
 * Asks whether an import should merge with what is already there or overwrite
 * it.
 *
 * Both answers are spelled out before either is taken, so the choice is made
 * knowing what it will add and what it will cost. Closing the dialog is the
 * third answer and changes nothing. The dialog knows nothing of what is being
 * imported; every word it shows comes from its props.
 *
 * @param props - See {@link ImportChoiceProps}.
 * @returns The dialog.
 */
const ImportChoice = ({
  title,
  subtitle,
  lead,
  merge,
  overwrite,
  canMerge,
  onMerge,
  onOverwrite,
  onClose,
}: ImportChoiceProps): JSX.Element => (
  <Modal
    title={title}
    subtitle={subtitle}
    onClose={onClose}
    footer={
      <>
        <button
          type='button'
          className='btn'
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type='button'
          className='btn btn--danger'
          onClick={onOverwrite}
        >
          Overwrite
        </button>
        <button
          type='button'
          className='btn btn--primary'
          onClick={onMerge}
          disabled={!canMerge}
        >
          Merge
        </button>
      </>
    }
  >
    <p className='choice__lead'>{lead}</p>

    <dl className='choice'>
      <dt className='choice__name'>Merge</dt>
      <dd className='choice__outcome'>{merge}</dd>

      <dt className='choice__name'>Overwrite</dt>
      <dd className='choice__outcome'>{overwrite}</dd>
    </dl>
  </Modal>
);

export default ImportChoice;
