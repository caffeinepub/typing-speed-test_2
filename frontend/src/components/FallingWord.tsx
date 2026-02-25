import React from 'react';
import type { FallingWord as FallingWordType } from '../types/game';

interface FallingWordProps {
  word: FallingWordType;
  isTargeted: boolean;
}

const FallingWord: React.FC<FallingWordProps> = ({ word, isTargeted }) => {
  const matched = word.text.slice(0, word.typedIndex);
  const remaining = word.text.slice(word.typedIndex);

  let containerClass = 'falling-word';
  if (word.status === 'targeted') containerClass += ' word-locked';
  if (word.status === 'destroying') containerClass += ' word-explode';
  if (word.status === 'missed') containerClass += ' word-missed';

  return (
    <div
      className={containerClass}
      style={{
        left: `${word.x}%`,
        top: `${word.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <span className="char-matched">{matched}</span>
      <span className={isTargeted ? 'char-remaining-targeted' : 'char-remaining'}>{remaining}</span>
    </div>
  );
};

export default FallingWord;
