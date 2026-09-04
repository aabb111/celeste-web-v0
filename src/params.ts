/** Central feel table. Pixel units, gravity positive downward, 60fps. */
export const PLAYER_W = 8;
export const PLAYER_H = 10;

export const P = {
  maxRunSpeed: 90,
  groundAccel: 1000,
  groundFriction: 600,
  airAccel: 600,
  /** Used only when there is no horizontal input. */
  airFriction: 80,
  jumpVelocity: -105,
  gravity: 900,
  holdJumpGravityMul: 0.5,
  varJumpWindow: 0.2,
  coyoteTime: 0.1,
  jumpBuffer: 0.1,
  deathFreeze: 0.2,
  respawnDelay: 0.5,
} as const;

export const TICK = 1 / 60;
