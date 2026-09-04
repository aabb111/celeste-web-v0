import {
  ROWS,
  SOLID,
  SPIKE,
  TILE,
  tileCheckpoint,
  tileFlag,
  tilePos,
  type Fill,
  type RoomBlueprint,
} from "./rooms";

/**
 * Room2 tile rows are y-down like Room1 (0 = top of the 18-row screen).
 *
 * Brief stand-on heights ("entry y8", "drop to y2", "up to y10") are counted
 * from the bottom: row = 17 - h. That puts S2 at (x2, y9).
 */
export const R2_ENTRY_TOP = 9;
export const R2_LOW_TOP = 15;
export const R2_WALL_TOP = 7;
/**
 * Goal is 5 tiles above the dash ledge so a same-height jump cannot land.
 * The x-gap is also widened vs the 5-tile brief if a jump still clears.
 */
export const R2_GOAL_TOP = 2;
export const R2_SPIKE_TOP = 16;
export const R2_WALL_X0 = 25;
export const R2_WALL_X1 = 26;
export const R2_CP1_X = 20;
export const R2_CP2_X = 28;
export const R2_GOAL_X0 = 36;

export const room2: RoomBlueprint = {
  id: "room2",
  next: null,
  status: "Room 2 — coyote, spikes, climb, dash to G2.",
  spawn: tilePos(2, R2_ENTRY_TOP),
  checkpoints: [
    tileCheckpoint(0, 2, R2_ENTRY_TOP),
    tileCheckpoint(1, R2_CP1_X, R2_LOW_TOP),
    tileCheckpoint(2, R2_CP2_X, R2_WALL_TOP),
  ],
  flag: tileFlag(38, R2_GOAL_TOP),
  goalLedge: { x: R2_GOAL_X0 * TILE, y: R2_GOAL_TOP * TILE, w: (40 - R2_GOAL_X0) * TILE, h: TILE },
  door: {
    x: 0,
    y: (R2_ENTRY_TOP - 3) * TILE,
    w: 2 * TILE,
    h: 3 * TILE,
  },
  labels: [
    { text: "D", x: 4, y: (R2_ENTRY_TOP - 3) * TILE - 2 },
    { text: "S2", x: 16, y: R2_ENTRY_TOP * TILE - 12 },
    { text: "G2", x: 38 * TILE + 1, y: R2_GOAL_TOP * TILE - 18 },
    { text: "climb", x: 196, y: 88 },
    { text: "dash", x: 248, y: 48 },
  ],
  paint(fill: Fill) {
    // x0–4 entry high platform (door D at x0–1)
    fill(0, 4, R2_ENTRY_TOP, R2_ENTRY_TOP + 1, SOLID);
    // Drop to the low terrace. Brief wrote x5–7; extended to x5–9 so a
    // full-speed run actually lands before the coyote gap (feel unchanged).
    fill(5, 9, R2_LOW_TOP, ROWS - 1, SOLID);
    // 2-tile coyote gap x10–11, landing x12–15 (brief x11–14, +1 tile so a hop lands)
    fill(12, 15, R2_LOW_TOP, ROWS - 1, SOLID);
    // x15–19 spike pit ~3 tiles; full-tile spikes (existing style), air margins as safe edges
    fill(16, 18, R2_SPIKE_TOP, ROWS - 1, SPIKE);
    // x20–21 safe platform, CP1 ≈ x20
    fill(20, 21, R2_LOW_TOP, ROWS - 1, SOLID);
    // x22–24 void, then climbable wall x25–26 from low terrace up to wall-top (~8 tiles)
    fill(R2_WALL_X0, R2_WALL_X1, R2_WALL_TOP, ROWS - 1, SOLID);
    // wall-top run-up x27–29, CP2 ≈ x28
    fill(27, 29, R2_WALL_TOP, R2_WALL_TOP + 1, SOLID);
    // x30–35 must-dash void (no spikes). Goal x36–39, raised so jump cannot land.
    fill(R2_GOAL_X0, 39, R2_GOAL_TOP, ROWS - 1, SOLID);
  },
};
