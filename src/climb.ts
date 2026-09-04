import { approach } from "./aabb";
import { againstWall, moveAndCollide, overlapsSolid } from "./collide";
import { P, PLAYER_H, PLAYER_W } from "./params";
import type { InputState } from "./input";
import type { Player } from "./player";
import type { Level } from "./level";

export function resetClimb(player: Player) {
  player.stamina = P.climbMaxStamina;
  player.climbing = false;
  player.climbDir = 1;
  player.climbNoMove = 0;
  player.lastClimbMove = 0;
  player.wallSlideTimer = P.wallSlideTime;
  player.wallSlideDir = 0;
  player.wallBoostTimer = 0;
  player.wallBoostDir = 0;
  player.forceMoveX = 0;
  player.forceMoveXTimer = 0;
}

export function isTired(player: Player): boolean {
  const check = player.wallBoostTimer > 0 ? player.stamina + P.climbJumpCost : player.stamina;
  return check < P.climbTired;
}

export function refillStamina(player: Player) {
  if (!player.onGround) return;
  player.stamina = P.climbMaxStamina;
  player.wallSlideTimer = P.wallSlideTime;
}

export function endClimb(player: Player) {
  player.climbing = false;
  player.lastClimbMove = 0;
}

export function runAxis(player: Player, input: InputState): number {
  return player.forceMoveXTimer > 0 ? player.forceMoveX : input.x;
}

export function tickForceMove(player: Player, dt: number) {
  if (player.forceMoveXTimer > 0) player.forceMoveXTimer = Math.max(0, player.forceMoveXTimer - dt);
}

export function beginClimb(player: Player, level: Level, dir: 1 | -1) {
  player.climbing = true;
  player.climbDir = dir;
  player.facing = dir;
  player.vx = 0;
  player.vy *= P.climbGrabYMult;
  player.climbNoMove = P.climbNoMoveTime;
  player.wallSlideTimer = P.wallSlideTime;
  player.wallBoostTimer = 0;
  player.lastClimbMove = 0;
  for (let i = 0; i < P.climbCheckDist; i++) {
    if (againstWall(player, level, dir, 1)) break;
    player.x += dir;
  }
}

export function tryStartClimb(player: Player, input: InputState, level: Level): boolean {
  if (!input.grabHeld || isTired(player) || player.climbing) return false;
  if (player.vy < 0) return false;
  if (Math.sign(player.vx) === -player.facing) return false;
  const dir = player.facing;
  if (!againstWall(player, level, dir, P.climbCheckDist)) return false;
  beginClimb(player, level, dir);
  return true;
}

export function climbJump(player: Player, input: InputState) {
  if (!player.onGround) player.stamina -= P.climbJumpCost;
  const boostDir = input.x !== 0 ? Math.sign(input.x) : 0;
  player.vx += P.jumpHBoost * boostDir;
  player.vy = P.jumpVelocity;
  player.varJumpSpeed = player.vy;
  player.jumpTimer = P.varJumpTime;
  player.onGround = false;
  player.coyote = 0;
  player.buffer = 0;
  player.wallSlideTimer = P.wallSlideTime;
  if (input.x === 0) {
    player.wallBoostDir = -player.facing;
    player.wallBoostTimer = P.climbJumpBoostTime;
  } else {
    player.wallBoostTimer = 0;
  }
  endClimb(player);
}

export function wallJump(player: Player, dir: 1 | -1, lockMove: boolean) {
  player.vx = P.wallJumpHSpeed * dir;
  player.vy = P.jumpVelocity;
  player.varJumpSpeed = player.vy;
  player.jumpTimer = P.varJumpTime;
  player.onGround = false;
  player.coyote = 0;
  player.buffer = 0;
  player.wallSlideTimer = P.wallSlideTime;
  player.wallBoostTimer = 0;
  player.facing = dir;
  if (lockMove) {
    player.forceMoveX = dir;
    player.forceMoveXTimer = P.wallJumpForceTime;
  }
  endClimb(player);
}

function climbHop(player: Player) {
  player.vx = player.facing * P.climbHopX;
  player.vy = Math.min(player.vy, P.climbHopY);
  player.varJumpSpeed = player.vy;
  player.forceMoveX = 0;
  player.forceMoveXTimer = P.climbHopForceTime;
  player.jumpTimer = 0;
  endClimb(player);
}

/** Lip of the held wall — hands sit above the solid. */
export function slipCheck(player: Player, level: Level, addY = 0): boolean {
  const side = player.climbDir > 0 ? player.x + PLAYER_W : player.x - 1;
  const top = player.y + addY;
  return !overlapsSolid(level, side, top + 4, 1, 1) && !overlapsSolid(level, side, top, 1, 1);
}

export function stepClimb(player: Player, input: InputState, level: Level, dt: number) {
  player.climbNoMove = Math.max(0, player.climbNoMove - dt);
  if (player.onGround) player.stamina = P.climbMaxStamina;
  player.facing = player.climbDir;
  player.vx = 0;

  player.buffer = input.jumpPressed ? P.jumpBuffer : Math.max(0, player.buffer - dt);
  if (player.buffer > 0) {
    if (input.x === -player.climbDir) wallJump(player, -player.climbDir as 1 | -1, input.x !== 0);
    else climbJump(player, input);
    return;
  }

  if (!input.grabHeld) {
    endClimb(player);
    return;
  }

  if (!againstWall(player, level, player.climbDir, P.climbCheckDist)) {
    if (player.vy < 0) climbHop(player);
    else endClimb(player);
    return;
  }

  let target = 0;
  let trySlip = false;
  if (player.climbNoMove > 0) {
    trySlip = true;
  } else if (input.moveY < 0) {
    target = P.climbUpSpeed;
    if (overlapsSolid(level, player.x, player.y - 1, PLAYER_W, 1)) {
      if (player.vy < 0) player.vy = 0;
      target = 0;
      trySlip = true;
    } else if (slipCheck(player, level)) {
      climbHop(player);
      return;
    }
  } else if (input.moveY > 0) {
    target = player.onGround ? 0 : P.climbDownSpeed;
    if (player.onGround && player.vy > 0) player.vy = 0;
  } else {
    trySlip = true;
  }

  player.lastClimbMove = Math.sign(target);
  if (trySlip && slipCheck(player, level)) target = P.climbSlipSpeed;

  player.vy = approach(player.vy, target, P.climbAccel * dt);

  if (input.moveY <= 0 && player.vy > 0 && !againstWallAt(player, level, 1)) {
    player.vy = 0;
  }

  if (player.climbNoMove <= 0) {
    if (player.lastClimbMove === -1) player.stamina -= P.climbUpCost * dt;
    else if (player.lastClimbMove === 0) player.stamina -= P.climbStillCost * dt;
  }

  if (player.stamina <= 0) {
    player.stamina = 0;
    endClimb(player);
    return;
  }

  moveAndCollide(player, level, dt);
}

function againstWallAt(player: Player, level: Level, yAdd: number): boolean {
  const dir = player.climbDir;
  if (dir > 0) return overlapsSolid(level, player.x + PLAYER_W, player.y + yAdd, 1, PLAYER_H);
  return overlapsSolid(level, player.x - 1, player.y + yAdd, 1, PLAYER_H);
}

export function applyWallBoost(player: Player, input: InputState, dt: number) {
  if (player.wallBoostTimer <= 0) return;
  player.wallBoostTimer = Math.max(0, player.wallBoostTimer - dt);
  if (input.x === player.wallBoostDir && player.wallBoostDir !== 0) {
    player.vx = P.wallJumpHSpeed * input.x;
    player.stamina += P.climbJumpCost;
    player.wallBoostTimer = 0;
  }
}

/** Wall-slide fall cap, or null when not sliding. */
export function wallSlideCap(player: Player, input: InputState, level: Level): number | null {
  const toward = input.x === player.facing || (input.x === 0 && input.grabHeld);
  if (toward && input.moveY !== 1) {
    if (
      player.vy >= 0 &&
      player.wallSlideTimer > 0 &&
      againstWall(player, level, player.facing, 1)
    ) {
      player.wallSlideDir = player.facing;
    }
  }
  if (player.wallSlideDir === 0) return null;
  return P.maxFall + (P.wallSlideStartMax - P.maxFall) * (player.wallSlideTimer / P.wallSlideTime);
}

export function tickWallSlide(player: Player, dt: number) {
  if (player.wallSlideDir !== 0) {
    player.wallSlideTimer = Math.max(0, player.wallSlideTimer - dt);
    player.wallSlideDir = 0;
  }
}

export function tryWallJump(player: Player, input: InputState, level: Level): boolean {
  if (player.buffer <= 0 || player.onGround) return false;
  const right = againstWall(player, level, 1, P.wallJumpCheckDist);
  const left = againstWall(player, level, -1, P.wallJumpCheckDist);
  if (right) {
    if (player.facing === 1 && input.grabHeld && player.stamina > 0) climbJump(player, input);
    else wallJump(player, -1, input.x !== 0);
    return true;
  }
  if (left) {
    if (player.facing === -1 && input.grabHeld && player.stamina > 0) climbJump(player, input);
    else wallJump(player, 1, input.x !== 0);
    return true;
  }
  return false;
}
