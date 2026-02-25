export interface FallingWord {
  id: number;
  text: string;
  x: number; // percentage 5–85
  y: number; // pixels from top
  speed: number; // pixels per second
  status: 'falling' | 'targeted' | 'destroying' | 'missed';
  typedIndex: number; // how many chars have been correctly typed
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

export type GamePhase = 'idle' | 'playing' | 'finished';

export interface GameStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  wordsDestroyed: number;
}
