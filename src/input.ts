const LEFT = new Set(["ArrowLeft", "KeyA"]);
const RIGHT = new Set(["ArrowRight", "KeyD"]);
const DOWN = new Set(["ArrowDown", "KeyS"]);
const UP = new Set(["ArrowUp", "KeyW"]);
/** Jump is Space / C only. Up / W write moveY / aim — they never jump. */
const JUMP_ONLY = new Set(["Space", "KeyC"]);
const DASH = new Set(["KeyX"]);
const GRAB = new Set(["KeyZ", "KeyV", "ShiftLeft"]);

export type InputState = {
  x: number;
  /** +1 down (fast-fall / down-dash), -1 up (dash aim; Up / W / virtual Up only). */
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

/** Normalize so ArrowUp / W always register even when `e.code` is empty. */
function keyCodes(e: KeyboardEvent): string[] {
  const codes = e.code ? [e.code] : [];
  const key = e.key;
  if (key === "ArrowUp" || key === "Up") codes.push("ArrowUp");
  if (key === "ArrowDown" || key === "Down") codes.push("ArrowDown");
  if (key === "ArrowLeft" || key === "Left") codes.push("ArrowLeft");
  if (key === "ArrowRight" || key === "Right") codes.push("ArrowRight");
  if (key === "w" || key === "W") codes.push("KeyW");
  if (key === "a" || key === "A") codes.push("KeyA");
  if (key === "s" || key === "S") codes.push("KeyS");
  if (key === "d" || key === "D") codes.push("KeyD");
  if (key === "c" || key === "C") codes.push("KeyC");
  if (key === " " || key === "Spacebar") codes.push("Space");
  return codes;
}

function isHandled(code: string) {
  return (
    LEFT.has(code) ||
    RIGHT.has(code) ||
    DOWN.has(code) ||
    UP.has(code) ||
    JUMP_ONLY.has(code) ||
    DASH.has(code) ||
    isGrabCode(code) ||
    code === "KeyR"
  );
}

export function createInput(target: Window = window) {
  const keys = new Set<string>();
  const virtual = createVirtualPad();
  let jumpWasDown = false;
  let dashWasDown = false;
  let resetWasDown = false;

  const onDown = (e: KeyboardEvent) => {
    const codes = keyCodes(e);
    if (codes.some(isHandled)) e.preventDefault();
    // Latch Space / C on the press edge so a sub-frame tap cannot miss poll.
    if (!e.repeat && codes.some((code) => JUMP_ONLY.has(code) && !keys.has(code))) {
      virtual.jumpPulse = true;
    }
    for (const code of codes) keys.add(code);
  };
  const onUp = (e: KeyboardEvent) => {
    for (const code of keyCodes(e)) keys.delete(code);
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
      const jumpHeld = [...JUMP_ONLY].some((k) => keys.has(k)) || virtual.jump || virtual.jumpPulse;
      const dashHeld = [...DASH].some((k) => keys.has(k)) || virtual.dash || virtual.dashPulse;
      const resetHeld = keys.has("KeyR") || virtual.reset || virtual.resetPulse;
      const aimUp = upHeld;
      const jumpPressed = virtual.jumpPulse || (jumpHeld && !jumpWasDown);
      const dashPressed = dashHeld && !dashWasDown;
      const resetPressed = resetHeld && !resetWasDown;
      jumpWasDown = jumpHeld;
      dashWasDown = dashHeld;
      resetWasDown = resetHeld;
      // Pulse is consumed by this poll (main only polls when a tick will run).
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
