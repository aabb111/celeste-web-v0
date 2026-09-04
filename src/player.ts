import { approach } from "./aabb";
import { moveAndCollide, snapToFloor } from "./collide";
import {
  applyWallBoost,
  endClimb,
  refillStamina,
  resetClimb,
  runAxis,
  stepClimb,
  tickForceMove,
  tickWallSlide,
  tryStartClimb,
  tryWallJump,
  wallSlideCap,
} from "./climb";
import {
  aimDash,
  bufferDash,
  canDash,
  endDash,
  isDashFrozen,
  launchDash,
  refillDashIfGrounded,
  resetDash,
  startDash,
  tickDashTimers,
} from "./dash";
import { P, PLAYER_H, PLAYER_W } from "./params";
import { ROOM_H, type Level } from "./level";
import type { InputState } from "./input";

export { PLAYER_H, PLAYER_W };

export type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  coyote: number;
  buffer: number;
  jumpTimer: number;
  varJumpSpeed: number;
  maxFall: number;
  landSquash: number;
  dashes: number;
  dashTime: number;
  dashFreeze: number;
  dashCooldown: number;
  dashRefillCooldown: number;
  dashAttackTimer: number;
  dashBuffer: number;
  dashDirX: number;
  dashDirY: number;
  dashing: boolean;
  dashLaunch: boolean;
  stamina: number;
  climbing: boolean;
  climbDir: 1 | -1;
  climbNoMove: number;
  lastClimbMove: number;
  wallSlideTimer: number;
  wallSlideDir: number;
  wallBoostTimer: number;
  wallBoostDir: number;
  forceMoveX: number;
  forceMoveXTimer: number;
};

export function createPlayer(x: number, y: number): Player {
  const player = {
    x,
    y,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1 as const,
    coyote: 0,
    buffer: 0,
    jumpTimer: 0,
    varJumpSpeed: P.jumpVelocity,
    maxFall: P.maxFall,
    landSquash: 0,
  } as Player;
  resetDash(player);
  resetClimb(player);
  return player;
}

export function resetPlayer(player: Player, x: number, y: number) {
  player.x = x;
  player.y = y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.coyote = 0;
  player.buffer = 0;
  player.jumpTimer = 0;
  player.varJumpSpeed = P.jumpVelocity;
  player.maxFall = P.maxFall;
  player.landSquash = 0;
  resetDash(player);
  resetClimb(player);
}

export function integratePlayer(player: Player, input: InputState, level: Level, dt: number) {
  player.landSquash = Math.max(0, player.landSquash - dt / 0.12);
  bufferDash(player, input);

  if (isDashFrozen(player)) {
    player.dashFreeze = Math.max(0, player.dashFreeze - dt);
    aimDash(player, input);
    if (isDashFrozen(player)) return;
  }

  if (player.dashLaunch) launchDash(player);
  if (canDash(player)) {
    endClimb(player);
    startDash(player, input);
  }
  if (isDashFrozen(player)) return;

  tickDashTimers(player, dt);
  tickWallSlide(player, dt);

  if (player.dashing) {
    stepDash(player, input, level, dt);
    return;
  }

  if (player.climbing) {
    stepClimb(player, input, level, dt);
    refillDashIfGrounded(player);
    return;
  }

  applyRun(player, input, dt);
  applyMaxFall(player, input, dt);
  applyGravity(player, input, level, dt);
  applyVarJump(player, input, dt);
  applyWallBoost(player, input, dt);
  moveAndCollide(player, level, dt);
  applyJump(player, input, level, dt);
  tryStartClimb(player, input, level);
  tickForceMove(player, dt);
  refillDashIfGrounded(player);
  refillStamina(player);
}

function stepDash(player: Player, input: InputState, level: Level, dt: number) {
  player.dashTime -= dt;
  moveAndCollide(player, level, dt);
  if (player.dashDirY <= 0) snapToFloor(player, level, P.dashFloorSnap);
  player.coyote = player.onGround ? P.coyoteTime : Math.max(0, player.coyote - dt);
  player.buffer = input.jumpPressed ? P.jumpBuffer : Math.max(0, player.buffer - dt);
  if (player.dashTime <= 0) endDash(player);
  refillDashIfGrounded(player);
}

function applyRun(player: Player, input: InputState, dt: number) {
  const moveX = runAxis(player, input);
  if (moveX !== 0) player.facing = moveX > 0 ? 1 : -1;

  const mult = player.onGround ? 1 : P.airMult;
  const target = moveX * P.maxRunSpeed;
  const overspeed = Math.abs(player.vx) > P.maxRunSpeed && Math.sign(player.vx) === moveX && moveX !== 0;
  const rate = (overspeed ? P.groundFriction : P.groundAccel) * mult;
  player.vx = approach(player.vx, target, rate * dt);
}

function applyMaxFall(player: Player, input: InputState, dt: number) {
  const holdingDown = input.y > 0 && player.vy >= P.maxFall;
  const target = holdingDown ? P.fastMaxFall : P.maxFall;
  player.maxFall = approach(player.maxFall, target, P.fastMaxAccel * dt);
}

function applyGravity(player: Player, input: InputState, level: Level, dt: number) {
  const risingOrApex = Math.abs(player.vy) < P.halfGravThreshold;
  const halfGrav = input.jumpHeld && risingOrApex;
  const grav = P.gravity * (halfGrav ? P.holdJumpGravityMul : 1);
  const slide = !player.onGround ? wallSlideCap(player, input, level) : null;
  const cap = slide ?? player.maxFall;
  player.vy = approach(player.vy, cap, grav * dt);
}

function applyVarJump(player: Player, input: InputState, dt: number) {
  if (player.jumpTimer <= 0) return;
  player.jumpTimer = Math.max(0, player.jumpTimer - dt);
  if (input.jumpHeld) player.vy = Math.min(player.vy, player.varJumpSpeed);
  else player.jumpTimer = 0;
}

function applyJump(player: Player, input: InputState, level: Level, dt: number) {
  player.coyote = player.onGround ? P.coyoteTime : Math.max(0, player.coyote - dt);
  player.buffer = input.jumpPressed ? P.jumpBuffer : Math.max(0, player.buffer - dt);
  if (player.buffer <= 0) return;
  if (player.coyote > 0) {
    const boostDir = input.x !== 0 ? Math.sign(input.x) : player.facing;
    player.vx += P.jumpHBoost * boostDir;
    player.vy = P.jumpVelocity;
    player.varJumpSpeed = player.vy;
    player.onGround = false;
    player.coyote = 0;
    player.buffer = 0;
    player.jumpTimer = P.varJumpTime;
    player.wallSlideTimer = P.wallSlideTime;
    return;
  }
  tryWallJump(player, input, level);
}

export function isOutOfBounds(player: Player): boolean {
  return player.y > ROOM_H;
}

export function playerRect(player: Player) {
  return { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };
}
