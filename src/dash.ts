import { P, TICK } from "./params";
import type { InputState } from "./input";
import type { Player } from "./player";

export function resetDash(player: Player) {
  player.dashes = P.maxDashes;
  player.dashTime = 0;
  player.dashFreeze = 0;
  player.dashCooldown = 0;
  player.dashRefillCooldown = 0;
  player.dashAttackTimer = 0;
  player.dashBuffer = 0;
  player.dashDirX = 0;
  player.dashDirY = 0;
  player.dashing = false;
  player.dashLaunch = false;
}

export function isDashFrozen(player: Player): boolean {
  return player.dashFreeze > 0;
}

export function hasDash(player: Player): boolean {
  return player.dashes > 0;
}

/** 8-way aim. No direction → horizontal toward facing. Diagonals are normalized. */
export function aimDash(player: Player, input: InputState) {
  let x = input.x;
  let y = input.y;
  if (x === 0 && y === 0) {
    player.dashDirX = player.facing;
    player.dashDirY = 0;
    return;
  }
  const len = Math.hypot(x, y);
  player.dashDirX = x / len;
  player.dashDirY = y / len;
}

export function bufferDash(player: Player, input: InputState) {
  player.dashBuffer = input.dashPressed ? P.dashBuffer : Math.max(0, player.dashBuffer - TICK);
}

export function canDash(player: Player): boolean {
  return (
    player.dashBuffer > 0 &&
    player.dashCooldown <= 0 &&
    player.dashes > 0 &&
    !player.dashing &&
    player.dashFreeze <= 0
  );
}

export function startDash(player: Player, input: InputState) {
  player.dashes = Math.max(0, player.dashes - 1);
  player.dashBuffer = 0;
  player.dashCooldown = P.dashCooldown;
  player.dashRefillCooldown = P.dashRefillCooldown;
  player.dashAttackTimer = P.dashAttackTime;
  player.dashFreeze = P.dashFreeze;
  player.dashTime = P.dashTime;
  player.dashing = true;
  player.dashLaunch = true;
  player.jumpTimer = 0;
  player.vx = 0;
  player.vy = 0;
  aimDash(player, input);
}

export function launchDash(player: Player) {
  player.dashLaunch = false;
  const beforeVx = player.vx;
  let vx = player.dashDirX * P.dashSpeed;
  let vy = player.dashDirY * P.dashSpeed;
  if (Math.sign(beforeVx) === Math.sign(vx) && Math.abs(beforeVx) > Math.abs(vx)) vx = beforeVx;

  if (player.onGround && player.dashDirX !== 0 && player.dashDirY > 0 && vy > 0) {
    player.dashDirX = Math.sign(player.dashDirX);
    player.dashDirY = 0;
    vy = 0;
    vx *= P.dodgeSlideSpeedMult;
  }

  player.vx = vx;
  player.vy = vy;
  if (player.dashDirX !== 0) player.facing = player.dashDirX > 0 ? 1 : -1;
}

/** Celeste AutoJump-style end velocity. No SuperJump. */
export function endDash(player: Player) {
  player.dashing = false;
  player.dashTime = 0;
  player.dashLaunch = false;
  if (player.dashDirY <= 0) {
    player.vx = player.dashDirX * P.endDashSpeed;
    player.vy = player.dashDirY * P.endDashSpeed;
  }
  if (player.vy < 0) player.vy *= P.endDashUpMult;
}

export function tickDashTimers(player: Player, dt: number) {
  if (player.dashCooldown > 0) player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  if (player.dashRefillCooldown > 0) player.dashRefillCooldown = Math.max(0, player.dashRefillCooldown - dt);
  if (player.dashAttackTimer > 0) player.dashAttackTimer = Math.max(0, player.dashAttackTimer - dt);
}

export function refillDashIfGrounded(player: Player) {
  if (!player.onGround || player.dashRefillCooldown > 0) return;
  if (player.dashes < P.maxDashes) player.dashes = P.maxDashes;
}
