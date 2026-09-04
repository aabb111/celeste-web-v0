import { createInput, type InputState } from "./input";
import { ROOM_H, ROOM_W } from "./level";
import { TICK } from "./params";
import { createGame, paint, tick } from "./game";
import "./style.css";

const el = document.querySelector<HTMLCanvasElement>("#game");
if (!el) throw new Error("Missing #game canvas");
const canvas: HTMLCanvasElement = el;

const gfx = canvas.getContext("2d");
if (!gfx) throw new Error("Canvas 2D unavailable");
const ctx: CanvasRenderingContext2D = gfx;

const input = createInput();
const game = createGame();
let accumulator = 0;
let last = performance.now();

function fit() {
  const scale = Math.max(
    1,
    Math.floor(Math.min(window.innerWidth / ROOM_W, (window.innerHeight - 24) / ROOM_H)),
  );
  canvas.width = ROOM_W * scale;
  canvas.height = ROOM_H * scale;
  canvas.style.width = `${ROOM_W * scale}px`;
  canvas.style.height = `${ROOM_H * scale}px`;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

window.addEventListener("resize", fit);
fit();

function frame(now: number) {
  const raw = Math.min(0.1, (now - last) / 1000);
  last = now;
  accumulator += raw;

  const snapshot = input.poll();
  let consumedJump = false;
  let consumedReset = false;

  while (accumulator >= TICK) {
    const stepInput: InputState = {
      x: snapshot.x,
      y: snapshot.y,
      jumpHeld: snapshot.jumpHeld,
      jumpPressed: snapshot.jumpPressed && !consumedJump,
      resetPressed: snapshot.resetPressed && !consumedReset,
    };
    tick(game, stepInput);
    consumedJump = consumedJump || stepInput.jumpPressed;
    consumedReset = consumedReset || stepInput.resetPressed;
    accumulator -= TICK;
  }

  paint(ctx, game);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
