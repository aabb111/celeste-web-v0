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

/** Start S ≈ (x2, y3). y-down tile rows. */
export const GROUND_TOP = 3;
export const MID_TOP = 3;
export const LAND_TOP = 4;
export const CLIMB_BASE = 14;
export const CLIMB_TOP = 8;
export const PRACTICE_TOP = 12;
export const DASH_TOP = 13;
/** Goal G at y8 (same y-down convention as the climb top). */
export const GOAL_TOP = 8;
export const SPIKE_TOP = 16;

export const START_X1 = 4;
export const JUMP1_X0 = 6;
export const JUMP1_X1 = 9;
export const JUMP1P_X0 = 11;
export const JUMP1P_X1 = 15;
export const COYOTE1_X0 = 18;
export const COYOTE1_X1 = 22;
export const COYOTE2_X0 = 25;
export const COYOTE2_X1 = 29;
export const SPIKE1_X0 = 30;
export const SPIKE1_X1 = 34;
export const SPIKE1_LAND_X0 = 35;
export const SPIKE1_LAND_X1 = 40;
export const SPIKE2_X0 = 41;
export const SPIKE2_X1 = 42;
export const CLIMB_FLOOR_X0 = 43;
export const CLIMB_FLOOR_X1 = 47;
export const WALL_X0 = 48;
export const WALL_X1 = 52;
export const CLIMB_LEDGE_X0 = 53;
export const CLIMB_LEDGE_X1 = 55;
export const PRACTICE_FLOOR_X0 = 57;
export const PRACTICE_FLOOR_X1 = 59;
export const PRACTICE_WALL_X0 = 60;
export const PRACTICE_WALL_X1 = 61;
export const DASH_LEDGE_X0 = 62;
export const DASH_LEDGE_X1 = 65;
export const GOAL_X0 = 70;
export const GOAL_X1 = 71;

export const room1: RoomBlueprint = {
  id: "room1",
  next: "room2",
  status: "Run, jump, grab (Z), dash (X). Climb, then dash the last gap to G.",
  spawn: tilePos(2, GROUND_TOP),
  checkpoints: [
    tileCheckpoint(0, 2, GROUND_TOP),
    tileCheckpoint(1, 7, MID_TOP),
    tileCheckpoint(2, 27, LAND_TOP),
    tileCheckpoint(3, 37, CLIMB_BASE),
    tileCheckpoint(4, 45, CLIMB_BASE),
    tileCheckpoint(5, 54, CLIMB_TOP),
    tileCheckpoint(6, 63, DASH_TOP),
  ],
  flag: tileFlag(71, GOAL_TOP),
  goalLedge: { x: GOAL_X0 * TILE, y: GOAL_TOP * TILE, w: (GOAL_X1 - GOAL_X0 + 1) * TILE, h: TILE },
  door: null,
  labels: [
    { text: "S", x: 16, y: 22 },
    { text: "G", x: 71 * TILE + 1, y: GOAL_TOP * TILE - 18 },
    { text: "climb", x: WALL_X0 * TILE + 4, y: 100 },
    { text: "dash", x: DASH_LEDGE_X0 * TILE + 4, y: DASH_TOP * TILE - 10 },
  ],
  paint(fill: Fill) {
    fill(0, START_X1, GROUND_TOP, GROUND_TOP + 1, SOLID);
    fill(JUMP1_X0, JUMP1_X1, MID_TOP, MID_TOP + 1, SOLID);
    fill(JUMP1P_X0, JUMP1P_X1, MID_TOP, MID_TOP + 1, SOLID);
    fill(COYOTE1_X0, COYOTE1_X1, LAND_TOP, LAND_TOP + 1, SOLID);
    fill(COYOTE2_X0, COYOTE2_X1, LAND_TOP, LAND_TOP + 1, SOLID);
    fill(SPIKE1_X0, SPIKE1_X1, SPIKE_TOP, ROWS - 1, SPIKE);
    fill(SPIKE1_LAND_X0, SPIKE1_LAND_X1, CLIMB_BASE, ROWS - 1, SOLID);
    fill(SPIKE2_X0, SPIKE2_X1, SPIKE_TOP, ROWS - 1, SPIKE);
    fill(CLIMB_FLOOR_X0, CLIMB_FLOOR_X1, CLIMB_BASE, ROWS - 1, SOLID);
    fill(WALL_X0, WALL_X1, CLIMB_TOP, ROWS - 1, SOLID);
    fill(CLIMB_LEDGE_X0, CLIMB_LEDGE_X1, CLIMB_TOP, CLIMB_TOP + 1, SOLID);
    fill(PRACTICE_FLOOR_X0, PRACTICE_FLOOR_X1, PRACTICE_TOP, PRACTICE_TOP + 1, SOLID);
    fill(PRACTICE_WALL_X0, PRACTICE_WALL_X1, CLIMB_TOP, ROWS - 1, SOLID);
    fill(DASH_LEDGE_X0, DASH_LEDGE_X1, DASH_TOP, DASH_TOP + 1, SOLID);
    fill(GOAL_X0, GOAL_X1, GOAL_TOP, ROWS - 1, SOLID);
  },
};
