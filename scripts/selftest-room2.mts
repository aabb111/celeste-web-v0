import { createGame, loadRoom, tick } from "../src/game.ts";
import {
  createLevel,
  R2_CP1_X,
  R2_CP2_X,
  R2_ENTRY_TOP,
  R2_GOAL_TOP,
  R2_GOAL_X0,
  R2_LOW_TOP,
  R2_WALL_TOP,
  R2_WALL_X0,
  TILE,
} from "../src/level.ts";
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

function assert(name: string, ok: boolean, detail = "") {
  if (!ok) throw new Error(`FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`ok  ${name}`);
}

function room2() {
  return createLevel("room2");
}

function settle(tx: number, top: number) {
  const level = room2();
  const player = createPlayer(tx * TILE, top * TILE - PLAYER_H);
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  return { player, level };
}

function died(player: Player, level: ReturnType<typeof room2>) {
  return level.hitsSpike(playerRect(player)) || isOutOfBounds(player);
}

function jumpToward(
  player: Player,
  level: ReturnType<typeof room2>,
  frames: number,
  holdFrames = 12,
  stopX?: number,
) {
  integratePlayer(player, hold(1, true, true), level, TICK);
  for (let i = 0; i < frames; i++) {
    const held = !player.onGround && i < holdFrames && player.jumpTimer > 0;
    integratePlayer(player, hold(1, held), level, TICK);
    if (died(player, level)) return false;
    if (stopX !== undefined && player.onGround && player.x >= stopX) return true;
  }
  return stopX === undefined;
}

function walkAndHopToCp1() {
  const { player, level } = settle(2, R2_ENTRY_TOP);
  for (let i = 0; i < 400; i++) {
    const feetX = player.x + PLAYER_W + 2;
    const feetY = player.y + PLAYER_H + 1;
    const aheadSolid = level.isSolid(Math.floor(feetX / TILE), Math.floor(feetY / TILE));
    const onLow = player.onGround && player.y >= R2_LOW_TOP * TILE - PLAYER_H - 2;
    const jumpNow = onLow && !aheadSolid && player.x < R2_CP1_X * TILE;
    const shortHop = player.x < 12 * TILE;
    const holdLeft = shortHop ? P.varJumpTime - 2 * TICK : P.varJumpTime - 8 * TICK;
    const jumpHeld = jumpNow || (!player.onGround && player.jumpTimer > holdLeft);
    integratePlayer(player, hold(1, jumpHeld, jumpNow), level, TICK);
    if (died(player, level)) return { player, level, ok: false };
    if (
      player.onGround &&
      player.y >= R2_LOW_TOP * TILE - PLAYER_H - 2 &&
      player.x >= R2_CP1_X * TILE &&
      player.x < (R2_CP1_X + 2) * TILE
    ) {
      return { player, level, ok: true };
    }
  }
  return { player, level, ok: false };
}

function climbToWallTop(player: Player, level: ReturnType<typeof room2>) {
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  for (let i = 0; i < 280; i++) {
    const wall = R2_WALL_X0 * TILE;
    const atWall = player.x + PLAYER_W >= wall - 3;
    const onTop =
      player.onGround &&
      player.y <= R2_WALL_TOP * TILE - PLAYER_H + 2 &&
      player.x >= wall - 4;
    if (onTop) return true;
    const grab = atWall || player.climbing;
    const moveX = player.climbing ? 0 : 1;
    const moveY = player.climbing ? -1 : 0;
    integratePlayer(player, hold(moveX, false, false, 0, false, grab, moveY), level, TICK);
    if (died(player, level)) return false;
  }
  return player.x >= R2_WALL_X0 * TILE - 4 && player.y <= R2_WALL_TOP * TILE - PLAYER_H + 8;
}

function dashToG2(player: Player, level: ReturnType<typeof room2>, allowDash: boolean) {
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  for (let i = 0; i < 60 && player.x < R2_CP2_X * TILE; i++) {
    integratePlayer(player, hold(1, false), level, TICK);
  }
  integratePlayer(player, hold(1, true, true, -1), level, TICK);
  for (let i = 0; i < 8; i++) {
    integratePlayer(player, hold(1, true, false, -1, allowDash && i === 7), level, TICK);
  }
  for (let i = 0; i < 180; i++) {
    integratePlayer(player, hold(1, true, false, allowDash ? -1 : 0), level, TICK);
    if (level.hitsFlag(playerRect(player)) || (player.onGround && player.x >= R2_GOAL_X0 * TILE)) {
      return true;
    }
    if (died(player, level)) return false;
  }
  return false;
}

const r2 = room2();
assert("room2 spawn is S2 ≈ (x2, y9)", r2.spawn.x === 2 * TILE && r2.roomId === "room2");
assert("room2 has three checkpoints", r2.checkpoints.length === 3);
assert("room2 CP0 is spawn", r2.checkpoints[0]!.x === r2.spawn.x && r2.checkpoints[0]!.y === r2.spawn.y);
assert("room2 does not exit to another room", r2.nextRoom === null);
assert("room2 has an entry door", r2.door !== null && r2.door.x === 0);

const drop = settle(2, R2_ENTRY_TOP);
for (let i = 0; i < 120; i++) {
  integratePlayer(drop.player, hold(1, false), drop.level, TICK);
  if (
    drop.player.onGround &&
    drop.player.y >= R2_LOW_TOP * TILE - PLAYER_H - 1 &&
    drop.player.x >= 5 * TILE
  ) {
    break;
  }
}
assert(
  "drops from entry to the low terrace",
  drop.player.onGround &&
    drop.player.y >= R2_LOW_TOP * TILE - PLAYER_H - 1 &&
    drop.player.x >= 5 * TILE &&
    drop.player.x < 10 * TILE,
  `x=${drop.player.x} y=${drop.player.y}`,
);

const coyote = settle(8, R2_LOW_TOP);
assert("coyote gap is clearable", jumpToward(coyote.player, coyote.level, 70, 2, 12 * TILE), `x=${coyote.player.x}`);
assert(
  "lands after coyote gap",
  coyote.player.onGround && coyote.player.x >= 12 * TILE && coyote.player.x < 16 * TILE,
  `x=${coyote.player.x} y=${coyote.player.y}`,
);

const pit = settle(14, R2_LOW_TOP);
assert("spike pit is clearable with a jump", jumpToward(pit.player, pit.level, 90, 12, R2_CP1_X * TILE), `x=${pit.player.x}`);
assert(
  "lands on CP1 platform",
  pit.player.onGround && pit.player.x >= R2_CP1_X * TILE,
  `x=${pit.player.x} y=${pit.player.y}`,
);

const early = walkAndHopToCp1();
assert("early Room2 segments reach CP1", early.ok, `x=${early.player.x} y=${early.player.y}`);

const climber = settle(R2_CP1_X, R2_LOW_TOP);
assert(
  "climbs Room2 wall to the y10 ledge",
  climbToWallTop(climber.player, climber.level),
  `x=${climber.player.x} y=${climber.player.y} stam=${climber.player.stamina}`,
);

const dasher = settle(R2_CP2_X, R2_WALL_TOP);
assert(
  "dash from CP2 reaches G2",
  dashToG2(dasher.player, dasher.level, true),
  `x=${dasher.player.x} y=${dasher.player.y}`,
);

const jumper = settle(R2_CP2_X, R2_WALL_TOP);
assert(
  "pure jump cannot clear Room2 must-dash gap",
  !dashToG2(jumper.player, jumper.level, false) && !jumper.level.hitsFlag(playerRect(jumper.player)),
  `x=${jumper.player.x} y=${jumper.player.y}`,
);

const full = walkAndHopToCp1();
assert("full Room2 run reaches CP1", full.ok, `x=${full.player.x} y=${full.player.y}`);
assert("full Room2 run climbs the wall", climbToWallTop(full.player, full.level), `x=${full.player.x} y=${full.player.y}`);
assert("full Room2 run dashes to G2", dashToG2(full.player, full.level, true), `x=${full.player.x} y=${full.player.y}`);

const transit = createGame();
assert("game starts in Room1", transit.roomId === "room1" && transit.level.roomId === "room1");
transit.player.x = transit.level.flag.x;
transit.player.y = transit.level.flag.y;
tick(transit, hold(0, false));
assert("Room1 G cut-loads Room2", transit.roomId === "room2" && transit.mode === "play");
assert("Room2 spawn is used after the cut", Math.abs(transit.player.x - 2 * TILE) < 0.01);
assert("Room2 checkpoint resets on entry", transit.activeCheckpoint === 0);
assert("Room2 camera/level is the new single screen", transit.level.roomId === "room2");

const stay = createGame();
loadRoom(stay, "room2");
stay.player.x = R2_CP1_X * TILE;
stay.player.y = R2_LOW_TOP * TILE - PLAYER_H;
tick(stay, hold(0, false));
assert("touching CP1 saves inside Room2", stay.activeCheckpoint === 1, `cp=${stay.activeCheckpoint}`);
stay.player.y = 200;
tick(stay, hold(0, false));
assert("death in Room2 starts freeze", stay.mode === "dead" && stay.roomId === "room2");
const deathFrames = Math.ceil(P.deathEffect / TICK) + 2;
for (let i = 0; i < deathFrames; i++) tick(stay, hold(0, false));
assert("respawn stays in Room2", stay.roomId === "room2" && stay.level.roomId === "room2");
assert(
  "respawns at Room2 CP1, never Room1",
  Math.abs(stay.player.x - R2_CP1_X * TILE) < 0.01,
  `x=${stay.player.x}`,
);

const fall = createGame();
loadRoom(fall, "room2");
fall.player.y = 200;
tick(fall, hold(0, false));
for (let i = 0; i < deathFrames; i++) tick(fall, hold(0, false));
assert("Room2 CP0 death stays at S2", Math.abs(fall.player.x - 2 * TILE) < 0.01 && fall.roomId === "room2");

console.log("room2 self-tests passed");
