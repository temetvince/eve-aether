import type { JSX } from 'react';
import ShipCard from '../ShipCard/ShipCard';
import type { FleetGridProps } from './FleetGridProps';

/**
 * The commissioned fleet.
 *
 * @param props - See {@link FleetGridProps}.
 * @returns The fleet section, or an explanatory placeholder when empty.
 */
const FleetGrid = ({
  ships,
  onOpen,
  onDecommission,
  onClearAll,
}: FleetGridProps): JSX.Element => (
  <section
    className='fleet'
    aria-labelledby='fleet-heading'
  >
    <div className='fleet__head'>
      <h2 id='fleet-heading'>Active Fleet</h2>
      {ships.length > 0 && (
        <button
          type='button'
          className='btn btn--danger'
          onClick={onClearAll}
        >
          Clear All
        </button>
      )}
    </div>

    {ships.length === 0 ?
      <p className='fleet__empty'>
        No ships commissioned. Paste a fit above to add one.
      </p>
    : <div className='fleet__grid'>
        {ships.map((ship) => (
          <ShipCard
            key={ship.id}
            ship={ship}
            onOpen={onOpen}
            onDecommission={onDecommission}
          />
        ))}
      </div>
    }
  </section>
);

export default FleetGrid;
