import React from 'react';
import type { ScorePopup } from '../types/game';

interface FloatingScorePopupProps {
  popup: ScorePopup;
}

const FloatingScorePopup: React.FC<FloatingScorePopupProps> = ({ popup }) => {
  return (
    <div
      className="score-popup-float font-arcade"
      style={{
        left: `${popup.x}%`,
        top: `${popup.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      +{popup.points}
    </div>
  );
};

export default FloatingScorePopup;
