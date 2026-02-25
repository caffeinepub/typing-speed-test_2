import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Heart, Zap, Target, Trophy, TrendingUp, Crosshair, Gauge } from 'lucide-react';
import FallingWord from './components/FallingWord';
import FloatingScorePopup from './components/FloatingScorePopup';
import GameInputBar from './components/GameInputBar';
import DifficultySelector from './components/DifficultySelector';
import { getWordForLevel } from './data/wordLists';
import type {
  FallingWord as FallingWordType,
  ScorePopup,
  ComboNotification,
  GamePhase,
  GameStats,
  DifficultyPreset,
} from './types/game';
import { DIFFICULTY_PRESETS } from './types/game';

const MAX_LIVES = 3;
const PLAY_FIELD_HEIGHT = 520;
const WORD_BOTTOM_THRESHOLD = PLAY_FIELD_HEIGHT - 40;

// Per-level scaling config — values are multiplied on top of the preset baseline
const LEVEL_SCALE: Record<number, { spawnMultiplier: number; speedMultiplier: number }> = {
  1:  { spawnMultiplier: 1.00, speedMultiplier: 1.00 },
  2:  { spawnMultiplier: 0.90, speedMultiplier: 1.12 },
  3:  { spawnMultiplier: 0.80, speedMultiplier: 1.26 },
  4:  { spawnMultiplier: 0.72, speedMultiplier: 1.42 },
  5:  { spawnMultiplier: 0.65, speedMultiplier: 1.60 },
  6:  { spawnMultiplier: 0.58, speedMultiplier: 1.80 },
  7:  { spawnMultiplier: 0.52, speedMultiplier: 2.02 },
  8:  { spawnMultiplier: 0.47, speedMultiplier: 2.26 },
  9:  { spawnMultiplier: 0.43, speedMultiplier: 2.52 },
  10: { spawnMultiplier: 0.40, speedMultiplier: 2.80 },
};

function getLevelScale(level: number) {
  const clamped = Math.min(level, 10);
  return LEVEL_SCALE[clamped] || LEVEL_SCALE[10];
}

function getMultiplier(streak: number): number {
  if (streak >= 50) return 5;
  if (streak >= 25) return 3;
  if (streak >= 10) return 2;
  return 1;
}

function getMultiplierClass(multiplier: number): string {
  if (multiplier >= 5) return 'multiplier-x5';
  if (multiplier >= 3) return 'multiplier-x3';
  if (multiplier >= 2) return 'multiplier-x2';
  return 'multiplier-x1';
}

// Starfield
function Starfield() {
  const stars = useRef<Array<{ x: number; y: number; size: number; duration: number; delay: number }>>([]);
  if (stars.current.length === 0) {
    for (let i = 0; i < 80; i++) {
      stars.current.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5,
      });
    }
  }
  return (
    <div className="stars-container">
      {stars.current.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// HUD Panel
function HudPanel({
  icon: Icon,
  label,
  value,
  unit,
  colorClass = '',
  urgent = false,
  bump = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit?: string;
  colorClass?: string;
  urgent?: boolean;
  bump?: boolean;
}) {
  return (
    <div className={`hud-panel p-2 flex flex-col items-center gap-0.5 transition-all duration-200 ${urgent ? 'hud-panel-urgent' : ''}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className="text-muted-foreground" />
        <span className="font-arcade text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className={`font-arcade text-lg font-bold leading-none transition-all duration-150 ${urgent ? 'text-destructive' : colorClass || 'neon-text-cyan'} ${bump ? 'animate-multiplier-bump' : ''}`}>
        {value}
        {unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

// Lives display
function LivesDisplay({ lives }: { lives: number }) {
  return (
    <div className="hud-panel p-2 flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 mb-0.5">
        <Heart size={10} className="text-muted-foreground" />
        <span className="font-arcade text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Lives</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: MAX_LIVES }).map((_, i) => (
          <Heart
            key={i}
            size={14}
            className={i < lives ? 'lives-heart-active' : 'lives-heart-lost'}
            fill={i < lives ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    </div>
  );
}

// Results Overlay
function ResultsOverlay({
  stats,
  score,
  isGameOver,
  onRestart,
}: {
  stats: GameStats;
  score: number;
  isGameOver: boolean;
  onRestart: () => void;
}) {
  const getGrade = (wpm: number) => {
    if (wpm >= 80) return { label: 'ELITE PILOT', colorClass: 'neon-text-magenta' };
    if (wpm >= 60) return { label: 'ACE TYPIST', colorClass: 'neon-text-cyan' };
    if (wpm >= 40) return { label: 'NAVIGATOR', colorClass: 'neon-text-green' };
    if (wpm >= 20) return { label: 'CADET', colorClass: 'neon-text-yellow' };
    return { label: 'RECRUIT', colorClass: 'text-muted-foreground' };
  };
  const grade = getGrade(stats.wpm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 results-overlay animate-fade-in-up">
      <div className="results-card rounded-none p-8 max-w-lg w-full text-center animate-scale-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/60" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/60" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/60" />

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-glow-pulse" />
            {isGameOver ? (
              <Crosshair size={32} className="neon-text-magenta relative z-10" />
            ) : (
              <Trophy size={32} className="neon-text-cyan relative z-10" />
            )}
          </div>
        </div>

        <h2 className={`font-arcade text-2xl font-bold mb-1 tracking-widest ${isGameOver ? 'neon-text-magenta' : 'neon-text-cyan'}`}>
          {isGameOver ? 'GAME OVER' : 'MISSION COMPLETE'}
        </h2>
        <p className={`font-arcade text-sm font-semibold mb-6 ${grade.colorClass}`}>{grade.label}</p>

        <div className="hud-panel hud-panel-magenta p-4 mb-4 text-center">
          <div className="font-arcade text-xs text-muted-foreground uppercase tracking-widest mb-1">Final Score</div>
          <div className="font-arcade text-4xl font-bold neon-text-magenta">{score.toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="hud-panel p-3 text-center">
            <div className="font-arcade text-[9px] text-muted-foreground uppercase tracking-widest mb-1">WPM</div>
            <div className="font-arcade text-2xl font-bold neon-text-cyan">{stats.wpm}</div>
          </div>
          <div className="hud-panel hud-panel-green p-3 text-center">
            <div className="font-arcade text-[9px] text-muted-foreground uppercase tracking-widest mb-1">ACC</div>
            <div className="font-arcade text-2xl font-bold neon-text-green">{stats.accuracy}%</div>
          </div>
          <div className="hud-panel hud-panel-yellow p-3 text-center">
            <div className="font-arcade text-[9px] text-muted-foreground uppercase tracking-widest mb-1">WORDS</div>
            <div className="font-arcade text-2xl font-bold neon-text-yellow">{stats.wordsDestroyed}</div>
          </div>
        </div>

        <div className="flex gap-4 text-xs text-muted-foreground mb-6 justify-center font-arcade tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block shadow-glow-green" />
            {stats.correctChars} HITS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            {stats.wrongChars} MISSES
          </span>
        </div>

        <button onClick={onRestart} className="neon-btn w-full flex items-center justify-center gap-2 py-3 px-6 active:scale-95">
          <RotateCcw size={14} />
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

// Idle / Start Screen
function StartScreen({
  onStart,
  selectedDifficulty,
  onSelectDifficulty,
}: {
  onStart: () => void;
  selectedDifficulty: DifficultyPreset;
  onSelectDifficulty: (d: DifficultyPreset) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="results-card rounded-none p-8 max-w-md w-full text-center relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/60" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/60" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/60" />

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-glow-pulse" />
            <Target size={32} className="neon-text-cyan relative z-10" />
          </div>
        </div>

        <h1 className="font-arcade text-3xl font-bold neon-text-cyan mb-1 tracking-widest animate-neon-flicker">
          Z-TYPE
        </h1>
        <p className="font-arcade text-xs text-muted-foreground mb-6 tracking-wider">WORD DESTROYER</p>

        {/* Difficulty selector */}
        <div className="mb-6">
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={onSelectDifficulty}
          />
        </div>

        <div className="hud-panel p-4 mb-6 text-left">
          <p className="font-arcade text-[9px] text-muted-foreground uppercase tracking-widest mb-2">How to Play</p>
          <ul className="font-mono-code text-xs text-muted-foreground space-y-1">
            <li>• Words fall from the top of the screen</li>
            <li>• Type the first letter to lock on</li>
            <li>• Complete the word to destroy it</li>
            <li>• Don't let words reach the bottom!</li>
            <li>• Build streaks for score multipliers</li>
          </ul>
        </div>

        <button onClick={onStart} className="neon-btn w-full flex items-center justify-center gap-2 py-3 px-6 active:scale-95">
          <Zap size={14} />
          LAUNCH MISSION
        </button>
      </div>
    </div>
  );
}

let wordIdCounter = 0;

export default function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyPreset>('medium');
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [multiplierBump, setMultiplierBump] = useState<boolean>(false);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [stats, setStats] = useState<GameStats>({ wpm: 0, accuracy: 100, correctChars: 0, wrongChars: 0, wordsDestroyed: 0 });
  const [fallingWords, setFallingWords] = useState<FallingWordType[]>([]);
  const [targetedWordId, setTargetedWordId] = useState<number | null>(null);
  const [typedText, setTypedText] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [comboNotifications, setComboNotifications] = useState<ComboNotification[]>([]);
  const [flashOverlay, setFlashOverlay] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [lifeVignette, setLifeVignette] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Refs for animation loop
  const gamePhaseRef = useRef<GamePhase>('idle');
  const fallingWordsRef = useRef<FallingWordType[]>([]);
  const targetedWordIdRef = useRef<number | null>(null);
  const typedTextRef = useRef<string>('');
  const livesRef = useRef<number>(MAX_LIVES);
  const scoreRef = useRef<number>(0);
  const streakRef = useRef<number>(0);
  const correctCharsRef = useRef<number>(0);
  const wrongCharsRef = useRef<number>(0);
  const wordsDestroyedRef = useRef<number>(0);
  const difficultyLevelRef = useRef<number>(1);
  const elapsedRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);
  const comboIdRef = useRef<number>(0);
  const popupIdRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playFieldRef = useRef<HTMLDivElement>(null);
  const selectedDifficultyRef = useRef<DifficultyPreset>('medium');

  // Sync refs
  useEffect(() => { fallingWordsRef.current = fallingWords; }, [fallingWords]);
  useEffect(() => { targetedWordIdRef.current = targetedWordId; }, [targetedWordId]);
  useEffect(() => { typedTextRef.current = typedText; }, [typedText]);
  useEffect(() => { selectedDifficultyRef.current = selectedDifficulty; }, [selectedDifficulty]);

  const triggerCombo = useCallback((newMultiplier: number) => {
    const id = ++comboIdRef.current;
    let label = '';
    let colorClass = '';
    let flashClass = '';
    if (newMultiplier === 2) { label = 'COMBO x2!'; colorClass = 'neon-text-green'; flashClass = 'combo-flash-green'; }
    else if (newMultiplier === 3) { label = 'COMBO x3!'; colorClass = 'neon-text-cyan'; flashClass = 'combo-flash-cyan'; }
    else if (newMultiplier >= 5) { label = 'COMBO x5!!'; colorClass = 'neon-text-magenta'; flashClass = 'combo-flash-magenta'; }
    if (label) {
      setComboNotifications(prev => [...prev, { id, label, colorClass, flashClass }]);
      setFlashOverlay(flashClass);
      setTimeout(() => setComboNotifications(prev => prev.filter(n => n.id !== id)), 1200);
      setTimeout(() => setFlashOverlay(null), 500);
      setMultiplierBump(true);
      setTimeout(() => setMultiplierBump(false), 400);
    }
  }, []);

  const spawnWord = useCallback(() => {
    if (gamePhaseRef.current !== 'playing') return;
    const level = difficultyLevelRef.current;
    const preset = DIFFICULTY_PRESETS[selectedDifficultyRef.current];
    const scale = getLevelScale(level);
    const baseSpeed = preset.baseWordSpeed * scale.speedMultiplier;
    const speedVariance = 0.8 + Math.random() * 0.4;
    const text = getWordForLevel(level);
    const newWord: FallingWordType = {
      id: ++wordIdCounter,
      text,
      x: 8 + Math.random() * 84,
      y: -30,
      speed: baseSpeed * speedVariance,
      status: 'falling',
      typedIndex: 0,
    };
    setFallingWords(prev => [...prev, newWord]);
  }, []);

  const startSpawner = useCallback((level: number) => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    const preset = DIFFICULTY_PRESETS[selectedDifficultyRef.current];
    const scale = getLevelScale(level);
    const interval = Math.round(preset.baseSpawnInterval * scale.spawnMultiplier);
    spawnTimerRef.current = setInterval(() => {
      spawnWord();
    }, interval);
  }, [spawnWord]);

  const triggerLifeLoss = useCallback(() => {
    setScreenShake(true);
    setLifeVignette(true);
    setTimeout(() => setScreenShake(false), 600);
    setTimeout(() => setLifeVignette(false), 800);
  }, []);

  const endGame = useCallback((gameOver: boolean) => {
    gamePhaseRef.current = 'finished';
    setGamePhase('finished');
    setIsGameOver(gameOver);
    if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); spawnTimerRef.current = null; }
    cancelAnimationFrame(animFrameRef.current);

    const elapsed = gameStartTimeRef.current > 0
      ? (performance.now() - gameStartTimeRef.current) / 1000
      : elapsedRef.current > 0 ? elapsedRef.current : 1;
    const minutes = Math.max(elapsed, 1) / 60;
    const wpm = Math.round(wordsDestroyedRef.current / minutes);
    const totalTyped = correctCharsRef.current + wrongCharsRef.current;
    const accuracy = totalTyped > 0 ? Math.round((correctCharsRef.current / totalTyped) * 100) : 100;
    setStats({
      wpm,
      accuracy,
      correctChars: correctCharsRef.current,
      wrongChars: wrongCharsRef.current,
      wordsDestroyed: wordsDestroyedRef.current,
    });
  }, []);

  // Animation loop
  const animationLoop = useCallback((timestamp: number) => {
    if (gamePhaseRef.current !== 'playing') return;
    const delta = lastFrameTimeRef.current ? (timestamp - lastFrameTimeRef.current) / 1000 : 0.016;
    lastFrameTimeRef.current = timestamp;

    elapsedRef.current += delta;

    setFallingWords(prev => {
      const updated: FallingWordType[] = [];
      let livesLost = 0;

      for (const word of prev) {
        if (word.status === 'destroying') {
          updated.push(word);
          continue;
        }
        if (word.status === 'missed') {
          continue;
        }

        const newY = word.y + word.speed * delta;

        if (newY >= WORD_BOTTOM_THRESHOLD) {
          livesLost++;
          if (targetedWordIdRef.current === word.id) {
            targetedWordIdRef.current = null;
          }
          continue;
        }

        updated.push({ ...word, y: newY });
      }

      if (livesLost > 0) {
        const newLives = Math.max(0, livesRef.current - livesLost);
        livesRef.current = newLives;
        setLives(newLives);
        triggerLifeLoss();
        streakRef.current = 0;
        setStreak(0);
        setMultiplier(1);
        if (newLives <= 0) {
          setTimeout(() => endGame(true), 50);
        }
      }

      return updated;
    });

    animFrameRef.current = requestAnimationFrame(animationLoop);
  }, [triggerLifeLoss, endGame]);

  // Clean up destroying words after animation
  useEffect(() => {
    const destroyingWords = fallingWords.filter(w => w.status === 'destroying');
    if (destroyingWords.length === 0) return;
    const timer = setTimeout(() => {
      setFallingWords(prev => prev.filter(w => w.status !== 'destroying'));
    }, 400);
    return () => clearTimeout(timer);
  }, [fallingWords]);

  // Difficulty level scaling — restart spawner when level changes
  useEffect(() => {
    if (gamePhase !== 'playing') return;
    startSpawner(difficultyLevel);
  }, [difficultyLevel, gamePhase, startSpawner]);

  // Score → level progression
  useEffect(() => {
    if (gamePhase !== 'playing') return;
    const newLevel = Math.min(10, Math.floor(score / 500) + 1);
    if (newLevel !== difficultyLevel) {
      setDifficultyLevel(newLevel);
      difficultyLevelRef.current = newLevel;
    }
  }, [score, difficultyLevel, gamePhase]);

  const handleStart = useCallback(() => {
    // Reset all state
    wordIdCounter = 0;
    livesRef.current = MAX_LIVES;
    scoreRef.current = 0;
    streakRef.current = 0;
    correctCharsRef.current = 0;
    wrongCharsRef.current = 0;
    wordsDestroyedRef.current = 0;
    difficultyLevelRef.current = 1;
    elapsedRef.current = 0;
    lastFrameTimeRef.current = 0;
    gameStartTimeRef.current = performance.now();

    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setMultiplierBump(false);
    setDifficultyLevel(1);
    setStats({ wpm: 0, accuracy: 100, correctChars: 0, wrongChars: 0, wordsDestroyed: 0 });
    setFallingWords([]);
    setTargetedWordId(null);
    setTypedText('');
    setHasError(false);
    setScorePopups([]);
    setComboNotifications([]);
    setFlashOverlay(null);
    setScreenShake(false);
    setLifeVignette(false);
    setIsGameOver(false);

    gamePhaseRef.current = 'playing';
    setGamePhase('playing');

    // Spawn first word immediately, then start interval
    setTimeout(() => {
      spawnWord();
      startSpawner(1);
      animFrameRef.current = requestAnimationFrame(animationLoop);
      inputRef.current?.focus();
    }, 300);
  }, [spawnWord, startSpawner, animationLoop]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTypedText(value);
    setHasError(false);

    if (!value) {
      // Clear targeting if input is cleared
      if (targetedWordIdRef.current !== null) {
        setTargetedWordId(null);
        targetedWordIdRef.current = null;
        setFallingWords(prev => prev.map(w =>
          w.status === 'targeted' ? { ...w, status: 'falling' as const } : w
        ));
      }
      return;
    }

    const currentWords = fallingWordsRef.current;
    const lockedId = targetedWordIdRef.current;

    if (lockedId !== null) {
      const lockedWord = currentWords.find(w => w.id === lockedId);
      if (lockedWord) {
        if (lockedWord.text.startsWith(value)) {
          // Valid prefix — update typedIndex
          setFallingWords(prev => prev.map(w =>
            w.id === lockedId ? { ...w, typedIndex: value.length } : w
          ));
          return;
        } else {
          // Wrong key
          setHasError(true);
          setTimeout(() => setHasError(false), 300);
          wrongCharsRef.current++;
          return;
        }
      }
    }

    // Not locked — find a word starting with typed value
    const match = currentWords.find(
      w => (w.status === 'falling' || w.status === 'targeted') && w.text.startsWith(value)
    );

    if (match) {
      // Lock on
      if (lockedId !== null && lockedId !== match.id) {
        setFallingWords(prev => prev.map(w =>
          w.id === lockedId ? { ...w, status: 'falling' as const, typedIndex: 0 } : w
        ));
      }
      setTargetedWordId(match.id);
      targetedWordIdRef.current = match.id;
      setFallingWords(prev => prev.map(w =>
        w.id === match.id
          ? { ...w, status: 'targeted' as const, typedIndex: value.length }
          : w.status === 'targeted' && w.id !== match.id
          ? { ...w, status: 'falling' as const, typedIndex: 0 }
          : w
      ));
      correctCharsRef.current++;
    } else {
      setHasError(true);
      setTimeout(() => setHasError(false), 300);
      wrongCharsRef.current++;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') e.preventDefault();

    if (e.key === 'Backspace') return;

    const currentTyped = typedTextRef.current;
    const lockedId = targetedWordIdRef.current;

    if (!lockedId) return;

    const currentWords = fallingWordsRef.current;
    const lockedWord = currentWords.find(w => w.id === lockedId);
    if (!lockedWord) return;

    // Check if word is complete
    if (currentTyped === lockedWord.text) {
      // Destroy word
      const wordScore = lockedWord.text.length * 10;
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      const newMultiplier = getMultiplier(newStreak);
      const prevMultiplier = getMultiplier(newStreak - 1);
      const points = wordScore * newMultiplier;

      scoreRef.current += points;
      wordsDestroyedRef.current++;
      correctCharsRef.current += lockedWord.text.length;

      setScore(scoreRef.current);
      setStreak(newStreak);

      if (newMultiplier !== prevMultiplier) {
        setMultiplier(newMultiplier);
        triggerCombo(newMultiplier);
      }

      // Score popup
      const popupId = ++popupIdRef.current;
      const popup: ScorePopup = {
        id: popupId,
        x: lockedWord.x,
        y: lockedWord.y,
        points,
      };
      setScorePopups(prev => [...prev, popup]);
      setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== popupId)), 900);

      // Mark as destroying
      setFallingWords(prev => prev.map(w =>
        w.id === lockedId ? { ...w, status: 'destroying' as const } : w
      ));

      setTargetedWordId(null);
      targetedWordIdRef.current = null;
      setTypedText('');
    }
  }, [triggerCombo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const targetedWord = fallingWords.find(w => w.id === targetedWordId);

  const difficultyLabelColor: Record<DifficultyPreset, string> = {
    slow: 'neon-text-green',
    medium: 'neon-text-cyan',
    fast: 'text-orange-400',
  };

  return (
    <div className={`game-root ${screenShake ? 'screen-shake' : ''}`}>
      <Starfield />
      {lifeVignette && <div className="life-loss-vignette" />}
      {flashOverlay && <div className={`combo-flash-overlay ${flashOverlay}`} />}

      {/* Background image */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/bg-space-grid.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
        }}
      />

      {/* ── IDLE SCREEN ── */}
      {gamePhase === 'idle' && (
        <StartScreen
          onStart={handleStart}
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={setSelectedDifficulty}
        />
      )}

      {/* ── PLAYING ── */}
      {gamePhase === 'playing' && (
        <>
          {/* HUD */}
          <div className="hud-container">
            <HudPanel icon={Trophy} label="Score" value={score} colorClass="neon-text-cyan" />
            <HudPanel
              icon={TrendingUp}
              label="Streak"
              value={streak}
              colorClass={getMultiplierClass(multiplier)}
            />
            <LivesDisplay lives={lives} />
            <HudPanel
              icon={TrendingUp}
              label="WPM"
              value={stats.wpm}
              colorClass="neon-text-green"
            />
            <HudPanel
              icon={Zap}
              label="Level"
              value={difficultyLevel}
              colorClass="neon-text-yellow"
              bump={multiplierBump}
            />
            {/* Difficulty preset badge */}
            <div className="hud-panel p-2 flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1 mb-0.5">
                <Gauge size={10} className="text-muted-foreground" />
                <span className="font-arcade text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Mode</span>
              </div>
              <div className={`font-arcade text-lg font-bold leading-none uppercase ${difficultyLabelColor[selectedDifficulty]}`}>
                {selectedDifficulty}
              </div>
            </div>
          </div>

          {/* Multiplier display */}
          {multiplier > 1 && (
            <div className={`multiplier-badge ${getMultiplierClass(multiplier)} ${multiplierBump ? 'animate-multiplier-bump' : ''}`}>
              x{multiplier}
            </div>
          )}

          {/* Combo notifications */}
          {comboNotifications.map(n => (
            <div key={n.id} className={`combo-notification ${n.colorClass} ${n.flashClass}`}>
              {n.label}
            </div>
          ))}

          {/* Play field */}
          <div
            ref={playFieldRef}
            className="play-field"
            style={{ height: PLAY_FIELD_HEIGHT }}
          >
            <div className="danger-line" />

            {fallingWords.map(word => (
              <FallingWord
                key={word.id}
                word={word}
                isTargeted={word.id === targetedWordId}
              />
            ))}

            {scorePopups.map(popup => (
              <FloatingScorePopup key={popup.id} popup={popup} />
            ))}
          </div>

          {/* Input bar */}
          <GameInputBar
            typedText={typedText}
            targetWordText={targetedWord?.text ?? null}
            hasError={hasError}
            inputRef={inputRef}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </>
      )}

      {/* ── RESULTS ── */}
      {gamePhase === 'finished' && (
        <ResultsOverlay
          stats={stats}
          score={score}
          isGameOver={isGameOver}
          onRestart={handleStart}
        />
      )}

      {/* Footer */}
      <footer className="game-footer">
        <span>
          Built with ♥ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'unknown-app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            caffeine.ai
          </a>
          {' '}· © {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
