import type { Camera } from "./camera";
import { isTired } from "./climb";
import { COLS, ROWS, SPIKE, SOLID, TILE, VIEW_H, VIEW_W, type Level } from "./level";
import { P } from "./params";
import { PLAYER_W, type Player } from "./player";
import { bichonSpriteTop, drawBichon } from "./sprites/bichon";

const C = {
  sky: "#141a26",
  void: "#0e121b",
  solid: "#3c5270",
  solidTop: "#6d8aa8",
  spike: "#c4454d",
  spikeDark: "#8d2d38",
  hair: "#e25b4c",
  hairDash: "#5aa6e8",
  cpOff: "#6d7cff",
  cpOn: "#7dffb0",
  flagPole: "#d8c48a",
  flag: "#e25b4c",
  crystal: "#7de4ff",
  crystalDim: "#3a6270",
  spring: "#f0c14a",
  springDark: "#c4892a",
  ink: "#e8eef6",
  muted: "#8b97a8",
};

export function render(
  ctx: CanvasRenderingContext2D,
  level: Level,
  player: Player,
  camera: Camera,
  opts: {
    activeCheckpoint: number;
    status: string;
    dead: boolean;
    intro?: boolean;
    won: boolean;
    freezeFlash: number;
  },
) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = C.sky;
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.fillStyle = C.void;
  ctx.fillRect(0, 64, VIEW_W, VIEW_H - 64);

  const ox = Math.round(camera.x);
  const oy = Math.round(camera.y);
  ctx.save();
  ctx.translate(-ox, -oy);
  drawTiles(ctx, level);
  drawDoor(ctx, level);
  drawSprings(ctx, level);
  drawCrystals(ctx, level);
  drawCheckpoint(ctx, level, opts.activeCheckpoint);
  drawFlag(ctx, level, opts.won);
  drawPlayer(ctx, player, opts.dead, opts.freezeFlash, opts.intro === true);
  drawLabels(ctx, level);
  ctx.restore();
  drawHud(ctx, opts.status, opts.won);
}

function drawDoor(ctx: CanvasRenderingContext2D, level: Level) {
  const door = level.door;
  if (!door) return;
  ctx.fillStyle = "#2a3548";
  ctx.fillRect(door.x, door.y, door.w, door.h);
  ctx.fillStyle = "#0c1018";
  ctx.fillRect(door.x + 3, door.y + 4, door.w - 6, door.h - 4);
  ctx.fillStyle = C.solidTop;
  ctx.fillRect(door.x, door.y, door.w, 1);
}

function drawLabels(ctx: CanvasRenderingContext2D, level: Level) {
  ctx.fillStyle = C.muted;
  ctx.font = "5px monospace";
  for (const label of level.labels) {
    ctx.fillText(label.text, label.x, label.y);
  }
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

function drawSprings(ctx: CanvasRenderingContext2D, level: Level) {
  for (const spring of level.springs) {
    ctx.fillStyle = C.springDark;
    ctx.fillRect(spring.x, spring.y + spring.h - 2, spring.w, 2);
    ctx.fillStyle = C.spring;
    ctx.fillRect(spring.x + 1, spring.y, spring.w - 2, spring.h - 1);
  }
}

function drawCrystals(ctx: CanvasRenderingContext2D, level: Level) {
  for (const crystal of level.crystals) {
    if (crystal.cooldown > 0) {
      ctx.fillStyle = C.crystalDim;
      ctx.fillRect(crystal.x + 6, crystal.y + 6, 4, 4);
      continue;
    }
    const cx = crystal.x + crystal.w / 2;
    const cy = crystal.y + crystal.h / 2;
    ctx.fillStyle = C.crystal;
    ctx.beginPath();
    ctx.moveTo(cx, crystal.y + 1);
    ctx.lineTo(crystal.x + crystal.w - 1, cy);
    ctx.lineTo(cx, crystal.y + crystal.h - 1);
    ctx.lineTo(crystal.x + 1, cy);
    ctx.closePath();
    ctx.fill();
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
  drawBichon(ctx, player, squash);
  if (player.climbing || player.stamina < P.climbMaxStamina) {
    const ratio = Math.max(0, player.stamina / P.climbMaxStamina);
    const top = bichonSpriteTop(player, squash);
    ctx.fillStyle = isTired(player) ? C.hair : C.hairDash;
    ctx.fillRect(player.x, top - 2, Math.max(1, PLAYER_W * ratio), 1);
  }
}

function drawHud(ctx: CanvasRenderingContext2D, status: string, won: boolean) {
  ctx.fillStyle = C.muted;
  ctx.font = "5px monospace";
  ctx.fillText("ARROWS  move    SPACE / C  jump    Z  grab    X  dash    R  reset", 4, VIEW_H - 8);
  ctx.fillStyle = won ? C.cpOn : C.ink;
  ctx.fillText(status, 4, VIEW_H - 16);
}
