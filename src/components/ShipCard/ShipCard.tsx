import type { JSX } from 'react';
import { countDrones, countModules } from '../../domain/Fit';
import type { ShipCardProps } from './ShipCardProps';

/**
 * One ship in the fleet grid.
 *
 * The whole card is clickable for a pointer, but the only focusable control is
 * the ship's name, so the keyboard order stays one stop per ship rather than
 * two. The name button is stretched over the card with CSS instead of the card
 * carrying its own handler, which keeps the decommission button clickable and
 * keeps the card out of the tab order.
 *
 * @param props - See {@link ShipCardProps}.
 * @returns The card.
 */
const ShipCard = ({
  ship,
  onOpen,
  onDecommission,
}: ShipCardProps): JSX.Element => {
  const modules = countModules(ship.fit);
  const drones = countDrones(ship.fit);

  return (
    <article className='card'>
      <h3 className='card__name'>
        <button
          type='button'
          className='card__open'
          onClick={() => {
            onOpen(ship.id);
          }}
        >
          {ship.name}
        </button>
      </h3>

      <p className='card__hull'>{ship.fit.hull}</p>

      {ship.fit.title !== '' && <p className='card__title'>{ship.fit.title}</p>}

      <p className='card__meta'>
        {modules} {modules === 1 ? 'module' : 'modules'}
        {drones > 0 && (
          <>
            <span aria-hidden='true'> &middot; </span>
            {drones} {drones === 1 ? 'drone' : 'drones'}
          </>
        )}
      </p>

      <button
        type='button'
        className='card__scuttle'
        onClick={() => {
          onDecommission(ship.id);
        }}
      >
        <span aria-hidden='true'>&times;</span>
        <span className='sr-only'>Decommission {ship.name}</span>
      </button>
    </article>
  );
};

export default ShipCard;
