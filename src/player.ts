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
  jumped: boolean;
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
    jumped: false,
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
  player.jumped = false;
}

export function integratePlayer(player: Player, input: InputState, level: Level, dt: number) {
  applyRun(player, input, dt);
  applyJump(player, input, dt);
  applyGravity(player, input, dt);
  moveAndCollide(player, level, dt);
}

function applyRun(player: Player, input: InputState, dt: number) {
  if (input.x !== 0) player.facing = input.x > 0 ? 1 : -1;

  if (input.x !== 0) {
    const accel = player.onGround ? P.groundAccel : P.airAccel;
    player.vx = approach(player.vx, input.x * P.maxRunSpeed, accel * dt);
    return;
  }

  const friction = player.onGround ? P.groundFriction : P.airFriction;
  player.vx = approach(player.vx, 0, friction * dt);
}

function applyJump(player: Player, input: InputState, dt: number) {
  player.coyote = player.onGround ? P.coyoteTime : Math.max(0, player.coyote - dt);
  player.buffer = input.jumpPressed ? P.jumpBuffer : Math.max(0, player.buffer - dt);
  player.jumpTimer = Math.max(0, player.jumpTimer - dt);

  if (player.buffer > 0 && player.coyote > 0) {
    player.vy = P.jumpVelocity;
    player.onGround = false;
    player.coyote = 0;
    player.buffer = 0;
    player.jumpTimer = P.varJumpWindow;
    player.jumped = true;
  }

  if (!input.jumpHeld) player.jumped = false;
}

function applyGravity(player: Player, input: InputState, dt: number) {
  let gravity = P.gravity;
  // Hold jump to keep reduced gravity; release (especially inside varJumpWindow) for a short hop.
  if (input.jumpHeld && player.jumped) gravity *= P.holdJumpGravityMul;
  player.vy += gravity * dt;
}

export function isOutOfBounds(player: Player): boolean {
  return player.y > ROOM_H;
}

export function playerRect(player: Player) {
  return { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };
}
