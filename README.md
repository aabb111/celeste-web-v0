# Ledge

Three-screen Celeste-like 2D platformer (web only). Vite + TypeScript + Canvas 2D, custom AABB physics, fixed 60Hz timestep.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:43173`).

Controls: **Left / Right** to run, **Space / C / Up** to jump, **Z / V / Left Shift** to grab (hold, no buffer), **X** to dash (8-way), **Down / S** to fast-fall or climb down, **Up / W** to climb up while grabbing, **R** to reset the run.

On a narrow or touch viewport (portrait **and** landscape): pads overlay the **canvas** corners — measured from the game frame, not the screen letterbox. Portrait bottom-aligns the contain-fit view so the control zone sits on the frame. Left cluster is **Grab** above **← →** (no ↑). Right cluster is **Dash | Jump**, with **Up** directly above Jump and **Down** under Jump. Climb = Grab + Up / Down. **R** is a small low-contrast control at the canvas top-right. Pads are multi-touch with pointer capture (slide off still tracks until lift). Desktop keyboard is unchanged besides **Z** moving from jump to grab.

## Rooms

Three 72×18-tile rooms. The camera shows a ~40-tile-wide window and follows horizontally with a small deadzone (no vertical scroll). Touching **G** cut-loads Room2, and **G2** cut-loads Room3, with no scroll between rooms.

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
- Same-height 4-tile dash to ledge `x48–52` (top7) — **CP4** ≈ `x50`
- Spring teach: low platform `x53–55` (top12) with a floor spring ≈ `(54, 12)`
- High platform `x57–61` (top7, +1 tile toward the spring) — **CP5** ≈ `x59`
- 4-tile same-height must-dash void `x62–65`
- Flag platform `x66–71` (top7) with **G2** — touching **G2** instant-loads Room3 at **S3**

### Room3

y-down tile rows (same as Room1/2). Brief heights (“y10 / y2 / y9”) are stand-on heights from the bottom: row = 17 − h. Checkpoints **CP0–CP7**.

- Entry **S3** / **CP0** on a high platform `x0–2` at y10 (row 7)
- Drop `x3–6` to the default floor (y2 / row 15) — **CP1** ≈ `x7`
- Combo A same-height 4-tile dash on the floor — **CP2** ≈ `x20`
- Practice A raised pads — **CP3** ≈ `x30`
- Combo B spike pit width 5 (`x31–35`, buffer jump + air dash) — **CP4** ≈ `x37`
- Practice B spike width 4 (`x39–42`) — **CP5** ≈ `x43`
- Combo C: climb ~7 tiles to y9, 2-tile top, 5-tile dash — **CP6** ≈ `x53–54` (top8)
- Crystal teach platform `x55–57` (top8) with a dash-refill crystal ≈ `(56, 7)`
- 8-tile same-height void `x58–65` with a mid-air crystal ≈ `(61, 7)` (dash height; `(61, 9)` sits below a same-height dash)
- **CP7** on `x66–68` (top8), goal `x69–71` (top8) with flag **G3** and an exit door

Dash-refill **crystal** (~16×16): consume only when dashes < 1 or stamina < 20; success sets dashes = 1 and stamina = 110, then a 2.5s respawn. Full (dashes ≥ 1 and stamina ≥ 20) passes through. Floor **spring** (~16×6, bottom-aligned): triggers only when `vy ≥ 0`; sets `vy = -185`, `vx = 0`, VarJumpTime 0.2 + AutoJump, refills dash and stamina, and clears coyote.

Death respawns at the last checkpoint in the current room (never a previous room). Die on spikes or by falling off the bottom. Respawn clears velocity, refills dash, and restores stamina. Input stays locked through the death effect (~0.54s) and intro respawn (0.6s).

Feel values live in `src/params.ts` (Celeste-style table: MaxRun 90, JumpSpeed -105, DashSpeed 240, ClimbMaxStamina 110, ClimbTired 20, ClimbUpCost ≈45.45/s, ClimbStillCost 10/s, ClimbJumpCost 27.5, ClimbUpSpeed -45, WallJumpHSpeed 130, WallSlideStartMax 20). Headless checks: `npm test`.

## Self-test notes

Verified against the acceptance criteria:

| Check | What was verified |
| --- | --- |
| Run / jump / land | Ground accel to 90px/s, jump vy = -105, landing sets vy=0 with no bounce or stun. |
| Coyote / buffer | Walk off an early gap and jump within 0.1s; press jump 0.08s before landing. |
| Dash | One air dash at 240 for 0.15s after a 0.05s freeze; 8-way aim with diagonals normalized (total speed still 240); end speed 160 (×0.75 if upward); refill on land. |
| Grab / climb | Hold Z/V/Shift to grab. Climb up/down with stamina drain. Tired (stamina < 20) cannot start a grab; mid-climb may continue. |
| WallJump | Jump while grabbing always kicks off the wall (WallJumpHSpeed 130, JumpSpeed -105, ForceTime 0.16s). No ClimbJump; wall jump does not spend ClimbJumpCost. |
| Dash off wall | Dash still starts while climbing and cancels the grab. |
| Wall slide | Holding into a wall while falling, without grab, eases fall toward WallSlideStartMax 20 over 1.2s. |
| Reach G | Teach-then-practice gaps, 6-tile climb + short wall, then jump + up-right dash the last 4-tile void — jump alone cannot clear it. |
| Crystal | Empty dash or tired consumes; sets dashes = 1 and stamina = 110; full passes through; respawns after 2.5s. |
| Spring | Landing (`vy ≥ 0`) bounces at -185, clears vx, AutoJump + VarJumpTime 0.2, refills dash and stamina. |
| Room2 | Touching Room1 G cut-loads Room2. Double coyote, two spike pits, 8-tile climb, 5-tile must-dash, spring to CP5, then must-dash to G2. Death stays in Room2. |
| Room3 | Touching Room2 G2 cut-loads Room3. Combo coyote+dash, spike+dash, 7-tile climb + 5-tile dash, then crystals across an 8-gap to G3. Death stays in Room3. |
| Camera | 72-tile rooms, 40-tile viewport, horizontal follow with a 20px deadzone. Room cuts do not scroll. |
