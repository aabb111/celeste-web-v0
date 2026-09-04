import { createInput, type InputState } from "./input";
import { TICK } from "./params";
import { createGame, paint, tick } from "./game";
import { bindViewportFit } from "./viewport";
import { mountTouchControls } from "./touch-controls";
import "./style.css";

const el = document.querySelector<HTMLCanvasElement>("#game");
if (!el) throw new Error("Missing #game canvas");
const canvas: HTMLCanvasElement = el;

const gfx = canvas.getContext("2d");
if (!gfx) throw new Error("Canvas 2D unavailable");
const ctx: CanvasRenderingContext2D = gfx;

const input = createInput();
mountTouchControls(input.virtual, canvas);
bindViewportFit(canvas, ctx);
const game = createGame();
let accumulator = 0;
let last = performance.now();

function frame(now: number) {
  const raw = Math.min(0.1, (now - last) / 1000);
  last = now;
  accumulator += raw;

  const snapshot = input.poll();
  let consumedJump = false;
  let consumedDash = false;
  let consumedReset = false;

  while (accumulator >= TICK) {
    const stepInput: InputState = {
      x: snapshot.x,
      y: snapshot.y,
      jumpHeld: snapshot.jumpHeld,
      jumpPressed: snapshot.jumpPressed && !consumedJump,
      dashHeld: snapshot.dashHeld,
      dashPressed: snapshot.dashPressed && !consumedDash,
      resetPressed: snapshot.resetPressed && !consumedReset,
    };
    tick(game, stepInput);
    consumedJump = consumedJump || stepInput.jumpPressed;
    consumedDash = consumedDash || stepInput.dashPressed;
    consumedReset = consumedReset || stepInput.resetPressed;
    accumulator -= TICK;
  }

  paint(ctx, game);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
