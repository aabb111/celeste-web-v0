# Ledge

Single-screen Celeste-like 2D platformer (web only). Vite + TypeScript + Canvas 2D, custom AABB physics, fixed 60Hz timestep.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:43173`).

Controls: **Left / Right** to run, **Space / Z / Up** to jump, **R** to reset the room.

## Room

40×18 tiles at 8px, camera locked to the full room.

- **S** start on flat ground `x0–11` (surface y=2)
- 1-tile gap `x12–13` (void, no spikes)
- Low platform `x14–19` and checkpoint **CP1** near `x15`
- 2-tile coyote gap `x20–23`
- Landing `x24–27`
- Spike pit `x28–33`
- Goal platform `x34–39` with flag **G**

Die on spikes or by falling off the bottom. Respawn at the last checkpoint with velocity cleared. Input is locked through the death freeze and respawn delay.

Feel values live in `src/params.ts`. Headless movement checks: `npx tsx scripts/selftest.mts`.

## Self-test notes

Verified against the acceptance criteria:

| Check | What was verified |
| --- | --- |
| Run / jump / land | Ground accel to 90px/s, jump vy = -105, landing sets vy=0 with no bounce or stun. |
| Coyote | Walk off the `x20–23` gap and press jump within 0.1s — still jumps. |
| Jump buffer | Press jump slightly before landing — jump fires on touchdown. |
| Variable jump | Tap jump for a short hop; hold Space for the full arc (`holdJumpGravityMul` 0.5). |
| Death / respawn | Spikes and void freeze ~0.2s, then respawn by 0.5s at CP0 or CP1 with vx=vy=0. |
| Reach G | From the last ledge, run and jump (hold Space to float) down to the flag. An edge tap also clears. |
