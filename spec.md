# Specification

## Summary
**Goal:** Add a manual difficulty selector (Slow / Medium / Fast) to the ZType Arcade falling-words game, allowing players to choose a word speed preset before each session.

**Planned changes:**
- Add three neon-styled toggle buttons (Slow, Medium, Fast) on the pre-game/idle screen for difficulty selection, with Medium selected by default
- Define distinct base fall speeds and spawn intervals for each preset: Slow (slower/less frequent), Medium (current defaults), Fast (faster/more frequent)
- Keep existing automatic difficulty scaling active on top of the chosen base preset
- Hide or disable the difficulty selector while a game session is in progress
- Add a HUD panel showing the active difficulty preset label (SLOW / MEDIUM / FAST) during a game session, consistent with the existing neon HUD aesthetic

**User-visible outcome:** Players can select a difficulty level before starting a game. The chosen preset affects the starting word fall speed and spawn rate, and the active preset label is visible in the HUD throughout the session.
