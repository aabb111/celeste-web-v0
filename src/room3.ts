import {
  COLS,
  ROWS,
  SOLID,
  SPIKE,
  TILE,
  tileCheckpoint,
  tileCrystal,
  tileFlag,
  tilePos,
  type Fill,
  type RoomBlueprint,
} from "./rooms";

/**
 * Room3 tile rows are y-down like Room1/2 (0 = top of the 18-row screen).
 *
 * Brief stand-on heights ("entry y10", "floor y2", "climb to y9 / y8")
 * are counted from the bottom: row = 17 - h.
 * Entry y10 → row 7. Floor y2 → row 15. Climb y9 → row 8.
 */
export const R3_ENTRY_TOP = 7;
export const R3_FLOOR_TOP = 15;
export const R3_LAND_A_TOP = 15;
export const R3_PRACTICE_A_TOP = 11;
export const R3_CLIMB_C_TOP = 8;
export const R3_TEACH_TOP = 8;
export const R3_GOAL_TOP = 8;
export const R3_SPIKE_TOP = 16;

export const R3_ENTRY_X1 = 2;
export const R3_DROP_X0 = 3;
export const R3_CP1_X = 7;
export const R3_CP1_X1 = 8;

export const R3_COYOTE_A_X0 = 9;
export const R3_COYOTE_A_X1 = 10;
export const R3_FOOT_A_X = 11;
export const R3_FOOT_A_X1 = 11;
export const R3_DASH_A_X0 = 13;
export const R3_DASH_A_X1 = 16;
export const R3_LAND_A_X0 = 17;
export const R3_CP2_X = 20;
export const R3_CP2_X1 = 21;

export const R3_COYOTE_PA_X0 = 22;
export const R3_COYOTE_PA_X1 = 23;
export const R3_FOOT_PA_X = 24;
export const R3_FOOT_PA_X1 = 25;
export const R3_DASH_PA_X0 = 26;
export const R3_DASH_PA_X1 = 29;
export const R3_CP3_X = 30;
export const R3_CP3_X1 = 30;

export const R3_SPIKE_B_APPROACH = 30;
export const R3_SPIKE_B_APPROACH_X1 = 30;
export const R3_SPIKE_B_X0 = 31;
export const R3_SPIKE_B_X1 = 35;
export const R3_SPIKE_B_LAND_X0 = 36;
export const R3_CP4_X = 37;
export const R3_CP4_X1 = 38;

export const R3_SPIKE_PB_X0 = 39;
export const R3_SPIKE_PB_X1 = 42;
export const R3_CP5_X = 43;
export const R3_CP5_X1 = 43;

export const R3_WALL_C_X = 45;
export const R3_TOP_C_X0 = 46;
export const R3_TOP_C_X1 = 47;
export const R3_DASH_C_X0 = 48;
export const R3_DASH_C_X1 = 51;
export const R3_CP6_X = 52;
export const R3_CP6_X1 = 54;

export const R3_TEACH_X0 = 55;
export const R3_TEACH_X1 = 57;
export const R3_CRYSTAL_TEACH_X = 56;
export const R3_CRYSTAL_TEACH_Y = 7;
export const R3_VOID_X0 = 58;
export const R3_VOID_X1 = 65;
export const R3_CRYSTAL_AIR_X = 61;
export const R3_CRYSTAL_AIR_Y = 9;
export const R3_CP7_X = 66;
export const R3_CP7_X1 = 68;
export const R3_GOAL_X0 = 69;

export const room3: RoomBlueprint = {
  id: "room3",
  next: null,
  status: "Room 3 — coyote, dash, spikes, climb, crystals to G3.",
  spawn: tilePos(2, R3_ENTRY_TOP),
  checkpoints: [
    tileCheckpoint(0, 2, R3_ENTRY_TOP),
    tileCheckpoint(1, R3_CP1_X, R3_FLOOR_TOP),
    tileCheckpoint(2, R3_CP2_X, R3_LAND_A_TOP),
    tileCheckpoint(3, R3_CP3_X, R3_PRACTICE_A_TOP),
    tileCheckpoint(4, R3_CP4_X, R3_FLOOR_TOP),
    tileCheckpoint(5, R3_CP5_X, R3_FLOOR_TOP),
    tileCheckpoint(6, R3_CP6_X, R3_CLIMB_C_TOP),
    tileCheckpoint(7, 67, R3_TEACH_TOP),
  ],
  flag: tileFlag(70, R3_GOAL_TOP),
  goalLedge: { x: R3_GOAL_X0 * TILE, y: R3_GOAL_TOP * TILE, w: (COLS - R3_GOAL_X0) * TILE, h: TILE },
  door: {
    x: 70 * TILE,
    y: (R3_GOAL_TOP - 3) * TILE,
    w: 2 * TILE,
    h: 3 * TILE,
  },
  labels: [
    { text: "S3", x: 16, y: R3_ENTRY_TOP * TILE - 12 },
    { text: "G3", x: 70 * TILE + 1, y: R3_GOAL_TOP * TILE - 18 },
    { text: "climb", x: R3_WALL_C_X * TILE - 4, y: 72 },
    { text: "dash", x: R3_TOP_C_X1 * TILE + 8, y: 48 },
    { text: "crystal", x: R3_CRYSTAL_TEACH_X * TILE - 8, y: R3_TEACH_TOP * TILE - 20 },
  ],
  crystals: [
    tileCrystal(R3_CRYSTAL_TEACH_X, R3_CRYSTAL_TEACH_Y),
    tileCrystal(R3_CRYSTAL_AIR_X, R3_CRYSTAL_AIR_Y),
  ],
  springs: [],
  paint(fill: Fill) {
    fill(0, R3_ENTRY_X1, R3_ENTRY_TOP, R3_ENTRY_TOP + 1, SOLID);
    fill(R3_DROP_X0, R3_CP1_X1, R3_FLOOR_TOP, ROWS - 1, SOLID);
    fill(R3_FOOT_A_X, R3_FOOT_A_X1, R3_FLOOR_TOP, ROWS - 1, SOLID);
    fill(R3_LAND_A_X0, R3_CP2_X1, R3_LAND_A_TOP, R3_LAND_A_TOP + 1, SOLID);
    fill(R3_FOOT_PA_X, R3_FOOT_PA_X1, R3_PRACTICE_A_TOP, R3_PRACTICE_A_TOP + 1, SOLID);
    fill(R3_CP3_X, R3_CP3_X1, R3_PRACTICE_A_TOP, R3_PRACTICE_A_TOP + 1, SOLID);
    fill(R3_SPIKE_B_X0, R3_SPIKE_B_X1, R3_SPIKE_TOP, ROWS - 1, SPIKE);
    fill(R3_SPIKE_B_LAND_X0, R3_CP4_X1, R3_FLOOR_TOP, ROWS - 1, SOLID);
    fill(R3_SPIKE_PB_X0, R3_SPIKE_PB_X1, R3_SPIKE_TOP, ROWS - 1, SPIKE);
    fill(R3_CP5_X, R3_CP5_X1, R3_FLOOR_TOP, ROWS - 1, SOLID);
    fill(R3_WALL_C_X, R3_WALL_C_X, R3_CLIMB_C_TOP, ROWS - 1, SOLID);
    fill(R3_TOP_C_X0, R3_TOP_C_X1, R3_CLIMB_C_TOP, R3_CLIMB_C_TOP + 1, SOLID);
    fill(R3_CP6_X, R3_CP6_X1, R3_CLIMB_C_TOP, R3_CLIMB_C_TOP + 1, SOLID);
    fill(R3_TEACH_X0, R3_TEACH_X1, R3_TEACH_TOP, R3_TEACH_TOP + 1, SOLID);
    fill(R3_CP7_X, R3_CP7_X1, R3_TEACH_TOP, R3_TEACH_TOP + 1, SOLID);
    fill(R3_GOAL_X0, COLS - 1, R3_GOAL_TOP, ROWS - 1, SOLID);
  },
};
