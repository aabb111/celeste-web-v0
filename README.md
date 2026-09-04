# Ledge

Single-screen Celeste-like 2D platformer (web only). Vite + TypeScript + Canvas 2D, custom AABB physics, fixed 60Hz timestep.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:43173`).

Controls: **Left / Right** to run, **Space / Z / Up** to jump, **X** to dash (8-way; no direction dashes toward facing), **Down / S** to fast-fall, **R** to reset the room.

On a narrow or touch viewport, on-screen **← →** stay on the left; **Dash** sits left of **Jump** on the right, with **Down** under Jump. **R** is a small low-contrast control at the top-right. Pads are multi-touch with pointer capture.

## Room

40×18 tiles at 8px, camera locked to the full room.

- **S** start on run ground `x0–8` (surface y=3)
- 1-tile jump gap `x9–10` (void)
- Platform `x11–15` and later landing `x19–22` after the 2-tile coyote gap `x16–18` — **CP1** on the landing
- Spike pit `x23–27` (jump-buffer lesson)
- Safe platform `x28–30` — **CP2** ≈ `x29`
- Must-dash void `x31–35` (no spikes). The goal ledge is high enough that a pure jump cannot land
- Goal `x36–39` with flag **G**

Die on spikes or by falling off the bottom. Respawn at the last checkpoint with velocity cleared and dash refilled. Input stays locked through the death effect (~0.54s) and intro respawn (0.6s).

Feel values live in `src/params.ts` (Celeste-style table: MaxRun 90, DashSpeed 240, DashTime 0.15, EndDashSpeed 160, EndDashUpMult 0.75, DashCooldown 0.2, DashRefillCooldown 0.1, freeze 0.05). Headless checks: `npm test`.

## Self-test notes

Verified against the acceptance criteria:

| Check | What was verified |
| --- | --- |
| Run / jump / land | Ground accel to 90px/s, jump vy = -105, landing sets vy=0 with no bounce or stun. |
| Coyote | Walk off an early gap and press jump within 0.1s — still jumps. |
| Jump buffer | Press jump slightly before landing (0.08s window) — jump fires on touchdown. |
| Variable jump | Tap jump for a short hop; hold Space inside VarJumpTime 0.2s to keep the rise. |
| Fast-fall | Holding down eases the fall cap from MaxFall 160 toward FastMaxFall 240. |
| Dash | One air dash at 240 for 0.15s after a 0.05s freeze; no gravity during the burst; end speed 160 (×0.75 if upward); refill on land after DashRefillCooldown. |
| 8-way | Diagonals are normalized; no aim dashes toward Facing. |
| Death / respawn | Spikes and void play a ~0.54s death, then 0.6s intro at the last checkpoint. |
| Reach G | Early gaps teach run/jump/coyote/buffer. The last void needs a jump + up-right dash — jump alone cannot clear it. |
