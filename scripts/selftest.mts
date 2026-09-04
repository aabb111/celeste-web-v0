import { createGame, tick } from "../src/game.ts";
import { createLevel, CLIMB_BASE, CLIMB_TOP, LAND_TOP, TILE } from "../src/level.ts";
import { P, TICK } from "../src/params.ts";
import {
  PLAYER_H,
  PLAYER_W,
  createPlayer,
  integratePlayer,
  isOutOfBounds,
  playerRect,
  type Player,
} from "../src/player.ts";
import type { InputState } from "../src/input.ts";

const hold = (
  x: number,
  jumpHeld: boolean,
  jumpPressed = false,
  y = 0,
  dashPressed = false,
  grabHeld = false,
  moveY = y > 0 ? 1 : 0,
): InputState => ({
  x,
  y,
  moveY,
  jumpHeld,
  jumpPressed,
  dashHeld: dashPressed,
  dashPressed,
  grabHeld,
  resetPressed: false,
});

function simulate(player: Player, input: InputState, frames: number) {
  const level = createLevel();
  for (let i = 0; i < frames; i++) integratePlayer(player, input, level, TICK);
  return level;
}

function settleOnSpawn() {
  const level = createLevel();
  const player = createPlayer(level.spawn.x, level.spawn.y);
  simulate(player, hold(0, false), 8);
  return player;
}

function assert(name: string, ok: boolean, detail = "") {
  if (!ok) throw new Error(`FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`ok  ${name}`);
}

const grounded = settleOnSpawn();
assert("lands on start ground", grounded.onGround, `y=${grounded.y}`);

const runner = settleOnSpawn();
simulate(runner, hold(1, false), 30);
assert("reaches max run speed", Math.abs(runner.vx - 90) < 0.01, `vx=${runner.vx}`);

const hopper = settleOnSpawn();
const beforeY = hopper.y;
simulate(hopper, hold(0, true, true), 1);
simulate(hopper, hold(0, true), 8);
assert("jump leaves the ground", !hopper.onGround && hopper.y < beforeY);

const lander = settleOnSpawn();
simulate(lander, hold(0, true, true), 1);
simulate(lander, hold(0, false), 40);
assert("landing zeros vy", lander.onGround && lander.vy === 0, `vy=${lander.vy}`);

const coyote = settleOnSpawn();
const coyoteLevel = createLevel();
let leftGround = false;
for (let i = 0; i < 180 && !leftGround; i++) {
  integratePlayer(coyote, hold(1, false), coyoteLevel, TICK);
  if (!coyote.onGround) leftGround = true;
}
assert("walked off a ledge", leftGround, `x=${coyote.x} y=${coyote.y}`);
integratePlayer(coyote, hold(1, true, true), coyoteLevel, TICK);
assert("coyote jump after leaving ground", coyote.vy < 0, `vy=${coyote.vy} y=${coyote.y}`);

const spawnY = createLevel().spawn.y;
const buffer = settleOnSpawn();
simulate(buffer, hold(0, true, true), 1);
simulate(buffer, hold(0, false), 10);
simulate(buffer, hold(0, true, true), 1);
simulate(buffer, hold(0, true), 25);
assert(
  "jump buffer fires on landing",
  !buffer.onGround && buffer.y < spawnY,
  `ground=${buffer.onGround} y=${buffer.y}`,
);

const booster = settleOnSpawn();
const facing = booster.facing;
simulate(booster, hold(0, true, true), 1);
assert(
  "jump h-boost uses facing when no run input",
  Math.abs(booster.vx - P.jumpHBoost * facing) < 1,
  `vx=${booster.vx}`,
);

const varJumper = settleOnSpawn();
simulate(varJumper, hold(0, true, true), 1);
simulate(varJumper, hold(0, true), 10);
assert(
  "var jump holds rise speed while jump is held",
  varJumper.vy <= P.jumpVelocity + 1,
  `vy=${varJumper.vy}`,
);

const fallLevel = createLevel();
const faller = createPlayer(10 * TILE + 2, -40);
for (let i = 0; i < 90; i++) integratePlayer(faller, hold(0, false), fallLevel, TICK);
assert("max fall clamps to 160", Math.abs(faller.vy - P.maxFall) < 0.5, `vy=${faller.vy}`);

const fastFaller = createPlayer(10 * TILE + 2, -40);
for (let i = 0; i < 90; i++) integratePlayer(fastFaller, hold(0, false, false, 1), fallLevel, TICK);
assert("down held allows fast max fall", fastFaller.vy > P.maxFall + 10, `vy=${fastFaller.vy}`);
assert("fast fall clamps to 240", fastFaller.vy <= P.fastMaxFall + 0.01, `vy=${fastFaller.vy}`);

const air = createPlayer(16, 0);
simulate(air, hold(1, false), 6);
const airExpected = P.groundAccel * P.airMult * TICK * 6;
assert("air accel uses AirMult 0.65", Math.abs(air.vx - airExpected) < 0.5, `vx=${air.vx} expected=${airExpected}`);

const dead = createGame();
dead.player.y = 200;
tick(dead, hold(0, false));
assert("death starts unreadably long freeze", dead.mode === "dead", `mode=${dead.mode}`);
const deathFrames = Math.ceil(P.deathEffect / TICK);
for (let i = 0; i < deathFrames - 1; i++) tick(dead, hold(1, true, true));
assert("no input during death effect", dead.mode === "dead", `mode=${dead.mode}`);
tick(dead, hold(0, false));
assert("respawn clears velocity", dead.player.vx === 0 && dead.player.vy === 0);
assert("intro locks input after body place", dead.mode === "intro", `mode=${dead.mode}`);
const introX = dead.player.x;
const introFrames = Math.ceil(P.introRespawn / TICK);
for (let i = 0; i < introFrames - 1; i++) tick(dead, hold(1, true, true));
assert("still intro before window ends", dead.mode === "intro" && dead.player.x === introX);
tick(dead, hold(0, false));
assert("play resumes after intro", dead.mode === "play", `mode=${dead.mode}`);

// --- Dash ---

const freezeDash = settleOnSpawn();
const freezeX = freezeDash.x;
const freezeY = freezeDash.y;
integratePlayer(freezeDash, hold(1, false, false, 0, true), createLevel(), TICK);
assert("dash freeze starts", freezeDash.dashFreeze > 0 && freezeDash.dashing);
assert("dash freeze zeros speed", freezeDash.vx === 0 && freezeDash.vy === 0);
let freezeHeld = 0;
let freezeMoved = false;
while (freezeDash.dashFreeze > 0 && freezeHeld < 8) {
  if (Math.abs(freezeDash.x - freezeX) > 0.01 || Math.abs(freezeDash.y - freezeY) > 0.01) freezeMoved = true;
  integratePlayer(freezeDash, hold(1, false), createLevel(), TICK);
  freezeHeld += 1;
}
assert("dash freeze holds position", !freezeMoved, `x=${freezeDash.x} y=${freezeDash.y}`);
assert("dash freeze lasts ~0.05s", freezeHeld >= 2 && freezeHeld <= 4, `frames=${freezeHeld}`);
assert("dash launches at DashSpeed", Math.abs(freezeDash.vx - P.dashSpeed) < 0.5, `vx=${freezeDash.vx}`);
assert("horizontal dash has no gravity", Math.abs(freezeDash.vy) < 0.01, `vy=${freezeDash.vy}`);

const dashMotionFrames = Math.ceil((P.dashFreeze + P.dashTime) / TICK) + 3;
const endHoriz = settleOnSpawn();
integratePlayer(endHoriz, hold(1, false, false, 0, true), createLevel(), TICK);
let endHorizVx = 0;
for (let i = 0; i < dashMotionFrames; i++) {
  integratePlayer(endHoriz, hold(1, false), createLevel(), TICK);
  if (endHoriz.dashing || endHoriz.dashLaunch || endHoriz.dashFreeze > 0) continue;
  endHorizVx = endHoriz.vx;
  break;
}
assert("horizontal end speed is 160", Math.abs(Math.abs(endHorizVx) - P.endDashSpeed) < 1, `vx=${endHorizVx}`);

const upDash = createPlayer(16, 0);
upDash.onGround = false;
integratePlayer(upDash, hold(0, true, false, -1, true), createLevel(), TICK);
for (let i = 0; i < 8 && upDash.dashLaunch; i++) integratePlayer(upDash, hold(0, true, false, -1), createLevel(), TICK);
assert("up dash speed is 240", Math.abs(upDash.vy + P.dashSpeed) < 1, `vy=${upDash.vy}`);
let endUpVy = 0;
for (let i = 0; i < Math.ceil(P.dashTime / TICK) + 4; i++) {
  integratePlayer(upDash, hold(0, true, false, -1), createLevel(), TICK);
  if (upDash.dashing || upDash.dashLaunch) continue;
  endUpVy = upDash.vy;
  break;
}
assert(
  "up dash end uses EndDashUpMult",
  Math.abs(endUpVy - -P.endDashSpeed * P.endDashUpMult) < 2,
  `vy=${endUpVy}`,
);

const diag = createPlayer(16, 0);
diag.onGround = false;
integratePlayer(diag, hold(1, true, false, -1, true), createLevel(), TICK);
for (let i = 0; i < 8 && (diag.dashLaunch || diag.dashFreeze > 0); i++) {
  integratePlayer(diag, hold(1, true, false, -1), createLevel(), TICK);
}
const diagComp = P.dashSpeed / Math.SQRT2;
assert("8-way diagonal is normalized", Math.abs(diag.vx - diagComp) < 1 && Math.abs(diag.vy + diagComp) < 1, `vx=${diag.vx} vy=${diag.vy}`);

const facingDash = settleOnSpawn();
facingDash.facing = -1;
integratePlayer(facingDash, hold(0, false, false, 0, true), createLevel(), TICK);
for (let i = 0; i < 8 && (facingDash.dashLaunch || facingDash.dashFreeze > 0); i++) {
  integratePlayer(facingDash, hold(0, false), createLevel(), TICK);
}
assert("neutral dash uses facing", facingDash.vx < 0, `vx=${facingDash.vx}`);

const airDash = settleOnSpawn();
const airLevel = createLevel();
integratePlayer(airDash, hold(0, true, true), airLevel, TICK);
integratePlayer(airDash, hold(0, true), airLevel, TICK);
integratePlayer(airDash, hold(0, true, false, -1, true), airLevel, TICK);
assert("air dash consumes", airDash.dashes === 0);
for (let i = 0; i < dashMotionFrames; i++) {
  integratePlayer(airDash, hold(0, true, false, -1, true), airLevel, TICK);
}
assert("no second air dash", airDash.dashes === 0 && !airDash.dashing, `dashes=${airDash.dashes} dashing=${airDash.dashing}`);
for (let i = 0; i < 90 && !airDash.onGround; i++) integratePlayer(airDash, hold(0, false), airLevel, TICK);
assert("lands after air dash", airDash.onGround, `y=${airDash.y}`);
const refillWait = Math.ceil(P.dashRefillCooldown / TICK) + 2;
for (let i = 0; i < refillWait; i++) integratePlayer(airDash, hold(0, false), airLevel, TICK);
assert("refills on land after DashRefillCooldown", airDash.dashes === P.maxDashes, `dashes=${airDash.dashes}`);

function walkEarlyGaps() {
  const level = createLevel();
  const player = createPlayer(level.spawn.x, level.spawn.y);
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  for (let i = 0; i < 360; i++) {
    const probeX = player.x + PLAYER_W + 2;
    const probeY = player.y + PLAYER_H + 1;
    const aheadSolid = level.isSolid(Math.floor(probeX / TILE), Math.floor(probeY / TILE));
    const onCp2 = player.x >= 21 * TILE && player.x < 26 * TILE && player.onGround && player.y > 80;
    const jumpNow = player.onGround && !aheadSolid && player.x < 21 * TILE;
    const jumpHeld = jumpNow || (!player.onGround && player.jumpTimer > P.varJumpTime - 8 * TICK);
    integratePlayer(player, hold(1, jumpHeld, jumpNow), level, TICK);
    if (onCp2) return { player, level, ok: true };
    if (level.hitsSpike(playerRect(player)) || isOutOfBounds(player)) {
      return { player, level, ok: false };
    }
  }
  return { player, level, ok: false };
}

function climbWall(player: Player, level: ReturnType<typeof createLevel>) {
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  let grabbed = false;
  for (let i = 0; i < 240; i++) {
    const atWall = player.x + PLAYER_W >= 26 * TILE - 2;
    const onTop = player.onGround && player.y <= CLIMB_TOP * TILE - PLAYER_H + 2 && player.x >= 26 * TILE - 4;
    if (onTop) return true;
    const grab = atWall || player.climbing;
    if (player.climbing) grabbed = true;
    const moveX = player.climbing ? 0 : 1;
    integratePlayer(player, hold(moveX, false, false, 0, false, grab, player.climbing ? -1 : 0), level, TICK);
  }
  return grabbed && player.x >= 26 * TILE - 4 && player.y <= CLIMB_TOP * TILE - PLAYER_H + 8;
}

function dashFromClimbTop(player: Player, level: ReturnType<typeof createLevel>, allowDash: boolean) {
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  for (let i = 0; i < 50 && player.x < 31 * TILE; i++) {
    integratePlayer(player, hold(1, false), level, TICK);
  }
  integratePlayer(player, hold(1, true, true, -1), level, TICK);
  for (let i = 0; i < 8; i++) {
    integratePlayer(player, hold(1, true, false, -1, allowDash && i === 7), level, TICK);
  }
  for (let i = 0; i < 160; i++) {
    integratePlayer(player, hold(1, true, false, allowDash ? -1 : 0), level, TICK);
    if (level.hitsFlag(playerRect(player)) || (player.onGround && player.x >= 37 * TILE)) return true;
    if (level.hitsSpike(playerRect(player)) || isOutOfBounds(player)) return false;
  }
  return false;
}

const early = walkEarlyGaps();
assert("early segments reach CP2 climb base", early.ok, `x=${early.player.x} y=${early.player.y}`);

const pit = createPlayer(14 * TILE, LAND_TOP * TILE - PLAYER_H);
const pitLevel = createLevel();
for (let i = 0; i < 8; i++) integratePlayer(pit, hold(0, false), pitLevel, TICK);
integratePlayer(pit, hold(1, true, true), pitLevel, TICK);
for (let i = 0; i < 8; i++) integratePlayer(pit, hold(1, true), pitLevel, TICK);
let pitLanded = false;
for (let i = 0; i < 140; i++) {
  integratePlayer(pit, hold(1, false), pitLevel, TICK);
  if (pit.onGround && pit.x >= 21 * TILE && pit.x < 26 * TILE) {
    pitLanded = true;
    break;
  }
  if (pitLevel.hitsSpike(playerRect(pit)) || isOutOfBounds(pit)) {
    throw new Error(`FAIL spike pit jump died at x=${pit.x.toFixed(1)} y=${pit.y.toFixed(1)}`);
  }
}
assert("spike pit is clearable with a jump", pitLanded, `x=${pit.x} y=${pit.y}`);

const climber = createPlayer(24 * TILE, CLIMB_BASE * TILE - PLAYER_H);
const climbLevel = createLevel();
assert("climbs wall to y≈8 ledge", climbWall(climber, climbLevel), `x=${climber.x} y=${climber.y} climb=${climber.climbing} stam=${climber.stamina}`);

const still = createPlayer(24 * TILE, CLIMB_BASE * TILE - PLAYER_H);
const stillLevel = createLevel();
for (let i = 0; i < 20; i++) integratePlayer(still, hold(1, false), stillLevel, TICK);
for (let i = 0; i < 8 && !still.climbing; i++) {
  integratePlayer(still, hold(1, false, false, 0, false, true, 0), stillLevel, TICK);
}
assert("grabs wall", still.climbing, `x=${still.x} climb=${still.climbing}`);
const stam0 = still.stamina;
for (let i = 0; i < 60; i++) integratePlayer(still, hold(0, false, false, 0, false, true, 0), stillLevel, TICK);
assert("still drain uses ClimbStillCost", stam0 - still.stamina > 8 && stam0 - still.stamina < 12, `d=${stam0 - still.stamina}`);

const upCost = createPlayer(24 * TILE, CLIMB_BASE * TILE - PLAYER_H);
const upLevel = createLevel();
for (let i = 0; i < 20; i++) integratePlayer(upCost, hold(1, false), upLevel, TICK);
for (let i = 0; i < 8 && !upCost.climbing; i++) {
  integratePlayer(upCost, hold(1, false, false, 0, false, true, -1), upLevel, TICK);
}
const noMove = Math.ceil(P.climbNoMoveTime / TICK) + 1;
for (let i = 0; i < noMove; i++) integratePlayer(upCost, hold(0, false, false, 0, false, true, -1), upLevel, TICK);
const stamUp0 = upCost.stamina;
const yUp0 = upCost.y;
for (let i = 0; i < 30; i++) integratePlayer(upCost, hold(0, false, false, 0, false, true, -1), upLevel, TICK);
assert("climb up moves toward -Y", upCost.y < yUp0 - 10, `y0=${yUp0} y=${upCost.y}`);
assert(
  "climb up drains ClimbUpCost",
  stamUp0 - upCost.stamina > 18 && stamUp0 - upCost.stamina < 28,
  `d=${stamUp0 - upCost.stamina}`,
);

const tired = createPlayer(25 * TILE, 70);
const tiredLevel = createLevel();
tired.stamina = 19;
tired.facing = 1;
tired.onGround = false;
for (let i = 0; i < 12; i++) integratePlayer(tired, hold(1, false, false, 0, false, true, 0), tiredLevel, TICK);
assert("tired blocks starting grab", !tired.climbing && tired.stamina < P.climbTired, `climb=${tired.climbing} stam=${tired.stamina}`);

const midTired = createPlayer(24 * TILE, CLIMB_BASE * TILE - PLAYER_H);
const midLevel = createLevel();
for (let i = 0; i < 20; i++) integratePlayer(midTired, hold(1, false), midLevel, TICK);
for (let i = 0; i < 8 && !midTired.climbing; i++) {
  integratePlayer(midTired, hold(1, false, false, 0, false, true, -1), midLevel, TICK);
}
for (let i = 0; i < 20 && midTired.onGround; i++) {
  integratePlayer(midTired, hold(0, false, false, 0, false, true, -1), midLevel, TICK);
}
assert("starts grab at full stamina", midTired.climbing && !midTired.onGround, `climb=${midTired.climbing} gnd=${midTired.onGround}`);
midTired.stamina = 15;
for (let i = 0; i < 10; i++) integratePlayer(midTired, hold(0, false, false, 0, false, true, -1), midLevel, TICK);
assert("mid-climb continues while tired", midTired.climbing && midTired.stamina < 20, `climb=${midTired.climbing} stam=${midTired.stamina}`);

const cJump = createPlayer(24 * TILE, CLIMB_BASE * TILE - PLAYER_H);
const cJumpLevel = createLevel();
for (let i = 0; i < 20; i++) integratePlayer(cJump, hold(1, false), cJumpLevel, TICK);
for (let i = 0; i < 8 && !cJump.climbing; i++) {
  integratePlayer(cJump, hold(1, false, false, 0, false, true, -1), cJumpLevel, TICK);
}
for (let i = 0; i < 24 && cJump.onGround; i++) {
  integratePlayer(cJump, hold(0, false, false, 0, false, true, -1), cJumpLevel, TICK);
}
const stamJump = cJump.stamina;
integratePlayer(cJump, hold(0, true, true, 0, false, true, 0), cJumpLevel, TICK);
assert("neutral grab jump is ClimbJump", !cJump.climbing && cJump.vy <= P.jumpVelocity + 1, `vy=${cJump.vy} climb=${cJump.climbing}`);
assert("ClimbJump costs stamina", stamJump - cJump.stamina >= P.climbJumpCost - 0.01, `d=${stamJump - cJump.stamina}`);

const wJump = createPlayer(24 * TILE, CLIMB_BASE * TILE - PLAYER_H);
const wJumpLevel = createLevel();
for (let i = 0; i < 20; i++) integratePlayer(wJump, hold(1, false), wJumpLevel, TICK);
for (let i = 0; i < 8 && !wJump.climbing; i++) {
  integratePlayer(wJump, hold(1, false, false, 0, false, true, 0), wJumpLevel, TICK);
}
const stamW = wJump.stamina;
integratePlayer(wJump, hold(-1, true, true, 0, false, true, 0), wJumpLevel, TICK);
assert("away jump is WallJump", wJump.vx <= -P.wallJumpHSpeed + 1, `vx=${wJump.vx}`);
assert("WallJump uses JumpSpeed", wJump.vy <= P.jumpVelocity + 1, `vy=${wJump.vy}`);
assert("WallJump does not spend stamina", stamW - wJump.stamina < 1, `d=${stamW - wJump.stamina}`);

const dashOff = createPlayer(24 * TILE, CLIMB_BASE * TILE - PLAYER_H);
const dashOffLevel = createLevel();
for (let i = 0; i < 20; i++) integratePlayer(dashOff, hold(1, false), dashOffLevel, TICK);
for (let i = 0; i < 8 && !dashOff.climbing; i++) {
  integratePlayer(dashOff, hold(1, false, false, 0, false, true, 0), dashOffLevel, TICK);
}
assert("holding wall before dash-off", dashOff.climbing);
integratePlayer(dashOff, hold(-1, false, false, 0, true, true, 0), dashOffLevel, TICK);
assert("can dash off wall", dashOff.dashing && !dashOff.climbing, `dash=${dashOff.dashing} climb=${dashOff.climbing}`);

const slider = createPlayer(24 * TILE, 40);
const slideLevel = createLevel();
slider.facing = 1;
slider.vy = 80;
let slid = false;
for (let i = 0; i < 40; i++) {
  integratePlayer(slider, hold(1, false), slideLevel, TICK);
  if (slider.x + PLAYER_W >= 26 * TILE - 1 && slider.vy > 0 && slider.vy < P.maxFall - 20) {
    slid = true;
    break;
  }
}
assert("wall slide without grab slows fall", slid, `vy=${slider.vy} x=${slider.x}`);

const top = createPlayer(31 * TILE, CLIMB_TOP * TILE - PLAYER_H);
const topLevel = createLevel();
assert("dash from CP3 reaches flag G", dashFromClimbTop(top, topLevel, true), `x=${top.x} y=${top.y}`);

const jumpOnly = createPlayer(31 * TILE, CLIMB_TOP * TILE - PLAYER_H);
const jumpOnlyLevel = createLevel();
assert(
  "pure jump cannot clear must-dash gap",
  !dashFromClimbTop(jumpOnly, jumpOnlyLevel, false) && !jumpOnlyLevel.hitsFlag(playerRect(jumpOnly)),
  `x=${jumpOnly.x} y=${jumpOnly.y}`,
);

const full = walkEarlyGaps();
assert("full run reaches climb base", full.ok, `x=${full.player.x} y=${full.player.y}`);
assert("full run climbs wall", climbWall(full.player, full.level), `x=${full.player.x} y=${full.player.y}`);
assert(
  "full run dashes to G",
  dashFromClimbTop(full.player, full.level, true),
  `x=${full.player.x} y=${full.player.y}`,
);

console.log("all self-tests passed");
