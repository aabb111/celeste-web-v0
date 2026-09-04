import { overlaps, tileRange, type Rect } from "./aabb";
import { room1 } from "./room1";
import { room2 } from "./room2";
import {
  COLS,
  EMPTY,
  ROWS,
  SOLID,
  SPIKE,
  TILE,
  type RoomBlueprint,
  type RoomId,
} from "./rooms";

export {
  COLS,
  EMPTY,
  ROOM_H,
  ROOM_W,
  ROWS,
  SPIKE,
  SOLID,
  TILE,
  VIEW_COLS,
  VIEW_H,
  VIEW_W,
  type Checkpoint,
  type Flag,
  type Label,
  type RoomId,
} from "./rooms";
export {
  CLIMB_BASE,
  CLIMB_FLOOR_X0,
  CLIMB_FLOOR_X1,
  CLIMB_LEDGE_X0,
  CLIMB_TOP,
  DASH_LEDGE_X0,
  DASH_LEDGE_X1,
  DASH_TOP,
  GOAL_TOP,
  GOAL_X0,
  GROUND_TOP,
  LAND_TOP,
  MID_TOP,
  PRACTICE_WALL_X0,
  PRACTICE_WALL_X1,
  SPIKE1_LAND_X0,
  SPIKE1_X0,
  SPIKE_TOP,
  WALL_X0,
  WALL_X1,
} from "./room1";
export {
  R2_APPROACH_X0,
  R2_COMBO_FLOOR_TOP,
  R2_COMBO_FLOOR_X0,
  R2_COMBO_WALL_TOP,
  R2_COMBO_WALL_X0,
  R2_COMBO_WALL_X1,
  R2_CP1_X,
  R2_CP2_X,
  R2_CP3_X,
  R2_CP4_X,
  R2_CP5_X,
  R2_DASH_LAND_TOP,
  R2_DASH1_LAND_X0,
  R2_ENTRY_TOP,
  R2_GOAL_TOP,
  R2_GOAL_X0,
  R2_LOW_TOP,
  R2_PRE_GOAL_TOP,
  R2_PRE_GOAL_X0,
  R2_SPIKE_TOP,
  R2_WALL_TOP,
  R2_WALL_TOP_X0,
  R2_WALL_X0,
  R2_WALL_X1,
} from "./room2";

const BLUEPRINTS: Record<RoomId, RoomBlueprint> = {
  room1,
  room2,
};

export function createLevel(roomId: RoomId = "room1") {
  const room = BLUEPRINTS[roomId];
  const tiles = new Uint8Array(COLS * ROWS);

  const fill = (x0: number, x1: number, y0: number, y1: number, type: number) => {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) tiles[y * COLS + x] = type;
      }
    }
  };

  room.paint(fill);

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
    roomId: room.id,
    nextRoom: room.next,
    status: room.status,
    tiles,
    spawn: room.spawn,
    checkpoints: room.checkpoints,
    flag: room.flag,
    goalLedge: room.goalLedge,
    door: room.door,
    labels: room.labels,
    at,
    isSolid(tx: number, ty: number) {
      return at(tx, ty) === SOLID;
    },
    hitsSpike(rect: Rect) {
      return overlapping(rect, SPIKE);
    },
    hitsFlag(rect: Rect) {
      return overlaps(rect, room.flag);
    },
    touchingCheckpoint(rect: Rect) {
      let found: (typeof room.checkpoints)[number] | null = null;
      for (const cp of room.checkpoints) {
        if (cp.id === 0) continue;
        if (overlaps(rect, cp) && (!found || cp.id > found.id)) found = cp;
      }
      return found;
    },
    respawnAt(id: number) {
      const cp = room.checkpoints.find((c) => c.id === id);
      if (!cp) return { x: room.spawn.x, y: room.spawn.y };
      return { x: cp.x, y: cp.y };
    },
  };
}

export type Level = ReturnType<typeof createLevel>;
