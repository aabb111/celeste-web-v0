import { createInput } from "../src/input.ts";
import { VIEW_H, VIEW_W } from "../src/level.ts";
import { canvasFrameOffsets } from "../src/touch-layout.ts";
import { canvasPlacement } from "../src/viewport.ts";

function assert(name: string, ok: boolean, detail = "") {
  if (!ok) throw new Error(`FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`ok  ${name}`);
}

const inputHost = { addEventListener() {} };
const input = createInput(inputHost as unknown as Window);

input.virtual.grab = true;
input.virtual.up = true;
const climbUp = input.poll();
assert("grab+up climbs", climbUp.moveY === -1 && climbUp.grabHeld && !climbUp.jumpHeld);

input.virtual.up = false;
const grabHold = input.poll();
assert("grab alone does not climb", grabHold.moveY === 0 && grabHold.grabHeld);

input.virtual.grab = false;
input.virtual.up = true;
const jumpUp = input.poll();
assert("up without grab jumps", jumpUp.jumpHeld && jumpUp.moveY === -1 && !jumpUp.grabHeld);

input.virtual.up = false;
input.virtual.down = true;
input.virtual.grab = true;
const climbDown = input.poll();
assert("grab+down climbs down", climbDown.moveY === 1 && climbDown.grabHeld);

const vw = 390;
const vh = 844;
const cssScale = Math.min(vw / VIEW_W, vh / VIEW_H);
const cssW = VIEW_W * cssScale;
const cssH = VIEW_H * cssScale;
const slot = canvasPlacement(cssW, cssH, vw, vh);
const canvasBottom = slot.top + cssH;
const pad = canvasFrameOffsets(
  { left: slot.left, top: slot.top, right: slot.left + cssW, bottom: canvasBottom },
  { width: vw, height: vh },
);

assert("390×844 canvas reaches viewport bottom", Math.abs(canvasBottom - vh) < 0.5, `bottom=${canvasBottom}`);
assert("390×844 pad bottom inset is canvas-relative ~0", Math.abs(pad.bottom) < 0.5, `pad.bottom=${pad.bottom}`);
assert("390×844 no 186px letterbox under game", canvasBottom > 800, `bottom=${canvasBottom}`);
assert("390×844 canvas is width-fit", Math.abs(cssW - vw) < 0.5, `cssW=${cssW}`);

const land = canvasPlacement(844, 380, 844, 390);
assert(
  "landscape stays vertically centered",
  Math.abs(land.top - (390 - 380) / 2) < 0.5,
  `top=${land.top}`,
);

const centeredOld = canvasFrameOffsets(
  { left: 0, top: 334.25, right: 390, bottom: 509.75 },
  { width: 390, height: 844 },
);
assert(
  "centered canvas still anchors pads to the frame",
  Math.abs(centeredOld.bottom - (844 - 509.75)) < 0.01,
  `bottom=${centeredOld.bottom}`,
);
