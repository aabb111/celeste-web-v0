import type { InputState } from "./input";
import { createLevel, type Level } from "./level";
import { P, TICK } from "./params";
import {
  createPlayer,
  integratePlayer,
  isOutOfBounds,
  playerRect,
  resetPlayer,
  type Player,
} from "./player";
import { render } from "./render";

export type Game = {
  level: Level;
  player: Player;
  activeCheckpoint: number;
  mode: "play" | "dead" | "intro" | "won";
  deathTimer: number;
  status: string;
};

export function createGame(): Game {
  const level = createLevel();
  return {
    level,
    player: createPlayer(level.spawn.x, level.spawn.y),
    activeCheckpoint: 0,
    mode: "play",
    deathTimer: 0,
    status: "Run, jump, dash (X). Hold jump to aim up. Clear the last gap to G.",
  };
}

export function resetGame(game: Game) {
  const next = createGame();
  game.level = next.level;
  game.player = next.player;
  game.activeCheckpoint = 0;
  game.mode = "play";
  game.deathTimer = 0;
  game.status = next.status;
}

export function tick(game: Game, input: InputState) {
  if (input.resetPressed) {
    resetGame(game);
    return;
  }

  if (game.mode === "won") return;

  if (game.mode === "dead") {
    stepDeath(game);
    return;
  }

  if (game.mode === "intro") {
    stepIntro(game);
    return;
  }

  integratePlayer(game.player, input, game.level, TICK);

  const rect = playerRect(game.player);
  const cp = game.level.touchingCheckpoint(rect);
  if (cp && cp.id > game.activeCheckpoint) {
    game.activeCheckpoint = cp.id;
    game.status = "Checkpoint saved.";
  }

  if (game.level.hitsSpike(rect) || isOutOfBounds(game.player)) {
    beginDeath(game);
    return;
  }

  if (game.level.hitsFlag(rect)) {
    game.mode = "won";
    game.status = "Flag G — room clear.";
  }
}

function beginDeath(game: Game) {
  game.mode = "dead";
  game.deathTimer = 0;
  game.player.vx = 0;
  game.player.vy = 0;
  game.status = "Died. Returning to checkpoint…";
}

function stepDeath(game: Game) {
  game.deathTimer += TICK;
  if (game.deathTimer < P.deathEffect) return;

  const origin = game.level.respawnAt(game.activeCheckpoint);
  resetPlayer(game.player, origin.x, origin.y);
  game.mode = "intro";
  game.deathTimer = 0;
  game.status = game.activeCheckpoint > 0 ? "Respawning at checkpoint…" : "Respawning at start…";
}

function stepIntro(game: Game) {
  game.deathTimer += TICK;
  if (game.deathTimer < P.introRespawn) return;
  game.mode = "play";
  game.deathTimer = 0;
  game.status = game.activeCheckpoint > 0 ? "Respawned at checkpoint." : "Respawned at start.";
}

export function paint(ctx: CanvasRenderingContext2D, game: Game) {
  const freezeFlash =
    game.mode === "dead"
      ? Math.floor(game.deathTimer * 20)
      : game.player.dashFreeze > 0
        ? 0
        : 1;
  render(ctx, game.level, game.player, {
    activeCheckpoint: game.activeCheckpoint,
    status: game.status,
    dead: game.mode === "dead",
    intro: game.mode === "intro",
    won: game.mode === "won",
    freezeFlash,
  });
}
