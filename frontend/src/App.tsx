import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Keyboard, Zap, Target, Clock, Trophy, Heart } from 'lucide-react';

const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly.",
  "Technology is best when it brings people together. The internet has revolutionized the way we communicate, work, and learn. Every day, millions of people connect across the globe sharing ideas and building communities.",
  "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made.",
  "To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
  "The universe is under no obligation to make sense to you. Space is big. You just won't believe how vastly, hugely, mind-bogglingly big it is. I mean, you may think it's a long way down the road to the chemist's.",
  "Programming is the art of telling another human what one wants the computer to do. Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it.",
  "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world. Logic will get you from A to B. Imagination will take you everywhere.",
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
];

type GameState = 'idle' | 'playing' | 'finished';

interface Stats {
  wpm: number;
  cpm: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalTyped: number;
}

function getRandomParagraph(exclude?: string): string {
  const available = exclude ? PARAGRAPHS.filter(p => p !== exclude) : PARAGRAPHS;
  return available[Math.floor(Math.random() * available.length)];
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  highlight = false,
  urgent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit?: string;
  highlight?: boolean;
  urgent?: boolean;
}) {
  return (
    <div
      className={`glass-card rounded-xl p-4 flex flex-col items-center gap-1 transition-all duration-300 ${
        highlight ? 'border-primary/40 shadow-glow-sm' : ''
      } ${urgent ? 'border-destructive/50' : ''}`}
    >
      <div className={`flex items-center gap-1.5 mb-1 ${urgent ? 'text-destructive' : 'text-muted-foreground'}`}>
        <Icon size={14} />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-mono text-2xl font-bold leading-none ${urgent ? 'text-destructive' : 'text-primary'}`}>
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function ResultsOverlay({
  stats,
  onRestart,
}: {
  stats: Stats;
  onRestart: () => void;
}) {
  const getGrade = (wpm: number) => {
    if (wpm >= 80) return { label: 'Expert', color: 'text-primary' };
    if (wpm >= 60) return { label: 'Advanced', color: 'text-accent' };
    if (wpm >= 40) return { label: 'Intermediate', color: 'text-chart-4' };
    if (wpm >= 20) return { label: 'Beginner', color: 'text-muted-foreground' };
    return { label: 'Novice', color: 'text-muted-foreground' };
  };

  const grade = getGrade(stats.wpm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in-up">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center animate-scale-in border border-primary/20 shadow-glow">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Trophy size={32} className="text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-1">Test Complete!</h2>
        <p className={`text-sm font-semibold mb-6 ${grade.color}`}>{grade.label} Typist</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card rounded-xl p-4 border border-primary/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">WPM</div>
            <div className="font-mono text-3xl font-bold text-primary">{stats.wpm}</div>
          </div>
          <div className="glass-card rounded-xl p-4 border border-accent/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">CPM</div>
            <div className="font-mono text-3xl font-bold text-accent">{stats.cpm}</div>
          </div>
          <div className="glass-card rounded-xl p-4 border border-chart-4/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ACC</div>
            <div className="font-mono text-3xl font-bold text-chart-4">{stats.accuracy}%</div>
          </div>
        </div>

        <div className="flex gap-3 text-sm text-muted-foreground mb-6 justify-center">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
            {stats.correctChars} correct
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-destructive inline-block"></span>
            {stats.wrongChars} errors
          </span>
        </div>

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-glow active:scale-95"
        >
          <RotateCcw size={16} />
          Play Again
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [paragraph, setParagraph] = useState<string>(() => getRandomParagraph());
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState<Stats>({ wpm: 0, cpm: 0, accuracy: 0, correctChars: 0, wrongChars: 0, totalTyped: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<number>(0);
  // Use a ref to track game state inside interval callbacks to avoid stale closures
  const gameStateRef = useRef<GameState>('idle');

  const calculateStats = useCallback((typed: string[], elapsed: number, para: string) => {
    const totalTyped = typed.length;
    let correctChars = 0;
    let wrongChars = 0;

    typed.forEach((char, i) => {
      if (char === para[i]) {
        correctChars++;
      } else {
        wrongChars++;
      }
    });

    const minutes = elapsed / 60;
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const cpm = minutes > 0 ? Math.round(correctChars / minutes) : 0;
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

    return { wpm, cpm, accuracy, correctChars, wrongChars, totalTyped };
  }, []);

  const endGame = useCallback((typed: string[], para: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const finalStats = calculateStats(typed, 60, para);
    setStats(finalStats);
    gameStateRef.current = 'finished';
    setGameState('finished');
  }, [calculateStats]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Use the ref to check game state to avoid stale closure issues
    if (gameStateRef.current === 'finished') return;

    // Start timer on first keypress of a printable character
    if (gameStateRef.current === 'idle' && e.key.length === 1) {
      gameStateRef.current = 'playing';
      setGameState('playing');
      elapsedRef.current = 0;

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setTimeLeft(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setTypedChars(current => {
              endGame(current, paragraph);
              return current;
            });
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    setTypedChars(prev => {
      let next = [...prev];

      if (e.key === 'Backspace') {
        if (next.length > 0) {
          next = next.slice(0, -1);
        }
      } else if (e.key.length === 1 && next.length < paragraph.length) {
        next = [...next, e.key];

        // Check if paragraph is complete
        if (next.length === paragraph.length) {
          setTimeout(() => endGame(next, paragraph), 50);
        }
      }

      // Update stats in real-time
      const elapsed = elapsedRef.current > 0 ? elapsedRef.current : 1;
      const newStats = calculateStats(next, elapsed, paragraph);
      setStats(newStats);

      return next;
    });

    e.preventDefault();
  }, [paragraph, calculateStats, endGame]);

  const restart = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const newParagraph = getRandomParagraph(paragraph);
    setParagraph(newParagraph);
    setTypedChars([]);
    gameStateRef.current = 'idle';
    setGameState('idle');
    setTimeLeft(60);
    setStats({ wpm: 0, cpm: 0, accuracy: 0, correctChars: 0, wrongChars: 0, totalTyped: 0 });
    elapsedRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [paragraph]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isUrgent = timeLeft <= 10 && gameState === 'playing';

  const renderParagraph = () => {
    return paragraph.split('').map((char, i) => {
      let className = 'char-pending';
      if (i < typedChars.length) {
        className = typedChars[i] === char ? 'char-correct' : 'char-wrong';
      } else if (i === typedChars.length) {
        className = 'char-current';
      }
      return (
        <span key={i} className={className}>
          {char}
        </span>
      );
    });
  };

  const progressPercent = (typedChars.length / paragraph.length) * 100;

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Keyboard size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">TypeSpeed</h1>
              <p className="text-xs text-muted-foreground">Typing Speed Test</p>
            </div>
          </div>
          <button
            onClick={restart}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-lg px-3 py-1.5 transition-all duration-200 hover:bg-secondary/50"
          >
            <RotateCcw size={12} />
            Restart
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl space-y-6 animate-fade-in-up">

          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-1">
              {gameState === 'idle'
                ? 'Ready to type?'
                : gameState === 'playing'
                ? 'Keep going!'
                : "Time's up!"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {gameState === 'idle'
                ? 'Start typing to begin the 60-second test'
                : gameState === 'playing'
                ? 'Type the text below as fast and accurately as you can'
                : 'Great effort! Check your results below.'}
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard
              icon={Clock}
              label="Time"
              value={timeLeft}
              unit="s"
              urgent={isUrgent}
            />
            <StatCard
              icon={Zap}
              label="WPM"
              value={stats.wpm}
              highlight={gameState === 'playing'}
            />
            <StatCard
              icon={Keyboard}
              label="CPM"
              value={stats.cpm}
            />
            <StatCard
              icon={Target}
              label="Accuracy"
              value={stats.accuracy}
              unit="%"
            />
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Typing Area */}
          <div
            className={`glass-card rounded-2xl p-6 border transition-all duration-300 cursor-text ${
              isFocused ? 'typing-area-focused' : 'border-border/40'
            } ${gameState === 'finished' ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Paragraph Display */}
            <div
              className="font-mono-code text-lg leading-relaxed tracking-wide select-none mb-4"
              style={{ lineHeight: '2.2rem' }}
            >
              {renderParagraph()}
            </div>

            {/* Hidden Input */}
            <input
              ref={inputRef}
              type="text"
              className="sr-only"
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              readOnly={gameState === 'finished'}
              aria-label="Typing input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {/* Click to focus hint */}
            {!isFocused && gameState !== 'finished' && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 mt-2">
                <Keyboard size={12} />
                <span>Click here or press any key to focus</span>
              </div>
            )}

            {/* Typing indicator */}
            {isFocused && gameState === 'playing' && (
              <div className="flex items-center gap-2 text-xs text-primary/60 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"></span>
                <span>Typing in progress...</span>
              </div>
            )}
          </div>

          {/* Restart Button */}
          <div className="flex justify-center">
            <button
              onClick={restart}
              className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary text-foreground font-medium py-2.5 px-6 rounded-xl border border-border/50 hover:border-border transition-all duration-200 hover:shadow-glow-sm active:scale-95 text-sm"
            >
              <RotateCcw size={14} />
              Restart Game
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm char-correct inline-block"></span>
              Correct
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm char-wrong inline-block"></span>
              Incorrect
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm char-current inline-block"></span>
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm char-pending inline-block bg-muted/30"></span>
              Pending
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} TypeSpeed — Typing Speed Test</span>
          <span className="flex items-center gap-1">
            Built with <Heart size={11} className="text-destructive fill-destructive mx-0.5" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'typing-speed-test')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>

      {/* Results Overlay */}
      {gameState === 'finished' && (
        <ResultsOverlay stats={stats} onRestart={restart} />
      )}
    </div>
  );
}
