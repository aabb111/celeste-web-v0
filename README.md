# Ledge

Two-screen Celeste-like 2D platformer (web only). Vite + TypeScript + Canvas 2D, custom AABB physics, fixed 60Hz timestep.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:43173`).

Controls: **Left / Right** to run, **Space / C / Up** to jump, **Z / V / Left Shift** to grab (hold, no buffer), **X** to dash (8-way), **Down / S** to fast-fall or climb down, **Up / W** to climb up while grabbing, **R** to reset the run.

On a narrow or touch viewport: **Grab** (hold, 56px) sits above the left **← →** cluster, with **↑** beside it for climb-up. Bottom-right stays **Dash | Jump** over **Down**. **R** is a small low-contrast control at the top-right. Pads are multi-touch with pointer capture (slide off still tracks until lift). Desktop keyboard is unchanged besides **Z** moving from jump to grab.

## Rooms

Two single-screen rooms (40×18 tiles at 8px). Camera stays locked to the current room — touching **G** cut-loads Room2 with no scroll.

### Room1

- **S** / **CP0** start on run ground `x0–4` (surface y=3)
- 1-tile jump gap `x5` (void)
- Platform `x6–9` — **CP1** ≈ `x7`
- 2-tile coyote gap `x10–11`, landing `x12–15`
- Spike pit `x16–20` (jump-buffer lesson)
- Climb-base floor `x21–25` — **CP2** ≈ `x23`
- Wall `x26–30`, 6-tile climb from y=14 up to y=8
- Climb-top run-up `x31–32` — **CP3** ≈ `x31`
- Must-dash void `x33–36` (no spikes). The goal is 6 tiles higher so a jump cannot land
- Goal `x37–39` (y=2) with flag **G** — touching **G** instant-loads Room2 at **S2**

### Room2

y-down tile rows (same as Room1). Brief heights (“y8 / y2 / y10”) are stand-on heights from the bottom: row = 17 − h.

- Entry door **D** at `x0–1`, high platform `x0–4` at y=9 — **S2** / **CP0** ≈ `(x2, y9)`
- Drop `x5–9` to the low terrace (y=15) — extended so a full-speed run lands before the gap
- 2-tile coyote gap `x10–11`, landing `x12–15`
- Spike pit ~3 tiles (`x16–18`) with air-edge margins in `x15–19`
- Safe platform `x20–21` — **CP1** ≈ `x20`
- Void, then climbable wall `x25–26` from y=15 up to y=7 (~8 tiles)
- Wall-top `x27–29` — **CP2** ≈ `x28`
- Must-dash void `x30–35` (no spikes). Goal is raised to y=2 so a pure jump cannot land
- Goal `x36–39` with flag **G2**

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
| Reach G | Early gaps teach run/jump/coyote/buffer. Climb the wall, then jump + up-right dash the last void — jump alone cannot clear it. |
| Room2 | Touching Room1 G cut-loads Room2. Coyote, spikes, 8-tile climb, then jump + dash to G2. Death stays in Room2. |
