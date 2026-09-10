import { createGame, loadRoom, tick } from "../src/game.ts";
import {
  COLS,
  createLevel,
  R3_CLIMB_C_TOP,
  R3_CP1_X,
  R3_CP2_X,
  R3_CP3_X,
  R3_CP4_X,
  R3_CP5_X,
  R3_CP6_X,
  R3_CP7_X,
  R3_DROP_F_X,
  R3_ENTRY_TOP,
  R3_FINALE_TOP,
  R3_FLOOR_TOP,
  R3_FOOT_A_X,
  R3_FOOT_F_X,
  R3_GOAL_TOP,
  R3_GOAL_X0,
  R3_LAND_A_TOP,
  R3_SPIKE_B_APPROACH,
  R3_SPIKE_B_X0,
  R3_TOP_C_X0,
  R3_WALL_C_X,
  R3_WALL_F_X,
  TILE,
  VIEW_COLS,
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

function room3() {
  return createLevel("room3");
}

function settle(tx: number, top: number) {
  const level = room3();
  const player = createPlayer(tx * TILE, top * TILE - PLAYER_H);
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  return { player, level };
}

function died(player: Player, level: ReturnType<typeof room3>) {
  return level.hitsSpike(playerRect(player)) || isOutOfBounds(player);
}

function jumpToward(
  player: Player,
  level: ReturnType<typeof room3>,
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

function hopGapsUntil(
  player: Player,
  level: ReturnType<typeof room3>,
  minX: number,
  maxX: number,
  top: number,
  style: "short" | "mid" | "long" = "long",
) {
  const holdTicks = style === "short" ? 2 : style === "mid" ? 5 : 8;
  for (let i = 0; i < 900; i++) {
    const feetX = player.x + PLAYER_W + 2;
    const feetY = player.y + PLAYER_H + 1;
    const aheadSolid = level.isSolid(Math.floor(feetX / TILE), Math.floor(feetY / TILE));
    const jumpNow = player.onGround && !aheadSolid && player.x < minX;
    const holdLeft = P.varJumpTime - holdTicks * TICK;
    const jumpHeld = jumpNow || (!player.onGround && player.jumpTimer > holdLeft);
    integratePlayer(player, hold(1, jumpHeld, jumpNow), level, TICK);
    if (died(player, level)) return false;
    if (
      player.onGround &&
      player.x >= minX &&
      player.x < maxX &&
      Math.abs(player.y - (top * TILE - PLAYER_H)) < 4
    ) {
      return true;
    }
  }
  return false;
}

function jumpDashTo(
  player: Player,
  level: ReturnType<typeof room3>,
  destX: number,
  allowDash: boolean,
  aimY = -1,
) {
  if (level.hitsFlag(playerRect(player)) || (player.onGround && player.x >= destX)) return true;
  for (let i = 0; i < 12; i++) {
    integratePlayer(player, hold(0, false), level, TICK);
    if (died(player, level)) return false;
    if (level.hitsFlag(playerRect(player)) || (player.onGround && player.x >= destX)) return true;
  }
  integratePlayer(player, hold(1, true, true, aimY), level, TICK);
  for (let i = 0; i < 8; i++) {
    integratePlayer(player, hold(1, true, false, aimY, allowDash && i === 7), level, TICK);
  }
  for (let i = 0; i < 220; i++) {
    const over = player.x >= destX;
    const moveX = over ? 0 : 1;
    const moveY = over ? 1 : allowDash ? aimY : 0;
    integratePlayer(player, hold(moveX, !over, false, moveY), level, TICK);
    if (level.hitsFlag(playerRect(player)) || (player.onGround && player.x >= destX)) return true;
    if (died(player, level)) return false;
  }
  return false;
}

function climbNamedWall(player: Player, level: ReturnType<typeof room3>, wallX: number, top: number) {
  for (let i = 0; i < 8; i++) integratePlayer(player, hold(0, false), level, TICK);
  for (let i = 0; i < 280; i++) {
    const wall = wallX * TILE;
    const atWall = player.x + PLAYER_W >= wall - 3;
    const onTop = player.onGround && player.y <= top * TILE - PLAYER_H + 2 && player.x >= wall - 4;
    if (onTop) return true;
    const grab = atWall || player.climbing;
    const moveX = player.climbing ? 0 : 1;
    integratePlayer(player, hold(moveX, false, false, 0, false, grab, player.climbing ? -1 : 0), level, TICK);
    if (died(player, level)) return false;
  }
  return player.x >= wallX * TILE - 4 && player.y <= top * TILE - PLAYER_H + 8;
}

function comboAToCp2(player: Player, level: ReturnType<typeof room3>) {
  if (!hopGapsUntil(player, level, R3_FOOT_A_X * TILE, (R3_FOOT_A_X + 2) * TILE, R3_FLOOR_TOP, "short")) return false;
  return jumpDashTo(player, level, R3_CP2_X * TILE, true, -1);
}

function practiceAToCp3(player: Player, level: ReturnType<typeof room3>) {
  if (!hopGapsUntil(player, level, 24 * TILE, 26 * TILE, R3_LAND_A_TOP, "short")) return false;
  for (let i = 0; i < 6; i++) integratePlayer(player, hold(0, false), level, TICK);
  return hopGapsUntil(player, level, R3_CP3_X * TILE, (R3_CP3_X + 2) * TILE, R3_LAND_A_TOP, "mid");
}

function dropToSpikeApproach(player: Player, level: ReturnType<typeof room3>) {
  for (let i = 0; i < 160; i++) {
    const onFloor =
      player.onGround &&
      player.y >= R3_FLOOR_TOP * TILE - PLAYER_H - 2 &&
      player.x >= R3_SPIKE_B_APPROACH * TILE &&
      player.x < R3_SPIKE_B_X0 * TILE;
    if (onFloor) return true;
    const ease = !player.onGround;
    integratePlayer(player, hold(ease ? 0 : 1, false), level, TICK);
    if (died(player, level)) return false;
  }
  return false;
}

function spikeDashTo(player: Player, level: ReturnType<typeof room3>, destX: number, allowDash: boolean) {
  return jumpDashTo(player, level, destX, allowDash, -1);
}

function dropToFinaleFloor(player: Player, level: ReturnType<typeof room3>) {
  for (let i = 0; i < 160; i++) {
    const onFloor =
      player.onGround &&
      player.y >= R3_FLOOR_TOP * TILE - PLAYER_H - 2 &&
      player.x >= R3_DROP_F_X * TILE;
    if (onFloor) return true;
    const ease = !player.onGround;
    integratePlayer(player, hold(ease ? 0 : 1, false), level, TICK);
    if (died(player, level)) return false;
  }
  return false;
}

function finaleToGoal(player: Player, level: ReturnType<typeof room3>) {
  if (!hopGapsUntil(player, level, R3_FOOT_F_X * TILE, (R3_FOOT_F_X + 1) * TILE, R3_FLOOR_TOP, "short")) return false;
  if (!climbNamedWall(player, level, R3_WALL_F_X, R3_FINALE_TOP)) return false;
  if (!jumpDashTo(player, level, R3_CP7_X * TILE, true, 0)) return false;
  return jumpDashTo(player, level, R3_GOAL_X0 * TILE, false, -1) || hopGapsUntil(
    player,
    level,
    R3_GOAL_X0 * TILE,
    (R3_GOAL_X0 + 3) * TILE,
    R3_GOAL_TOP,
  );
}

const r3 = room3();
assert("room3 is 72 tiles wide", COLS === 72 && VIEW_COLS === 40);
assert("room3 spawn is S3 ≈ (x2, y7)", r3.spawn.x === 2 * TILE && r3.roomId === "room3");
assert("room3 has CP0–CP7", r3.checkpoints.length === 8);
assert("room3 CP0 is spawn", r3.checkpoints[0]!.x === r3.spawn.x && r3.checkpoints[0]!.y === r3.spawn.y);
assert("room3 is the last room", r3.nextRoom === null);
assert("room3 has an exit door", r3.door !== null && r3.door.x === 70 * TILE);

const drop = settle(2, R3_ENTRY_TOP);
for (let i = 0; i < 120; i++) {
  integratePlayer(drop.player, hold(1, false), drop.level, TICK);
  if (
    drop.player.onGround &&
    drop.player.y >= R3_FLOOR_TOP * TILE - PLAYER_H - 1 &&
    drop.player.x >= 4 * TILE
  ) {
    break;
  }
}
assert(
  "drops from entry to the y2 floor",
  drop.player.onGround &&
    drop.player.y >= R3_FLOOR_TOP * TILE - PLAYER_H - 1 &&
    drop.player.x >= 4 * TILE &&
    drop.player.x < 9 * TILE,
  `x=${drop.player.x} y=${drop.player.y}`,
);

const coyote = settle(R3_CP1_X, R3_FLOOR_TOP);
assert(
  "combo A coyote gap is clearable",
  jumpToward(coyote.player, coyote.level, 70, 2, R3_FOOT_A_X * TILE),
  `x=${coyote.player.x}`,
);

const comboA = settle(R3_CP1_X, R3_FLOOR_TOP);
assert("combo A reaches CP2", comboAToCp2(comboA.player, comboA.level), `x=${comboA.player.x} y=${comboA.player.y}`);

const jumpOnlyA = settle(R3_FOOT_A_X, R3_FLOOR_TOP);
assert(
  "pure jump cannot clear combo A must-dash",
  !jumpDashTo(jumpOnlyA.player, jumpOnlyA.level, R3_CP2_X * TILE, false, -1) &&
    !jumpOnlyA.level.hitsFlag(playerRect(jumpOnlyA.player)),
  `x=${jumpOnlyA.player.x} y=${jumpOnlyA.player.y}`,
);

const practiceA = settle(R3_CP2_X, R3_LAND_A_TOP);
assert(
  "practice A reaches CP3",
  practiceAToCp3(practiceA.player, practiceA.level),
  `x=${practiceA.player.x} y=${practiceA.player.y}`,
);

const pitB = settle(R3_SPIKE_B_APPROACH, R3_FLOOR_TOP);
assert(
  "combo B spike pit is clearable with jump+dash",
  spikeDashTo(pitB.player, pitB.level, R3_CP4_X * TILE, true),
  `x=${pitB.player.x} y=${pitB.player.y}`,
);

const pitBWalk = settle(R3_SPIKE_B_APPROACH, R3_FLOOR_TOP);
for (let i = 0; i < 90 && !died(pitBWalk.player, pitBWalk.level); i++) {
  integratePlayer(pitBWalk.player, hold(1, false), pitBWalk.level, TICK);
}
assert(
  "walking combo B hits the spike pit",
  died(pitBWalk.player, pitBWalk.level),
  `x=${pitBWalk.player.x} y=${pitBWalk.player.y}`,
);

const pitPb = settle(R3_CP4_X, R3_FLOOR_TOP);
assert(
  "practice B spike pit is clearable",
  hopGapsUntil(pitPb.player, pitPb.level, R3_CP5_X * TILE, (R3_CP5_X + 2) * TILE, R3_FLOOR_TOP) ||
    spikeDashTo(pitPb.player, pitPb.level, R3_CP5_X * TILE, true),
  `x=${pitPb.player.x} y=${pitPb.player.y}`,
);

const climber = settle(R3_CP5_X, R3_FLOOR_TOP);
assert(
  "combo C climbs ~7 tiles to the y9 ledge",
  climbNamedWall(climber.player, climber.level, R3_WALL_C_X, R3_CLIMB_C_TOP),
  `x=${climber.player.x} y=${climber.player.y} stam=${climber.player.stamina}`,
);

const dasher = settle(R3_TOP_C_X0, R3_CLIMB_C_TOP);
assert(
  "combo C 5-tile dash reaches CP6",
  jumpDashTo(dasher.player, dasher.level, R3_CP6_X * TILE, true),
  `x=${dasher.player.x} y=${dasher.player.y}`,
);

const finaleDrop = settle(R3_CP6_X, R3_CLIMB_C_TOP);
assert(
  "drops from CP6 onto the finale floor",
  dropToFinaleFloor(finaleDrop.player, finaleDrop.level),
  `x=${finaleDrop.player.x} y=${finaleDrop.player.y}`,
);

const finale = settle(R3_DROP_F_X, R3_FLOOR_TOP);
assert("finale reaches G3", finaleToGoal(finale.player, finale.level), `x=${finale.player.x} y=${finale.player.y}`);

const full = settle(2, R3_ENTRY_TOP);
for (let i = 0; i < 120; i++) {
  integratePlayer(full.player, hold(1, false), full.level, TICK);
  if (full.player.onGround && full.player.x >= R3_CP1_X * TILE) break;
}
assert("full Room3 run reaches CP1", full.player.onGround && full.player.x >= R3_CP1_X * TILE, `x=${full.player.x}`);
assert("full Room3 run does combo A", comboAToCp2(full.player, full.level), `x=${full.player.x} y=${full.player.y}`);
assert("full Room3 run does practice A", practiceAToCp3(full.player, full.level), `x=${full.player.x} y=${full.player.y}`);
assert("full Room3 run drops to combo B", dropToSpikeApproach(full.player, full.level), `x=${full.player.x} y=${full.player.y}`);
assert(
  "full Room3 run does combo B",
  spikeDashTo(full.player, full.level, R3_CP4_X * TILE, true),
  `x=${full.player.x} y=${full.player.y}`,
);
assert(
  "full Room3 run does practice B",
  hopGapsUntil(full.player, full.level, R3_CP5_X * TILE, (R3_CP5_X + 2) * TILE, R3_FLOOR_TOP) ||
    spikeDashTo(full.player, full.level, R3_CP5_X * TILE, true),
  `x=${full.player.x} y=${full.player.y}`,
);
assert("full Room3 run climbs combo C", climbNamedWall(full.player, full.level, R3_WALL_C_X, R3_CLIMB_C_TOP), `x=${full.player.x}`);
assert(
  "full Room3 run dashes combo C",
  jumpDashTo(full.player, full.level, R3_CP6_X * TILE, true),
  `x=${full.player.x}`,
);
assert("full Room3 run drops into the finale", dropToFinaleFloor(full.player, full.level), `x=${full.player.x}`);
assert("full Room3 run clears the finale", finaleToGoal(full.player, full.level), `x=${full.player.x} y=${full.player.y}`);

const transit = createGame();
assert("game starts in Room1", transit.roomId === "room1");
transit.player.x = transit.level.flag.x;
transit.player.y = transit.level.flag.y;
tick(transit, hold(0, false));
assert("Room1 G cut-loads Room2", transit.roomId === "room2");
transit.player.x = transit.level.flag.x;
transit.player.y = transit.level.flag.y;
tick(transit, hold(0, false));
assert("Room2 G2 cut-loads Room3", transit.roomId === "room3" && transit.mode === "play");
assert("Room3 camera snaps on the cut", transit.camera.x === 0 && transit.level.roomId === "room3");
transit.player.x = transit.level.flag.x;
transit.player.y = transit.level.flag.y;
tick(transit, hold(0, false));
assert("Room3 G3 wins the run", transit.mode === "won" && transit.roomId === "room3");

const stay = createGame();
loadRoom(stay, "room3");
stay.player.x = R3_CP1_X * TILE;
stay.player.y = R3_FLOOR_TOP * TILE - PLAYER_H;
tick(stay, hold(0, false));
assert("touching CP1 saves inside Room3", stay.activeCheckpoint === 1, `cp=${stay.activeCheckpoint}`);
stay.player.y = 200;
tick(stay, hold(0, false));
assert("death in Room3 starts freeze", stay.mode === "dead" && stay.roomId === "room3");
const deathFrames = Math.ceil(P.deathEffect / TICK) + 2;
for (let i = 0; i < deathFrames; i++) tick(stay, hold(0, false));
assert("respawn stays in Room3", stay.roomId === "room3" && stay.level.roomId === "room3");
assert(
  "respawns at Room3 CP1, never Room1/2",
  Math.abs(stay.player.x - R3_CP1_X * TILE) < 0.01,
  `x=${stay.player.x}`,
);

const fall = createGame();
loadRoom(fall, "room3");
fall.player.y = 200;
tick(fall, hold(0, false));
for (let i = 0; i < deathFrames; i++) tick(fall, hold(0, false));
assert("Room3 CP0 death stays at S3", Math.abs(fall.player.x - 2 * TILE) < 0.01 && fall.roomId === "room3");

console.log("room3 self-tests passed");
