import React, { useState } from 'react';

interface Props {
  currentRandom: string | null;
  onNewCandidate: () => void;
  onDeploy: () => void;
  onDeployName?: (name: string) => void;
}

const LaunchBay: React.FC<Props> = ({
  currentRandom,
  onNewCandidate,
  onDeploy,
  onDeployName,
}) => (
  <div className='launch-bay'>
    <div className='launch-header'>
      <div>NEXT AVAILABLE CANDIDATE</div>
      <button
        onClick={onNewCandidate}
        className='candidate-btn'
      >
        ⟳ NEW CANDIDATE
      </button>
    </div>
    <LaunchInner
      currentRandom={currentRandom}
      onDeploy={onDeploy}
      onDeployName={onDeployName}
    />
  </div>
);

const LaunchInner: React.FC<{
  currentRandom: string | null;
  onDeploy: () => void;
  onDeployName?: (name: string) => void;
}> = ({ currentRandom, onDeploy, onDeployName }) => {
  const [editName, setEditName] = useState(currentRandom ?? '');

  React.useEffect(() => {
    setEditName(currentRandom ?? '');
  }, [currentRandom]);

  return currentRandom ?
      <>
        <input
          className='random-name-input glow-text'
          value={editName}
          onChange={(e) => {
            setEditName(e.target.value);
          }}
          aria-label='candidate-name'
        />
        <button
          onClick={() => {
            const name = editName.trim();
            if (!name) return;
            if (onDeployName) {
              onDeployName(name);
            } else {
              onDeploy();
            }
          }}
          className='deploy-btn'
        >
          DEPLOY TO ACTIVE FLEET
        </button>
      </>
    : <div className='launch-empty'>
        <div className='empty-icon'>🌌</div>
        <p>ALL SHIPS DEPLOYED</p>
      </div>;
};

export default LaunchBay;
