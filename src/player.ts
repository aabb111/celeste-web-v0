import { approach } from "./aabb";
import { moveAndCollide } from "./collide";
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
};

export function createPlayer(x: number, y: number): Player {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    coyote: 0,
    buffer: 0,
    jumpTimer: 0,
    varJumpSpeed: P.jumpVelocity,
    maxFall: P.maxFall,
    landSquash: 0,
  };
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
}

export function integratePlayer(player: Player, input: InputState, level: Level, dt: number) {
  player.landSquash = Math.max(0, player.landSquash - dt / 0.12);
  applyRun(player, input, dt);
  applyMaxFall(player, input, dt);
  applyGravity(player, input, dt);
  applyVarJump(player, input, dt);
  // Collide before jump so landing refreshes coyote in time to consume the buffer.
  moveAndCollide(player, level, dt);
  applyJump(player, input, dt);
}

function applyRun(player: Player, input: InputState, dt: number) {
  const moveX = input.x;
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

function applyGravity(player: Player, input: InputState, dt: number) {
  // Always integrate gravity so the AABB solver can re-stick feet to the floor.
  const risingOrApex = Math.abs(player.vy) < P.halfGravThreshold;
  const halfGrav = input.jumpHeld && risingOrApex;
  const grav = P.gravity * (halfGrav ? P.holdJumpGravityMul : 1);
  player.vy = approach(player.vy, player.maxFall, grav * dt);
}

function applyVarJump(player: Player, input: InputState, dt: number) {
  if (player.jumpTimer <= 0) return;
  player.jumpTimer = Math.max(0, player.jumpTimer - dt);
  if (input.jumpHeld) player.vy = Math.min(player.vy, player.varJumpSpeed);
  else player.jumpTimer = 0;
}

function applyJump(player: Player, input: InputState, dt: number) {
  player.coyote = player.onGround ? P.coyoteTime : Math.max(0, player.coyote - dt);
  player.buffer = input.jumpPressed ? P.jumpBuffer : Math.max(0, player.buffer - dt);
  if (player.buffer <= 0 || player.coyote <= 0) return;

  const boostDir = input.x !== 0 ? Math.sign(input.x) : player.facing;
  player.vx += P.jumpHBoost * boostDir;
  player.vy = P.jumpVelocity;
  player.varJumpSpeed = player.vy;
  player.onGround = false;
  player.coyote = 0;
  player.buffer = 0;
  player.jumpTimer = P.varJumpTime;
}

export function isOutOfBounds(player: Player): boolean {
  return player.y > ROOM_H;
}

export function playerRect(player: Player) {
  return { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };
}
