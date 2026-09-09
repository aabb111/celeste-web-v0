import type { Game } from "./game";
import { render } from "./render";

export function paintGame(ctx: CanvasRenderingContext2D, game: Game) {
  const freezeFlash =
    game.mode === "dead"
      ? Math.floor(game.deathTimer * 20)
      : game.player.dashFreeze > 0
        ? 0
        : 1;
  render(ctx, game.level, game.player, game.camera, {
    activeCheckpoint: game.activeCheckpoint,
    status: game.status,
    dead: game.mode === "dead",
    intro: game.mode === "intro",
    won: game.mode === "won",
    freezeFlash,
  });
}
