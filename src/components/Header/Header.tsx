import type { JSX } from 'react';
import type { HeaderProps } from './HeaderProps';

/**
 * The site banner: the app's name and a running count of the fleet.
 *
 * Carries the page's only `h1`.
 *
 * @param props - See {@link HeaderProps}.
 * @returns The banner landmark.
 */
const Header = ({
  fleetCount,
  registryCount,
  availableCount,
}: HeaderProps): JSX.Element => (
  <header className='banner'>
    <h1 className='banner__logo'>
      <span
        className='banner__glyph'
        aria-hidden='true'
      >
        &#9678;
      </span>
      Aether Fleet Ops
    </h1>

    <dl className='stats'>
      <div className='stat'>
        <dt className='stat__label'>Fleet</dt>
        <dd className='stat__value'>{fleetCount}</dd>
      </div>
      <div className='stat'>
        <dt className='stat__label'>Registry</dt>
        <dd className='stat__value'>{registryCount}</dd>
      </div>
      <div className='stat'>
        <dt className='stat__label'>Available</dt>
        <dd className='stat__value'>{availableCount}</dd>
      </div>
    </dl>
  </header>
);

export default Header;
