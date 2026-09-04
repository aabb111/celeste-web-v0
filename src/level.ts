import { overlaps, tileRange, type Rect } from "./aabb";
import { PLAYER_H } from "./params";

export const TILE = 8;
export const COLS = 40;
export const ROWS = 18;
export const ROOM_W = COLS * TILE;
export const ROOM_H = ROWS * TILE;

export const EMPTY = 0;
export const SOLID = 1;
export const SPIKE = 2;

export type Checkpoint = { id: number; x: number; y: number; w: number; h: number };
export type Flag = Rect;

/** Start S ≈ (x2, y3). y-down tile rows. */
export const GROUND_TOP = 3;
/** After the 1-tile jump, same terrace. */
export const MID_TOP = 3;
/** Landing after the 2-tile coyote gap. */
export const LAND_TOP = 4;
/** Safe ledge before the must-dash void; CP2 ≈ x29. */
export const SAFE_TOP = 8;
/** Goal surface. 6 tiles above SAFE so a pure jump cannot land. */
export const GOAL_TOP = 2;
export const SPIKE_TOP = 16;

export function createLevel() {
  const tiles = new Uint8Array(COLS * ROWS);

  const fill = (x0: number, x1: number, y0: number, y1: number, type: number) => {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) tiles[y * COLS + x] = type;
      }
    }
  };

  // x0–8 run ground
  fill(0, 8, GROUND_TOP, GROUND_TOP + 1, SOLID);
  // x9–10 1-tile jump gap (void)
  // x11–15 platform
  fill(11, 15, MID_TOP, MID_TOP + 1, SOLID);
  // x16–18 2-tile coyote gap (void)
  // x19–22 landing
  fill(19, 22, LAND_TOP, LAND_TOP + 1, SOLID);
  // x23–27 spike pit (jump-buffer lesson)
  fill(23, 27, SPIKE_TOP, ROWS - 1, SPIKE);
  // x28–30 safe platform
  fill(28, 30, SAFE_TOP, SAFE_TOP + 1, SOLID);
  // x31–35 5-tile must-dash void (no spikes; 4 tiles is jumpable at same height)
  // x36–39 goal + flag G
  fill(36, 39, GOAL_TOP, ROWS - 1, SOLID);

  const spawn = {
    x: 2 * TILE,
    y: GROUND_TOP * TILE - PLAYER_H,
  };

  const checkpoints: Checkpoint[] = [
    { id: 0, x: spawn.x, y: spawn.y, w: 8, h: PLAYER_H },
    { id: 1, x: 20 * TILE, y: LAND_TOP * TILE - PLAYER_H, w: 8, h: PLAYER_H },
    { id: 2, x: 29 * TILE, y: SAFE_TOP * TILE - PLAYER_H, w: 8, h: PLAYER_H },
  ];

  const flag: Flag = {
    x: 37 * TILE + 1,
    y: GOAL_TOP * TILE - 16,
    w: 6,
    h: 16,
  };

  const at = (tx: number, ty: number) => {
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return EMPTY;
    return tiles[ty * COLS + tx]!;
  };

  const overlapping = (rect: Rect, type: number): boolean => {
    const [x0, x1] = tileRange(rect.x, rect.w, TILE, COLS);
    const [y0, y1] = tileRange(rect.y, rect.h, TILE, ROWS);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (at(tx, ty) === type) return true;
      }
    }
    return false;
  };

  return {
    tiles,
    spawn,
    checkpoints,
    flag,
    goalLedge: { x: 36 * TILE, y: GOAL_TOP * TILE, w: 4 * TILE, h: TILE },
    at,
    isSolid(tx: number, ty: number) {
      return at(tx, ty) === SOLID;
    },
    hitsSpike(rect: Rect) {
      return overlapping(rect, SPIKE);
    },
    hitsFlag(rect: Rect) {
      return overlaps(rect, flag);
    },
    touchingCheckpoint(rect: Rect): Checkpoint | null {
      let found: Checkpoint | null = null;
      for (const cp of checkpoints) {
        if (cp.id === 0) continue;
        if (overlaps(rect, cp) && (!found || cp.id > found.id)) found = cp;
      }
      return found;
    },
    respawnAt(id: number) {
      const cp = checkpoints.find((c) => c.id === id);
      if (!cp) return { x: spawn.x, y: spawn.y };
      return { x: cp.x, y: cp.y };
    },
  };
}

export type Level = ReturnType<typeof createLevel>;
