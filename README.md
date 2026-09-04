# Ledge

Single-screen Celeste-like 2D platformer (web only). Vite + TypeScript + Canvas 2D, custom AABB physics, fixed 60Hz timestep.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:43173`).

Controls: **Left / Right** to run, **Space / Z / Up** to jump, **Down / S** to fast-fall, **R** to reset the room.

## Room

40×18 tiles at 8px, camera locked to the full room.

- **S** start on flat ground `x0–11` (surface y=2)
- 1-tile gap `x12–13` (void, no spikes)
- Low platform `x14–19` and checkpoint **CP1** near `x15`
- 2-tile coyote gap `x20–23`
- Landing `x24–27`
- Spike pit `x28–33`
- Goal platform `x34–39` with flag **G**

Die on spikes or by falling off the bottom. Respawn at the last checkpoint with velocity cleared. Input stays locked through the death effect (~0.54s) and intro respawn (0.6s).

Feel values live in `src/params.ts` (Celeste-style table: MaxRun 90, RunAccel 1000, RunReduce 400, AirMult 0.65, JumpSpeed -105, JumpHBoost 40, Gravity 900, MaxFall 160, FastMaxFall 240, JumpGrace 0.1, jump buffer 0.08). Headless movement checks: `npx tsx scripts/selftest.mts`.

## Self-test notes

Verified against the acceptance criteria:

| Check | What was verified |
| --- | --- |
| Run / jump / land | Ground accel to 90px/s, jump vy = -105, landing sets vy=0 with no bounce or stun. |
| Coyote | Walk off the `x20–23` gap and press jump within 0.1s — still jumps. |
| Jump buffer | Press jump slightly before landing (0.08s window) — jump fires on touchdown. |
| Variable jump | Tap jump for a short hop; hold Space inside VarJumpTime 0.2s to keep the rise, then half-grav near the apex (`holdJumpGravityMul` 0.5). |
| Fast-fall | Holding down eases the fall cap from MaxFall 160 toward FastMaxFall 240. |
| Death / respawn | Spikes and void play a ~0.54s death, then 0.6s intro at CP0 or CP1 with vx=vy=0 and no input until intro ends. |
| Reach G | Short-hop the early gaps, then from the last ledge run and jump (hold Space for the full arc) down to the flag. An edge tap also clears. |
