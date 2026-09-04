import { createGame, tick } from "../src/game.ts";
import { createLevel } from "../src/level.ts";
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

const hold = (x: number, jumpHeld: boolean, jumpPressed = false, y = 0): InputState => ({
  x,
  y,
  jumpHeld,
  jumpPressed,
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

const buffer = settleOnSpawn();
simulate(buffer, hold(0, true, true), 1);
simulate(buffer, hold(0, false), 10);
simulate(buffer, hold(0, true, true), 1);
simulate(buffer, hold(0, true), 25);
assert(
  "jump buffer fires on landing",
  !buffer.onGround && buffer.y < 6,
  `ground=${buffer.onGround} y=${buffer.y}`,
);

const pit = settleOnSpawn();
const pitLevel = createLevel();
let reached = false;
for (let i = 0; i < 400; i++) {
  const onLast = pit.x >= 24 * 8 - 4;
  const distToPit = 28 * 8 - (pit.x + PLAYER_W);
  const probeX = pit.x + PLAYER_W + 2;
  const probeY = pit.y + PLAYER_H + 1;
  const aheadSolid = pitLevel.isSolid(Math.floor(probeX / 8), Math.floor(probeY / 8));
  const jumpNow = pit.onGround && (onLast ? distToPit < 16 : !aheadSolid);
  // Early gaps: short hop so VarJumpTime does not sail over lower terraces.
  // Last ledge: hold the full arc so the downhill pit still clears.
  const jumpHeld = onLast
    ? jumpNow || !pit.onGround
    : jumpNow || (!pit.onGround && pit.jumpTimer > P.varJumpTime - 4 * TICK);
  integratePlayer(pit, hold(1, jumpHeld, jumpNow), pitLevel, TICK);
  if (pitLevel.hitsFlag(playerRect(pit))) {
    reached = true;
    break;
  }
  if (pitLevel.hitsSpike(playerRect(pit)) || isOutOfBounds(pit)) {
    throw new Error(`FAIL spike pit run died at x=${pit.x.toFixed(1)} y=${pit.y.toFixed(1)}`);
  }
}
assert("can reach flag G", reached, `x=${pit.x} y=${pit.y}`);

const early = createPlayer(24 * 8, 4 * 8 - PLAYER_H);
const earlyLevel = createLevel();
simulate(early, hold(0, false), 6);
let earlyReached = false;
for (let i = 0; i < 160; i++) {
  const distToPit = 28 * 8 - (early.x + PLAYER_W);
  const jumpNow = early.onGround && distToPit < 16;
  integratePlayer(early, hold(1, jumpNow || !early.onGround, jumpNow), earlyLevel, TICK);
  if (earlyLevel.hitsFlag(playerRect(early))) {
    earlyReached = true;
    break;
  }
  if (earlyLevel.hitsSpike(playerRect(early)) || isOutOfBounds(early)) {
    throw new Error(`FAIL early pit jump died at x=${early.x.toFixed(1)} y=${early.y.toFixed(1)}`);
  }
}
assert("pit is clearable with an early jump", earlyReached, `x=${early.x} y=${early.y}`);

const tap = createPlayer(27 * 8 - PLAYER_W, 4 * 8 - PLAYER_H);
const tapLevel = createLevel();
simulate(tap, hold(0, false), 6);
integratePlayer(tap, hold(1, true, true), tapLevel, TICK);
let tapReached = false;
for (let i = 0; i < 120; i++) {
  integratePlayer(tap, hold(1, false), tapLevel, TICK);
  if (tap.onGround && tap.x + PLAYER_W > 34 * 8) {
    tapReached = true;
    break;
  }
  if (tapLevel.hitsSpike(playerRect(tap)) || isOutOfBounds(tap)) {
    throw new Error(`FAIL tap pit jump died at x=${tap.x.toFixed(1)} y=${tap.y.toFixed(1)}`);
  }
}
assert("pit is clearable with an edge tap", tapReached, `x=${tap.x} y=${tap.y}`);

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
const faller = createPlayer(12 * 8 + 4, -40);
for (let i = 0; i < 90; i++) integratePlayer(faller, hold(0, false), fallLevel, TICK);
assert("max fall clamps to 160", Math.abs(faller.vy - P.maxFall) < 0.5, `vy=${faller.vy}`);

const fastFaller = createPlayer(12 * 8 + 4, -40);
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

console.log("all self-tests passed");
