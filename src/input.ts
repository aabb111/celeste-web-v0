const LEFT = new Set(["ArrowLeft", "KeyA"]);
const RIGHT = new Set(["ArrowRight", "KeyD"]);
const DOWN = new Set(["ArrowDown", "KeyS"]);
const UP = new Set(["ArrowUp", "KeyW"]);
/** Jump keeps Space / C / Up / W. Z is grab (Celeste). */
const JUMP = new Set(["Space", "ArrowUp", "KeyC", "KeyW"]);
const JUMP_ONLY = new Set(["Space", "KeyC"]);
const DASH = new Set(["KeyX"]);
const GRAB = new Set(["KeyZ", "KeyV", "ShiftLeft"]);

export type InputState = {
  x: number;
  /** +1 down (fast-fall / down-dash), -1 up (dash aim; jump keys count). */
  y: number;
  /** Vertical for climb only — jump keys do not count. */
  moveY: number;
  jumpHeld: boolean;
  jumpPressed: boolean;
  dashHeld: boolean;
  dashPressed: boolean;
  grabHeld: boolean;
  resetPressed: boolean;
};

export type PadButton = "left" | "right" | "down" | "up" | "jump" | "dash" | "grab" | "reset";

/** Mutable pad held-state, merged with keyboard in `poll`. */
export type VirtualPad = {
  left: boolean;
  right: boolean;
  down: boolean;
  up: boolean;
  jump: boolean;
  dash: boolean;
  grab: boolean;
  reset: boolean;
  /** Latches a tap that is released before the next poll. */
  jumpPulse: boolean;
  dashPulse: boolean;
  resetPulse: boolean;
};

export function createVirtualPad(): VirtualPad {
  return {
    left: false,
    right: false,
    down: false,
    up: false,
    jump: false,
    dash: false,
    grab: false,
    reset: false,
    jumpPulse: false,
    dashPulse: false,
    resetPulse: false,
  };
}

function isGrabCode(code: string) {
  return GRAB.has(code);
}

export function createInput(target: Window = window) {
  const keys = new Set<string>();
  const virtual = createVirtualPad();
  let jumpWasDown = false;
  let dashWasDown = false;
  let resetWasDown = false;

  const onDown = (e: KeyboardEvent) => {
    if (
      LEFT.has(e.code) ||
      RIGHT.has(e.code) ||
      DOWN.has(e.code) ||
      JUMP.has(e.code) ||
      DASH.has(e.code) ||
      isGrabCode(e.code) ||
      e.code === "KeyR"
    ) {
      e.preventDefault();
    }
    keys.add(e.code);
  };
  const onUp = (e: KeyboardEvent) => {
    keys.delete(e.code);
  };

  target.addEventListener("keydown", onDown);
  target.addEventListener("keyup", onUp);

  return {
    virtual,
    poll(): InputState {
      const left = [...LEFT].some((k) => keys.has(k)) || virtual.left;
      const right = [...RIGHT].some((k) => keys.has(k)) || virtual.right;
      const downHeld = [...DOWN].some((k) => keys.has(k)) || virtual.down;
      const upHeld = [...UP].some((k) => keys.has(k)) || virtual.up;
      const grabHeld = [...GRAB].some((k) => keys.has(k)) || virtual.grab;
      const jumpCore = [...JUMP_ONLY].some((k) => keys.has(k)) || virtual.jump || virtual.jumpPulse;
      const jumpFromUp = upHeld && !grabHeld;
      const jumpHeld = jumpCore || jumpFromUp;
      const dashHeld = [...DASH].some((k) => keys.has(k)) || virtual.dash || virtual.dashPulse;
      const resetHeld = keys.has("KeyR") || virtual.reset || virtual.resetPulse;
      const aimUp = upHeld || jumpHeld;
      const jumpPressed = jumpHeld && !jumpWasDown;
      const dashPressed = dashHeld && !dashWasDown;
      const resetPressed = resetHeld && !resetWasDown;
      jumpWasDown = jumpHeld;
      dashWasDown = dashHeld;
      resetWasDown = resetHeld;
      virtual.jumpPulse = false;
      virtual.dashPulse = false;
      virtual.resetPulse = false;
      return {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        y: (downHeld ? 1 : 0) - (aimUp ? 1 : 0),
        moveY: (downHeld ? 1 : 0) - (upHeld ? 1 : 0),
        jumpHeld,
        jumpPressed,
        dashHeld,
        dashPressed,
        grabHeld,
        resetPressed,
      };
    },
  };
}
