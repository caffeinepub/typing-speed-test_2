import React from 'react';

interface GameInputBarProps {
  typedText: string;
  targetWordText: string | null;
  hasError: boolean;
  // React 19: useRef<T>(null) returns RefObject<T | null>
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const GameInputBar: React.FC<GameInputBarProps> = ({
  typedText,
  targetWordText,
  hasError,
  inputRef,
  onInputChange,
  onKeyDown,
}) => {
  const matchedPart = targetWordText ? typedText.slice(0, targetWordText.length) : typedText;

  return (
    <div className="game-input-bar">
      <div className="game-input-inner">
        {targetWordText ? (
          <div className="input-target-hint font-arcade">
            <span className="input-target-label">TARGET: </span>
            <span className="input-target-matched">{targetWordText.slice(0, typedText.length)}</span>
            <span className="input-target-remaining">{targetWordText.slice(typedText.length)}</span>
          </div>
        ) : (
          <div className="input-target-hint font-arcade">
            <span className="input-target-label">TYPE TO LOCK ON...</span>
          </div>
        )}
        <div className={`neon-input-wrapper ${hasError ? 'input-error-flash' : ''}`}>
          <span className="neon-input-prefix">▶</span>
          <input
            ref={inputRef}
            type="text"
            value={typedText}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            className="neon-input-field"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="start typing..."
          />
          <span className="neon-input-cursor" />
        </div>
        {targetWordText && (
          <div className="input-match-display font-mono-code">
            {matchedPart.split('').map((ch, i) => (
              <span key={i} className="char-matched-input">{ch}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInputBar;
