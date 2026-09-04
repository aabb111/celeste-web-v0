import { createGame, tick } from "../src/game.ts";
import { createLevel, LAND_TOP, SAFE_TOP, TILE } from "../src/level.ts";
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
): InputState => ({
  x,
  y,
  jumpHeld,
  jumpPressed,
  dashHeld: dashPressed,
  dashPressed,
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
const faller = createPlayer(9 * TILE + 4, -40);
for (let i = 0; i < 90; i++) integratePlayer(faller, hold(0, false), fallLevel, TICK);
assert("max fall clamps to 160", Math.abs(faller.vy - P.maxFall) < 0.5, `vy=${faller.vy}`);

const fastFaller = createPlayer(9 * TILE + 4, -40);
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
  for (let i = 0; i < 320; i++) {
    const probeX = player.x + PLAYER_W + 2;
    const probeY = player.y + PLAYER_H + 1;
    const aheadSolid = level.isSolid(Math.floor(probeX / TILE), Math.floor(probeY / TILE));
    const onSafe = player.x >= 28 * TILE && player.x < 31 * TILE;
    const jumpNow = player.onGround && !aheadSolid && player.x < 28 * TILE;
    const jumpHeld = jumpNow || (!player.onGround && player.jumpTimer > P.varJumpTime - 8 * TICK);
    integratePlayer(player, hold(1, jumpHeld, jumpNow), level, TICK);
    if (onSafe && player.onGround) return { player, level, ok: true };
    if (level.hitsSpike(playerRect(player)) || isOutOfBounds(player)) {
      return { player, level, ok: false };
    }
  }
  return { player, level, ok: false };
}

function jumpDashFromSafe(player: Player, level: ReturnType<typeof createLevel>, allowDash: boolean) {
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  integratePlayer(player, hold(1, true, true, -1), level, TICK);
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(1, true, false, -1, allowDash && i === 7), level, TICK);
  for (let i = 0; i < 160; i++) {
    integratePlayer(player, hold(1, true, false, allowDash ? -1 : 0), level, TICK);
    if (level.hitsFlag(playerRect(player)) || (player.onGround && player.x >= 36 * TILE)) return true;
    if (level.hitsSpike(playerRect(player)) || isOutOfBounds(player)) return false;
  }
  return false;
}

const early = walkEarlyGaps();
assert("early segments reach CP2 safe ledge", early.ok, `x=${early.player.x} y=${early.player.y}`);

const fullLevel = createLevel();
const fullPlayer = createPlayer(29 * TILE, SAFE_TOP * TILE - PLAYER_H);
assert("jump+dash reaches flag G", jumpDashFromSafe(fullPlayer, fullLevel, true), `x=${fullPlayer.x} y=${fullPlayer.y}`);

const jumpOnly = createPlayer(29 * TILE, SAFE_TOP * TILE - PLAYER_H);
const jumpOnlyLevel = createLevel();
assert(
  "pure jump cannot clear must-dash gap",
  !jumpDashFromSafe(jumpOnly, jumpOnlyLevel, false),
  `x=${jumpOnly.x} y=${jumpOnly.y}`,
);

const pit = createPlayer(21 * TILE, LAND_TOP * TILE - PLAYER_H);
const pitLevel = createLevel();
for (let i = 0; i < 8; i++) integratePlayer(pit, hold(0, false), pitLevel, TICK);
integratePlayer(pit, hold(1, true, true), pitLevel, TICK);
for (let i = 0; i < 8; i++) integratePlayer(pit, hold(1, true), pitLevel, TICK);
let pitLanded = false;
for (let i = 0; i < 120; i++) {
  integratePlayer(pit, hold(1, false), pitLevel, TICK);
  if (pit.onGround && pit.x >= 28 * TILE && pit.x < 31 * TILE) {
    pitLanded = true;
    break;
  }
  if (pitLevel.hitsSpike(playerRect(pit)) || isOutOfBounds(pit)) {
    throw new Error(`FAIL spike pit jump died at x=${pit.x.toFixed(1)} y=${pit.y.toFixed(1)}`);
  }
}
assert("spike pit is clearable with a jump", pitLanded, `x=${pit.x} y=${pit.y}`);

const dashFromSafe = createPlayer(29 * TILE, SAFE_TOP * TILE - PLAYER_H);
const dashLevel = createLevel();
for (let i = 0; i < 8; i++) integratePlayer(dashFromSafe, hold(0, false), dashLevel, TICK);
integratePlayer(dashFromSafe, hold(1, true, true, -1), dashLevel, TICK);
let dashed = false;
let dashReached = false;
for (let i = 0; i < 200; i++) {
  const nearApex = !dashFromSafe.onGround && dashFromSafe.vy > P.jumpVelocity + 20 && dashFromSafe.vy < 40;
  const dashNow = !dashed && nearApex && dashFromSafe.dashes > 0;
  if (dashNow) dashed = true;
  integratePlayer(dashFromSafe, hold(1, true, false, -1, dashNow), dashLevel, TICK);
  if (dashLevel.hitsFlag(playerRect(dashFromSafe)) || dashFromSafe.onGround && dashFromSafe.x >= 36 * TILE) {
    dashReached = true;
    break;
  }
  if (dashLevel.hitsSpike(playerRect(dashFromSafe)) || isOutOfBounds(dashFromSafe)) break;
}
assert(
  "must-dash section completable with jump+up-right dash",
  dashReached,
  `x=${dashFromSafe.x} y=${dashFromSafe.y} on=${dashFromSafe.onGround}`,
);

console.log("all self-tests passed");
