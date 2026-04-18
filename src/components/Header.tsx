import React from 'react';

interface Props {
  registryCount: number;
  deployedCount: number;
  standbyCount: number;
}

const Header: React.FC<Props> = ({
  registryCount,
  deployedCount,
  standbyCount,
}) => {
  return (
    <header>
      <div className='logo'>
        <span className='logo-icon'>🌌</span>
        AETHER FLEET OPS
      </div>

      <div className='stats-bar'>
        <div className='stat'>
          <div className='stat-value'>{registryCount}</div>
          <div className='stat-label'>REGISTRY</div>
        </div>
        <div className='stat'>
          <div className='stat-value stat-deployed'>{deployedCount}</div>
          <div className='stat-label'>DEPLOYED</div>
        </div>
        <div className='stat'>
          <div className='stat-value stat-standby'>{standbyCount}</div>
          <div className='stat-label'>STANDBY</div>
        </div>
      </div>

      <div className='live-badge'>
        <span className='pulse-dot' />
        LIVE COMMAND NET
      </div>
    </header>
  );
};

export default Header;
