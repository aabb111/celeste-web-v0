import { COLS, ROOM_H, ROOM_W, ROWS, SPIKE, SOLID, TILE, type Level } from "./level";
import { PLAYER_H, PLAYER_W, type Player } from "./player";

const C = {
  sky: "#141a26",
  void: "#0e121b",
  solid: "#3c5270",
  solidTop: "#6d8aa8",
  spike: "#c4454d",
  spikeDark: "#8d2d38",
  player: "#8fd4e8",
  playerDark: "#3d7f96",
  hair: "#e25b4c",
  hairDash: "#5aa6e8",
  hairFlash: "#e8eef6",
  cpOff: "#6d7cff",
  cpOn: "#7dffb0",
  flagPole: "#d8c48a",
  flag: "#e25b4c",
  ink: "#e8eef6",
  muted: "#8b97a8",
};

export function render(
  ctx: CanvasRenderingContext2D,
  level: Level,
  player: Player,
  opts: {
    activeCheckpoint: number;
    status: string;
    dead: boolean;
    intro?: boolean;
    won: boolean;
    freezeFlash: number;
  },
) {
  ctx.clearRect(0, 0, ROOM_W, ROOM_H);
  ctx.fillStyle = C.sky;
  ctx.fillRect(0, 0, ROOM_W, 64);
  ctx.fillStyle = C.void;
  ctx.fillRect(0, 64, ROOM_W, ROOM_H - 64);

  drawTiles(ctx, level);
  drawCheckpoint(ctx, level, opts.activeCheckpoint);
  drawFlag(ctx, level, opts.won);
  drawPlayer(ctx, player, opts.dead, opts.freezeFlash, opts.intro === true);
  drawLabels(ctx, level);
  drawHud(ctx, opts.status, opts.won);
}

function drawLabels(ctx: CanvasRenderingContext2D, level: Level) {
  ctx.fillStyle = C.muted;
  ctx.font = "5px monospace";
  ctx.fillText("S", 16, 22);
  ctx.fillText("G", level.flag.x, level.flag.y - 2);
  ctx.fillText("dash", 252, 52);
}

function drawTiles(ctx: CanvasRenderingContext2D, level: Level) {
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const type = level.at(tx, ty);
      const x = tx * TILE;
      const y = ty * TILE;
      if (type === SOLID) {
        ctx.fillStyle = C.solid;
        ctx.fillRect(x, y, TILE, TILE);
        if (ty === 0 || level.at(tx, ty - 1) !== SOLID) {
          ctx.fillStyle = C.solidTop;
          ctx.fillRect(x, y, TILE, 1);
        }
      } else if (type === SPIKE) {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? C.spike : C.spikeDark;
        ctx.fillRect(x, y, TILE, TILE);
      }
    }
  }
}

function drawCheckpoint(ctx: CanvasRenderingContext2D, level: Level, active: number) {
  for (const cp of level.checkpoints) {
    if (cp.id === 0) continue;
    const cx = cp.x + cp.w / 2;
    const mid = cp.y + cp.h * 0.45;
    ctx.fillStyle = active >= cp.id ? C.cpOn : C.cpOff;
    ctx.beginPath();
    ctx.moveTo(cx, cp.y);
    ctx.lineTo(cp.x + cp.w, mid);
    ctx.lineTo(cx, cp.y + cp.h);
    ctx.lineTo(cp.x, mid);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFlag(ctx: CanvasRenderingContext2D, level: Level, won: boolean) {
  const { flag } = level;
  ctx.fillStyle = C.flagPole;
  ctx.fillRect(flag.x, flag.y, 1, flag.h);
  ctx.fillStyle = won ? C.cpOn : C.flag;
  ctx.fillRect(flag.x + 1, flag.y, flag.w - 1, 6);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  dead: boolean,
  flash: number,
  intro: boolean,
) {
  if (dead && flash % 2 === 0) return;
  const squash = intro ? 1 : player.landSquash;
  const sx = 1 + 0.35 * squash;
  const sy = 1 - 0.35 * squash;
  const w = PLAYER_W * sx;
  const h = PLAYER_H * sy;
  const x = player.x + (PLAYER_W - w) / 2;
  const y = player.y + PLAYER_H - h;
  ctx.fillStyle = C.playerDark;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.player;
  ctx.fillRect(x + 1, y + 1, Math.max(1, w - 2), Math.max(1, h - 3));
  ctx.fillStyle =
    player.dashFreeze > 0 || player.dashing
      ? C.hairFlash
      : player.dashes > 0
        ? C.hairDash
        : C.hair;
  ctx.fillRect(player.facing === 1 ? x + w - 4 : x, y - 2, 4, 3);
}

function drawHud(ctx: CanvasRenderingContext2D, status: string, won: boolean) {
  ctx.fillStyle = C.muted;
  ctx.font = "5px monospace";
  ctx.fillText("LEFT / RIGHT  move    SPACE / Z  jump    X  dash    DOWN  fast-fall    R  reset", 4, ROOM_H - 8);
  ctx.fillStyle = won ? C.cpOn : C.ink;
  ctx.fillText(status, 4, ROOM_H - 16);
}
