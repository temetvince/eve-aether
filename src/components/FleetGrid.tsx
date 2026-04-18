import React from 'react';
import { FleetItem } from '../types';

interface Props {
  inUse: FleetItem[];
  openEdit: (i: number) => void;
  destroyShip: (i: number) => void;
}

const FleetGrid: React.FC<Props> = ({ inUse, openEdit, destroyShip }) => (
  <div className='fleet-section'>
    <div className='section-header'>
      <h2 className='section-header-title'>ACTIVE FLEET</h2>
      <button
        onClick={() => {
          if (inUse.length && confirm('Destroy entire fleet?')) {
            destroyShip(-1);
          }
        }}
        className='clear-all-btn'
      >
        ☠️ CLEAR ALL
      </button>
    </div>

    <div className='fleet-grid'>
      {inUse.map((item, i) => (
        <div
          key={i}
          className='fleet-card'
          onClick={() => {
            openEdit(i);
          }}
        >
          <div className='ship-name'>{item.shipName}</div>
          {item.hull && (
            <div className='hull-badge'>
              <span>🛡️</span> {item.hull}
            </div>
          )}
          {!item.hull && (
            <div className='muted-text mb-1'>No hull assigned</div>
          )}

          {item.tags.length > 0 && (
            <div className='tag-pills'>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className='tag-pill'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              destroyShip(i);
            }}
            className='destroy-btn'
          >
            ✕
          </button>
        </div>
      ))}

      {inUse.length === 0 && (
        <div className='no-ships'>
          No ships in active fleet.
          <br />
          <span className='small-icon'>Deploy from the launch bay above</span>
        </div>
      )}
    </div>
  </div>
);

export default FleetGrid;
