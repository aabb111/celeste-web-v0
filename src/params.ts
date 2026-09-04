/** Central feel table. Pixel units, gravity positive downward, 60fps. */
export const PLAYER_W = 8;
export const PLAYER_H = 10;

/** NoelFB/Celeste-style player feel (web subset: no dash / wall grab). */
export const P = {
  /** MaxRun */
  maxRunSpeed: 90,
  /** RunAccel */
  groundAccel: 1000,
  /** RunReduce — overspeed decel toward max run (was 600). */
  groundFriction: 400,
  /** AirMult — air accel / reverse / air stop = groundAccel * airMult */
  airMult: 0.65,
  /** JumpSpeed */
  jumpVelocity: -105,
  /** JumpHBoost — added on jump start along input/facing */
  jumpHBoost: 40,
  /** Gravity */
  gravity: 900,
  /** MaxFall — normal fall clamp */
  maxFall: 160,
  /** FastMaxFall — fall clamp while holding down */
  fastMaxFall: 240,
  /** FastMaxAccel — rate max-fall eases toward FastMaxFall / MaxFall */
  fastMaxAccel: 300,
  /** HalfGravThreshold — |vy| below this + jump held → half gravity */
  halfGravThreshold: 40,
  /** Half gravity multiplier when the half-grav condition applies */
  holdJumpGravityMul: 0.5,
  /** VarJumpTime — hold jump to keep vy at the captured jump speed */
  varJumpTime: 0.2,
  /** JumpGrace */
  coyoteTime: 0.1,
  /** Jump buffer (web): 0.08s, not 0.1 */
  jumpBuffer: 0.08,
  /** DeathEffect ≈ 0.834 * 0.65 */
  deathEffect: 0.54,
  /** IntroRespawn — input locked after the body is placed */
  introRespawn: 0.6,
} as const;

export const TICK = 1 / 60;
