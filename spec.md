# Specification

## Summary
**Goal:** Remove all timer and time-related UI elements from the ZType Arcade game so the only game-over condition is losing all lives.

**Planned changes:**
- Remove the countdown timer display from the HUD
- Remove the duration selector toggle buttons (15s/30s/60s/120s) from the start screen and HUD
- Remove any time-remaining HUD panel
- Disable timer-based game-over logic so the game only ends when all lives are lost
- Keep WPM calculation working internally using elapsed time since first keystroke (not displayed as a timer)
- HUD continues to show Score, Streak Multiplier, Lives, WPM, and Difficulty Level

**User-visible outcome:** The game no longer shows a timer or duration selector. Players can play indefinitely until they run out of lives, with the HUD showing only score, streak, lives, WPM, and difficulty.
