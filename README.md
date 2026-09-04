# Ledge

Single-screen Celeste-like 2D platformer (web only). Vite + TypeScript + Canvas 2D, custom AABB physics, fixed 60Hz timestep.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:43173`).

Controls: **Left / Right** to run, **Space / C / Up** to jump, **Z / V / Left Shift** to grab (hold, no buffer), **X** to dash (8-way), **Down / S** to fast-fall or climb down, **Up / W** to climb up while grabbing, **R** to reset the room.

On a narrow or touch viewport: **Grab** (hold, 56px) sits above the left **← →** cluster, with **↑** beside it for climb-up. Bottom-right stays **Dash | Jump** over **Down**. **R** is a small low-contrast control at the top-right. Pads are multi-touch with pointer capture (slide off still tracks until lift). Desktop keyboard is unchanged besides **Z** moving from jump to grab.

## Room

40×18 tiles at 8px, camera locked to the full room.

- **S** / **CP0** start on run ground `x0–4` (surface y=3)
- 1-tile jump gap `x5` (void)
- Platform `x6–9` — **CP1** ≈ `x7`
- 2-tile coyote gap `x10–11`, landing `x12–15`
- Spike pit `x16–20` (jump-buffer lesson)
- Climb-base floor `x21–25` — **CP2** ≈ `x23`
- Wall `x26–30`, 6-tile climb from y=14 up to y=8
- Climb-top run-up `x31–32` — **CP3** ≈ `x31`
- Must-dash void `x33–36` (no spikes). The goal is 6 tiles higher so a pure jump cannot land
- Goal `x37–39` (y=2) with flag **G**

Die on spikes or by falling off the bottom. Respawn at the last checkpoint with velocity cleared, dash refilled, and stamina restored. Input stays locked through the death effect (~0.54s) and intro respawn (0.6s).

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
