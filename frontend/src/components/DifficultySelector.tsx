import React from 'react';
import { DifficultyPreset } from '../types/game';

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyPreset;
  onSelectDifficulty: (difficulty: DifficultyPreset) => void;
}

const DIFFICULTY_OPTIONS: { value: DifficultyPreset; label: string; description: string }[] = [
  { value: 'slow', label: 'SLOW', description: 'Relaxed pace' },
  { value: 'medium', label: 'MEDIUM', description: 'Standard speed' },
  { value: 'fast', label: 'FAST', description: 'High velocity' },
];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-mono tracking-widest text-neon-cyan/60 uppercase">
        Select Difficulty
      </p>
      <div className="flex gap-3">
        {DIFFICULTY_OPTIONS.map((option) => {
          const isActive = selectedDifficulty === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelectDifficulty(option.value)}
              className={`
                relative px-5 py-3 font-arcade text-sm tracking-widest uppercase
                border transition-all duration-200 focus:outline-none
                ${isActive
                  ? option.value === 'slow'
                    ? 'border-green-400 text-green-400 bg-green-400/10 shadow-[0_0_12px_rgba(74,222,128,0.6),inset_0_0_8px_rgba(74,222,128,0.1)]'
                    : option.value === 'medium'
                    ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-[0_0_12px_rgba(0,255,255,0.6),inset_0_0_8px_rgba(0,255,255,0.1)]'
                    : 'border-orange-400 text-orange-400 bg-orange-400/10 shadow-[0_0_12px_rgba(251,146,60,0.6),inset_0_0_8px_rgba(251,146,60,0.1)]'
                  : 'border-white/20 text-white/40 bg-transparent hover:border-white/40 hover:text-white/60'
                }
              `}
            >
              <span className="block">{option.label}</span>
              <span className={`block text-[10px] mt-0.5 font-mono tracking-normal normal-case ${isActive ? 'opacity-80' : 'opacity-40'}`}>
                {option.description}
              </span>
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DifficultySelector;
