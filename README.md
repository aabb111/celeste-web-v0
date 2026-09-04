# Ledge

Two-screen Celeste-like 2D platformer (web only). Vite + TypeScript + Canvas 2D, custom AABB physics, fixed 60Hz timestep.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:43173`).

Controls: **Left / Right** to run, **Space / C / Up** to jump, **Z / V / Left Shift** to grab (hold, no buffer), **X** to dash (8-way), **Down / S** to fast-fall or climb down, **Up / W** to climb up while grabbing, **R** to reset the run.

On a narrow or touch viewport (portrait **and** landscape): pads overlay the canvas corners — no extra bottom chrome. Left cluster is **Grab** above **← →** (no ↑ key; holding Grab climbs up). Bottom-right is **Dash | Jump** with **Down** only under Jump. **R** is a small low-contrast control at the top-right, away from the action cluster. Pads are multi-touch with pointer capture (slide off still tracks until lift). Desktop keyboard is unchanged besides **Z** moving from jump to grab.

## Rooms

Two 72×18-tile rooms. The camera shows a ~40-tile-wide window and follows horizontally with a small deadzone (no vertical scroll). Touching **G** cut-loads Room2 with no scroll between rooms.

### Room1

Teach each skill, then a short practice beat. Checkpoints **CP0–CP6**.

- **S** / **CP0** start on run ground `x0–4` (surface y=3)
- 1-tile jump teach `x5`, landing `x6–9` — **CP1** ≈ `x7`
- 1-tile jump practice `x10`, landing `x11–15`
- 2-tile coyote teach `x16–17`, landing `x18–22`
- 2-tile coyote practice `x23–24`, landing `x25–29` — **CP2** ≈ `x27`
- Spike pit teach `x30–34`, drop-landing `x35–40` (y=14) — **CP3** ≈ `x37`
- Spike pit practice `x41–42`
- Climb-base floor `x43–47` — **CP4** ≈ `x45`
- Wall `x48–52`, 6-tile climb from y=14 up to y=8
- Climb-top run-up `x53–55` — **CP5** ≈ `x54`
- Short wall practice: drop to `x57–59` (y=12), grab `x60–61`
- Dash ledge `x62–65` (y=13) — **CP6** ≈ `x63`
- 4-tile must-dash void `x66–69` (no spikes). Takeoff is below **G** so a jump cannot land
- Goal `x70–71` (y=8) with flag **G** — touching **G** instant-loads Room2 at **S2**

### Room2

y-down tile rows (same as Room1). Brief heights (“y8 / y10”) are stand-on heights from the bottom: row = 17 − h. Checkpoints **CP0–CP5**.

- Entry door **D** at `x0–1`, high platform `x0–4` at y=9 — **S2** / **CP0** ≈ `(x2, y9)`
- Drop `x5–9` to the low terrace (y=15)
- Double 2-tile coyote gaps (`x10–11`, `x16–17`)
- Spike pit ~3 tiles (`x23–25`) — **CP1** ≈ `x28`
- Spike pit ~4 tiles (`x30–33`) — **CP2** ≈ `x37`
- Climbable wall `x39–40` from y=15 up to y=7 (~8 tiles)
- Wall-top `x41–43` — **CP3** ≈ `x42`
- 5-tile must-dash up to a high ledge `x49–52` (y=4) — **CP4** ≈ `x50`
- Drop to `x53–57` (y=12), short wall `x58–59`, then a 4-tile dash
- Pre-goal ledge `x64–66` (y=10) — **CP5** ≈ `x65`
- Another dash gap to goal `x70–71` with flag **G2** at y=7 (stand-on y10)

Death respawns at the last Room2 checkpoint (never back to Room1). Die on spikes or by falling off the bottom. Respawn clears velocity, refills dash, and restores stamina. Input stays locked through the death effect (~0.54s) and intro respawn (0.6s).

Feel values live in `src/params.ts` (Celeste-style table: MaxRun 90, JumpSpeed -105, DashSpeed 240, ClimbMaxStamina 110, ClimbTired 20, ClimbUpCost ≈45.45/s, ClimbStillCost 10/s, ClimbJumpCost 27.5, ClimbUpSpeed -45, WallJumpHSpeed 130, WallSlideStartMax 20). Headless checks: `npm test`.

## Self-test notes

Verified against the acceptance criteria:

| Check | What was verified |
| --- | --- |
| Run / jump / land | Ground accel to 90px/s, jump vy = -105, landing sets vy=0 with no bounce or stun. |
| Coyote / buffer | Walk off an early gap and jump within 0.1s; press jump 0.08s before landing. |
| Dash | One air dash at 240 for 0.15s after a 0.05s freeze; end speed 160 (×0.75 if upward); refill on land. Dash module unchanged. |
| Grab / climb | Hold Z/V/Shift to grab. Climb up/down with stamina drain. Tired (stamina < 20) cannot start a grab; mid-climb may continue. |
| ClimbJump / WallJump | Neutral jump on a wall costs 27.5 and uses JumpSpeed; jump away uses WallJumpHSpeed 130. |
| Dash off wall | Dash still starts while climbing and cancels the grab. |
| Wall slide | Holding into a wall while falling, without grab, eases fall toward WallSlideStartMax 20 over 1.2s. |
| Reach G | Teach-then-practice gaps, 6-tile climb + short wall, then jump + up-right dash the last 4-tile void — jump alone cannot clear it. |
| Room2 | Touching Room1 G cut-loads Room2. Double coyote, two spike pits, 8-tile climb, 5-tile must-dash, wall+dash combo, then dash to G2. Death stays in Room2. |
| Camera | 72-tile rooms, 40-tile viewport, horizontal follow with a 20px deadzone. Room cuts do not scroll. |
