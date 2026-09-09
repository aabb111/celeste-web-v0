import idleUrl from "../assets/bichon-idle.png";
import jumpUrl from "../assets/bichon-jump.png";
import dashUrl from "../assets/bichon-dash.png";
import { PLAYER_H, PLAYER_W, type Player } from "../player";

export const BICHON_W = 72;
export const BICHON_H = 36;
/** Idle feet sit on this row; jump/dash keep the same body pivot. */
export const BICHON_FOOT_Y = 33;

export type BichonPose = "idle" | "jump" | "dash";

function load(src: string): HTMLImageElement {
  const img = new Image();
  img.src = src;
  return img;
}

const frames: Record<BichonPose, HTMLImageElement> = {
  idle: load(idleUrl),
  jump: load(jumpUrl),
  dash: load(dashUrl),
};

export function bichonPose(player: Player): BichonPose {
  if (player.dashing || player.dashFreeze > 0) return "dash";
  if (!player.onGround) return "jump";
  return "idle";
}

export function drawBichon(
  ctx: CanvasRenderingContext2D,
  player: Player,
  squash: number,
) {
  const img = frames[bichonPose(player)];
  if (!img.complete || img.naturalWidth === 0) return;

  const sx = 1 + 0.35 * squash;
  const sy = 1 - 0.35 * squash;
  const cx = player.x + PLAYER_W / 2;
  const feet = player.y + PLAYER_H;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, feet);
  ctx.scale(player.facing * sx, sy);
  ctx.drawImage(img, -BICHON_W / 2, -BICHON_FOOT_Y, BICHON_W, BICHON_H);
  ctx.restore();
}

export function bichonSpriteTop(player: Player, squash: number) {
  const sy = 1 - 0.35 * squash;
  return player.y + PLAYER_H - BICHON_FOOT_Y * sy;
}
