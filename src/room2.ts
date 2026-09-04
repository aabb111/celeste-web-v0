import {
  COLS,
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
 * Brief stand-on heights ("entry y8", "up to y10", "G2 at y10") are counted
 * from the bottom: row = 17 - h. That puts S2 at (x2, y9).
 */
export const R2_ENTRY_TOP = 9;
export const R2_LOW_TOP = 15;
export const R2_WALL_TOP = 7;
export const R2_DASH_LAND_TOP = 4;
export const R2_COMBO_FLOOR_TOP = 12;
export const R2_COMBO_WALL_TOP = 8;
export const R2_PRE_GOAL_TOP = 10;
export const R2_GOAL_TOP = 7;
export const R2_SPIKE_TOP = 16;

export const R2_DROP_X1 = 9;
export const R2_COYOTE1_X0 = 12;
export const R2_COYOTE1_X1 = 15;
export const R2_COYOTE2_X0 = 18;
export const R2_COYOTE2_X1 = 22;
export const R2_SPIKE1_X0 = 23;
export const R2_SPIKE1_X1 = 25;
export const R2_CP1_X = 28;
export const R2_SAFE1_X0 = 26;
export const R2_SAFE1_X1 = 29;
export const R2_SPIKE2_X0 = 30;
export const R2_SPIKE2_X1 = 33;
export const R2_APPROACH_X0 = 34;
export const R2_APPROACH_X1 = 38;
export const R2_CP2_X = 37;
export const R2_WALL_X0 = 39;
export const R2_WALL_X1 = 40;
export const R2_WALL_TOP_X0 = 41;
export const R2_WALL_TOP_X1 = 43;
export const R2_CP3_X = 42;
export const R2_DASH1_LAND_X0 = 49;
export const R2_DASH1_LAND_X1 = 52;
export const R2_CP4_X = 50;
export const R2_COMBO_FLOOR_X0 = 53;
export const R2_COMBO_FLOOR_X1 = 57;
export const R2_COMBO_WALL_X0 = 58;
export const R2_COMBO_WALL_X1 = 59;
export const R2_PRE_GOAL_X0 = 64;
export const R2_PRE_GOAL_X1 = 66;
export const R2_CP5_X = 65;
export const R2_GOAL_X0 = 69;

export const room2: RoomBlueprint = {
  id: "room2",
  next: null,
  status: "Room 2 — coyote, spikes, climb, dash to G2.",
  spawn: tilePos(2, R2_ENTRY_TOP),
  checkpoints: [
    tileCheckpoint(0, 2, R2_ENTRY_TOP),
    tileCheckpoint(1, R2_CP1_X, R2_LOW_TOP),
    tileCheckpoint(2, R2_CP2_X, R2_LOW_TOP),
    tileCheckpoint(3, R2_CP3_X, R2_WALL_TOP),
    tileCheckpoint(4, R2_CP4_X, R2_DASH_LAND_TOP),
    tileCheckpoint(5, R2_CP5_X, R2_PRE_GOAL_TOP),
  ],
  flag: tileFlag(70, R2_GOAL_TOP),
  goalLedge: { x: R2_GOAL_X0 * TILE, y: R2_GOAL_TOP * TILE, w: (COLS - R2_GOAL_X0) * TILE, h: TILE },
  door: {
    x: 0,
    y: (R2_ENTRY_TOP - 3) * TILE,
    w: 2 * TILE,
    h: 3 * TILE,
  },
  labels: [
    { text: "D", x: 4, y: (R2_ENTRY_TOP - 3) * TILE - 2 },
    { text: "S2", x: 16, y: R2_ENTRY_TOP * TILE - 12 },
    { text: "G2", x: 70 * TILE + 1, y: R2_GOAL_TOP * TILE - 18 },
    { text: "climb", x: R2_WALL_X0 * TILE - 4, y: 88 },
    { text: "dash", x: R2_WALL_TOP_X1 * TILE + 8, y: 40 },
  ],
  paint(fill: Fill) {
    fill(0, 4, R2_ENTRY_TOP, R2_ENTRY_TOP + 1, SOLID);
    fill(5, R2_DROP_X1, R2_LOW_TOP, ROWS - 1, SOLID);
    fill(R2_COYOTE1_X0, R2_COYOTE1_X1, R2_LOW_TOP, ROWS - 1, SOLID);
    fill(R2_COYOTE2_X0, R2_COYOTE2_X1, R2_LOW_TOP, ROWS - 1, SOLID);
    fill(R2_SPIKE1_X0, R2_SPIKE1_X1, R2_SPIKE_TOP, ROWS - 1, SPIKE);
    fill(R2_SAFE1_X0, R2_SAFE1_X1, R2_LOW_TOP, ROWS - 1, SOLID);
    fill(R2_SPIKE2_X0, R2_SPIKE2_X1, R2_SPIKE_TOP, ROWS - 1, SPIKE);
    fill(R2_APPROACH_X0, R2_APPROACH_X1, R2_LOW_TOP, ROWS - 1, SOLID);
    fill(R2_WALL_X0, R2_WALL_X1, R2_WALL_TOP, ROWS - 1, SOLID);
    fill(R2_WALL_TOP_X0, R2_WALL_TOP_X1, R2_WALL_TOP, R2_WALL_TOP + 1, SOLID);
    fill(R2_DASH1_LAND_X0, R2_DASH1_LAND_X1, R2_DASH_LAND_TOP, R2_DASH_LAND_TOP + 1, SOLID);
    fill(R2_COMBO_FLOOR_X0, R2_COMBO_FLOOR_X1, R2_COMBO_FLOOR_TOP, R2_COMBO_FLOOR_TOP + 1, SOLID);
    fill(R2_COMBO_WALL_X0, R2_COMBO_WALL_X1, R2_COMBO_WALL_TOP, ROWS - 1, SOLID);
    fill(R2_PRE_GOAL_X0, R2_PRE_GOAL_X1, R2_PRE_GOAL_TOP, R2_PRE_GOAL_TOP + 1, SOLID);
    fill(R2_GOAL_X0, COLS - 1, R2_GOAL_TOP, ROWS - 1, SOLID);
  },
};
