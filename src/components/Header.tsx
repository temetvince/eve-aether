import React from 'react';

interface Props {
  registryCount: number;
  deployedCount: number;
  standbyCount: number;
  onToggleSidebar?: () => void;
}

const Header: React.FC<Props> = ({
  registryCount,
  deployedCount,
  standbyCount,
  onToggleSidebar,
}) => {
  return (
    <header>
      <button
        className='hamburger-btn'
        aria-label='Toggle menu'
        onClick={() => {
          if (onToggleSidebar) onToggleSidebar();
        }}
      >
        ☰
      </button>
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

      <a
        className='live-badge'
        href='https://astralaide.com'
        aria-label='Navigate to astralaide.com'
      >
        <span className='pulse-dot' />
        Navigate to astralaide.com
      </a>
    </header>
  );
};

export default Header;
