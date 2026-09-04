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
/** After the 1-tile jump, same terrace. */
export const MID_TOP = 3;
/** Landing after the 2-tile coyote gap. */
export const LAND_TOP = 4;
/** Floor at the base of the climb well. CP2 ≈ x23. */
export const CLIMB_BASE = 14;
/** Top of the climb / dash ledge. CP3 ≈ x31. */
export const CLIMB_TOP = 8;
/** Goal surface. 6 tiles above the climb top so a same-height jump cannot land. */
export const GOAL_TOP = 2;
export const SPIKE_TOP = 16;

export const room1: RoomBlueprint = {
  id: "room1",
  next: "room2",
  status: "Run, jump, grab (Z), dash (X). Climb the wall, dash the last gap to G.",
  spawn: tilePos(2, GROUND_TOP),
  checkpoints: [
    tileCheckpoint(0, 2, GROUND_TOP),
    tileCheckpoint(1, 7, MID_TOP),
    tileCheckpoint(2, 23, CLIMB_BASE),
    tileCheckpoint(3, 31, CLIMB_TOP),
  ],
  flag: tileFlag(38, GOAL_TOP),
  goalLedge: { x: 37 * TILE, y: GOAL_TOP * TILE, w: 3 * TILE, h: TILE },
  door: null,
  labels: [
    { text: "S", x: 16, y: 22 },
    { text: "G", x: 38 * TILE + 1, y: GOAL_TOP * TILE - 18 },
    { text: "climb", x: 200, y: 100 },
    { text: "dash", x: 268, y: 58 },
  ],
  paint(fill: Fill) {
    fill(0, 4, GROUND_TOP, GROUND_TOP + 1, SOLID);
    fill(6, 9, MID_TOP, MID_TOP + 1, SOLID);
    fill(12, 15, LAND_TOP, LAND_TOP + 1, SOLID);
    fill(16, 20, SPIKE_TOP, ROWS - 1, SPIKE);
    fill(21, 25, CLIMB_BASE, ROWS - 1, SOLID);
    fill(26, 30, CLIMB_TOP, ROWS - 1, SOLID);
    fill(31, 32, CLIMB_TOP, CLIMB_TOP + 1, SOLID);
    fill(37, 39, GOAL_TOP, ROWS - 1, SOLID);
  },
};
