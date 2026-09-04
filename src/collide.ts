import { tileRange } from "./aabb";
import { COLS, ROWS, TILE, type Level } from "./level";
import { PLAYER_H, PLAYER_W } from "./params";
import type { Player } from "./player";

const LEDGE_CATCH = 14;

export function moveAndCollide(player: Player, level: Level, dt: number) {
  const prevBottom = player.y + PLAYER_H;
  const wasOnGround = player.onGround;
  player.x += player.vx * dt;
  resolveAxis(player, level, "x", prevBottom, wasOnGround);
  player.y += player.vy * dt;
  player.onGround = false;
  resolveAxis(player, level, "y", prevBottom, wasOnGround);
  catchGoalLedge(player, level);
}

/** Celeste DashVFloorSnapDist — keep a horizontal dash stuck to the floor. */
export function snapToFloor(player: Player, level: Level, dist: number) {
  if (player.onGround || player.vy < 0) return;
  const feet = player.y + PLAYER_H;
  const [x0, x1] = tileRange(player.x, PLAYER_W, TILE, COLS);
  const ty0 = Math.floor(feet / TILE);
  const ty1 = Math.floor((feet + dist) / TILE);
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (!level.isSolid(tx, ty)) continue;
      const tileY = ty * TILE;
      if (tileY >= feet - 0.01 && tileY <= feet + dist) {
        player.y = tileY - PLAYER_H;
        player.vy = 0;
        player.onGround = true;
        return;
      }
    }
  }
}

function resolveAxis(
  player: Player,
  level: Level,
  axis: "x" | "y",
  prevBottom: number,
  wasOnGround: boolean,
) {
  const [x0, x1] = tileRange(player.x, PLAYER_W, TILE, COLS);
  const [y0, y1] = tileRange(player.y, PLAYER_H, TILE, ROWS);

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (!level.isSolid(tx, ty)) continue;
      const tileX = tx * TILE;
      const tileY = ty * TILE;
      const overlapX = player.x + PLAYER_W > tileX && player.x < tileX + TILE;
      const overlapY = player.y + PLAYER_H > tileY && player.y < tileY + TILE;
      if (!overlapX || !overlapY) continue;

      if (axis === "x") {
        if (prevBottom <= tileY + 0.5) continue;
        if (player.vx > 0) player.x = tileX - PLAYER_W;
        else if (player.vx < 0) player.x = tileX + TILE;
        player.vx = 0;
      } else if (player.vy > 0) {
        player.y = tileY - PLAYER_H;
        player.vy = 0;
        player.onGround = true;
        player.jumpTimer = 0;
        if (!wasOnGround) player.landSquash = 1;
      } else if (player.vy < 0) {
        player.y = tileY + TILE;
        player.vy = 0;
      }
    }
  }
}

function catchGoalLedge(player: Player, level: Level) {
  if (player.onGround || player.vy <= 0) return;
  const { x, y, w } = level.goalLedge;
  const feet = player.y + PLAYER_H;
  if (player.x + PLAYER_W < x - LEDGE_CATCH || player.x >= x + w) return;
  if (feet < y - 2 || feet > y + 8) return;
  if (player.x + PLAYER_W < x) player.x = x - PLAYER_W + 3;
  player.y = y - PLAYER_H;
  player.vy = 0;
  player.onGround = true;
  player.jumpTimer = 0;
  player.landSquash = 1;
}
