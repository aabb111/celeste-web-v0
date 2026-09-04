/** Central feel table. Pixel units, gravity positive downward, 60fps. */
export const PLAYER_W = 8;
export const PLAYER_H = 10;

/** NoelFB/Celeste-style player feel (web subset: dash + climb, no SuperWallJump). */
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
  /** DashSpeed */
  dashSpeed: 240,
  /** DashTime */
  dashTime: 0.15,
  /** EndDashSpeed — AutoJump-style end velocity (no SuperJump) */
  endDashSpeed: 160,
  /** EndDashUpMult */
  endDashUpMult: 0.75,
  /** DashCooldown */
  dashCooldown: 0.2,
  /** DashRefillCooldown */
  dashRefillCooldown: 0.1,
  /** DashAttackTime — tracked even if unused by room objects */
  dashAttackTime: 0.3,
  /** Celeste.Freeze on dash start */
  dashFreeze: 0.05,
  /** Dash press buffer */
  dashBuffer: 0.08,
  /** MaxDashes */
  maxDashes: 1,
  /** DodgeSlideSpeedMult — grounded diagonal-down dash */
  dodgeSlideSpeedMult: 1.2,
  /** DashVFloorSnapDist */
  dashFloorSnap: 3,
  /** ClimbMaxStamina */
  climbMaxStamina: 110,
  /** ClimbTiredThreshold — cannot START a grab below this */
  climbTired: 20,
  /** ClimbUpCost ≈ 100 / 2.2 */
  climbUpCost: 100 / 2.2,
  /** ClimbStillCost */
  climbStillCost: 10,
  /** ClimbJumpCost */
  climbJumpCost: 27.5,
  /** ClimbUpSpeed (up is negative Y) */
  climbUpSpeed: -45,
  /** ClimbDownSpeed */
  climbDownSpeed: 80,
  /** ClimbSlipSpeed — slide when hands sit on the lip */
  climbSlipSpeed: 30,
  /** ClimbAccel */
  climbAccel: 900,
  /** ClimbGrabYMult — vy kept on grab start */
  climbGrabYMult: 0.2,
  /** ClimbNoMoveTime */
  climbNoMoveTime: 0.1,
  /** ClimbHopX */
  climbHopX: 100,
  /** ClimbHopY */
  climbHopY: -120,
  /** ClimbHopForceTime — lock move after a ledge hop */
  climbHopForceTime: 0.2,
  /** ClimbJumpBoostTime — away input converts ClimbJump → WallJump */
  climbJumpBoostTime: 0.2,
  /** WallJumpHSpeed = MaxRun + JumpHBoost */
  wallJumpHSpeed: 130,
  /** WallJumpForceTime */
  wallJumpForceTime: 0.16,
  /** WallJumpCheckDist (px) */
  wallJumpCheckDist: 3,
  /** ClimbCheckDist (px) */
  climbCheckDist: 2,
  /** WallSlideStartMax */
  wallSlideStartMax: 20,
  /** WallSlideTime */
  wallSlideTime: 1.2,
} as const;

export const TICK = 1 / 60;
