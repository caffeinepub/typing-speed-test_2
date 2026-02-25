export type GamePhase = 'idle' | 'playing' | 'finished';

export type DifficultyPreset = 'slow' | 'medium' | 'fast';

export interface DifficultyConfig {
  baseWordSpeed: number;
  baseSpawnInterval: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyPreset, DifficultyConfig> = {
  slow: {
    baseWordSpeed: 28,
    baseSpawnInterval: 3600,
  },
  medium: {
    baseWordSpeed: 38,
    baseSpawnInterval: 2800,
  },
  fast: {
    baseWordSpeed: 58,
    baseSpawnInterval: 1800,
  },
};

export interface FallingWord {
  id: number;
  text: string;
  x: number;           // percentage 5–85
  y: number;           // pixels from top
  speed: number;       // pixels per second
  status: 'falling' | 'targeted' | 'destroying' | 'missed';
  typedIndex: number;  // how many chars have been correctly typed
}

export interface ScorePopup {
  id: number;
  x: number;
  y: number;
  points: number;
}

export interface ComboNotification {
  id: number;
  label: string;
  colorClass: string;
  flashClass: string;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  wordsDestroyed: number;
}
