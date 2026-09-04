import { overlaps, tileRange, type Rect } from "./aabb";

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

/** Surface of early path (y-down). Start S stands on y=2 ground. */
const GROUND_TOP = 2;
/** Lower terrace for the coyote gap and landing. */
const LOW_TOP = 4;
/** Goal cliff near the floor so the pit is a downhill jump. */
const GOAL_TOP = 14;
/** Spikes sit on the pit floor only — the air above x28–33 stays clear. */
const SPIKE_TOP = 16;

export function createLevel() {
  const tiles = new Uint8Array(COLS * ROWS);

  const fill = (x0: number, x1: number, y0: number, y1: number, type: number) => {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) tiles[y * COLS + x] = type;
      }
    }
  };

  // Flat ground x0–11 at height y2 (first three segments are spike-free).
  fill(0, 11, GROUND_TOP, GROUND_TOP + 1, SOLID);
  // 1-tile gap x12–13 (void)
  // Low platform x14–19
  fill(14, 19, LOW_TOP, LOW_TOP + 1, SOLID);
  // 2-tile coyote gap x20–23 (void)
  // Landing platform x24–27
  fill(24, 27, LOW_TOP, LOW_TOP + 1, SOLID);
  // Spike pit x28–33 (hazard on the floor of the hole)
  fill(28, 33, SPIKE_TOP, ROWS - 1, SPIKE);
  // Goal platform x34–39, thick so you cannot slip under the lip
  fill(34, 39, GOAL_TOP, ROWS - 1, SOLID);

  const spawn = {
    x: 2 * TILE,
    y: GROUND_TOP * TILE - 10,
  };

  const checkpoints: Checkpoint[] = [
    { id: 0, x: spawn.x, y: spawn.y, w: 8, h: 10 },
    { id: 1, x: 15 * TILE + 2, y: LOW_TOP * TILE - 10, w: 4, h: 10 },
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
    goalLedge: { x: 34 * TILE, y: GOAL_TOP * TILE, w: 6 * TILE, h: TILE },
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
      for (const cp of checkpoints) {
        if (cp.id === 0) continue;
        if (overlaps(rect, cp)) return cp;
      }
      return null;
    },
    respawnAt(id: number) {
      if (id <= 0) return { x: spawn.x, y: spawn.y };
      return { x: 15 * TILE, y: LOW_TOP * TILE - 10 };
    },
  };
}

export type Level = ReturnType<typeof createLevel>;
