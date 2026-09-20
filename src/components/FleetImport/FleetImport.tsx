import type { JSX } from 'react';
import Modal from '../Modal/Modal';
import type { FleetImportProps } from './FleetImportProps';

/**
 * Counts ships in words.
 *
 * @param count - How many.
 * @returns The count followed by `ship` or `ships`.
 */
const ships = (count: number): string =>
  `${String(count)} ${count === 1 ? 'ship' : 'ships'}`;

/**
 * Copy describing what a merge would do.
 *
 * @param addCount - Ships a merge would add.
 * @param skipCount - Ships a merge would leave out.
 * @returns One or two sentences, never empty.
 */
const mergeOutcome = (addCount: number, skipCount: number): string => {
  if (addCount === 0) {
    return 'There is nothing to merge. Every name in the file is already taken.';
  }

  const added = `Adds ${ships(addCount)} to your fleet and removes nothing.`;
  if (skipCount === 0) return added;

  return `${added} Skips ${ships(skipCount)} whose ${
    skipCount === 1 ? 'name is' : 'names are'
  } already taken.`;
};

/**
 * Asks what to do with an imported fleet when there is already a fleet.
 *
 * Both answers are spelled out with the numbers involved, so the choice is made
 * knowing what it will add and what it will cost. Closing the dialog is the
 * third answer and changes nothing.
 *
 * @param props - See {@link FleetImportProps}.
 * @returns The dialog.
 */
const FleetImport = ({
  currentCount,
  incomingCount,
  addCount,
  onMerge,
  onOverwrite,
  onClose,
}: FleetImportProps): JSX.Element => (
  <Modal
    title='Import Fleet'
    subtitle={`${ships(incomingCount)} in the file`}
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
          disabled={addCount === 0}
        >
          Merge
        </button>
      </>
    }
  >
    <p className='choice__lead'>
      You already have {ships(currentCount)}. Choose what happens to them.
    </p>

    <dl className='choice'>
      <dt className='choice__name'>Merge</dt>
      <dd className='choice__outcome'>
        {mergeOutcome(addCount, incomingCount - addCount)}
      </dd>

      <dt className='choice__name'>Overwrite</dt>
      <dd className='choice__outcome'>
        Decommissions your {ships(currentCount)} and replaces{' '}
        {currentCount === 1 ? 'it' : 'them'} with the {ships(incomingCount)} in
        the file.
      </dd>
    </dl>
  </Modal>
);

export default FleetImport;
