import React from 'react';
import { FleetItem } from '../types';
import { importFleetFromFile } from '../utils/fleet';

interface Props {
  view: 'dashboard' | 'registry';
  setView: (v: 'dashboard' | 'registry') => void;
  onExport: () => void;
  openManage: () => void;
  onImport?: (fleet: FleetItem[]) => void;
  openHullRegistry?: () => void;
  openTagRegistry?: () => void;
}

const Sidebar: React.FC<Props> = ({
  view,
  setView,
  onExport,
  openManage,
  onImport,
  openHullRegistry,
  openTagRegistry,
}) => (
  <div className='sidebar'>
    <div
      onClick={() => {
        setView('dashboard');
      }}
      className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
    >
      <span className='icon-large'>🚀</span>
      <span>COMMAND DASHBOARD</span>
    </div>
    <div
      onClick={() => {
        openManage();
      }}
      className='nav-item'
    >
      <span className='icon-large'>📜</span>
      <span>SHIP REGISTRY</span>
    </div>
    <div
      onClick={() => {
        if (openHullRegistry) openHullRegistry();
      }}
      className='nav-item'
    >
      <span className='icon-large'>🛳️</span>
      <span>HULL REGISTRY</span>
    </div>
    <div
      onClick={() => {
        if (openTagRegistry) openTagRegistry();
      }}
      className='nav-item'
    >
      <span className='icon-large'>🏷️</span>
      <span>TAG REGISTRY</span>
    </div>
    <div
      onClick={onExport}
      className='nav-item'
    >
      <span className='icon-large'>📤</span>
      <span>EXPORT FLEET</span>
    </div>

    <label className='nav-item clickable'>
      <input
        type='file'
        accept='application/json'
        className='hidden-file-input'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          void importFleetFromFile(f)
            .then((fleet) => {
              if (fleet && fleet.length) {
                onImport?.(fleet);
              }
            })
            .catch(() => {});
          e.currentTarget.value = '';
        }}
      />
      <span className='icon-large'>📥</span>
      <span>IMPORT FLEET</span>
    </label>

    <div className='sidebar-footer'>
      AETHER FLEET OPS v1.0.0
      <br />
      EVE Online inspired • Data saved locally
    </div>
  </div>
);

export default Sidebar;
