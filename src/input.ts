const LEFT = new Set(["ArrowLeft", "KeyA"]);
const RIGHT = new Set(["ArrowRight", "KeyD"]);
const DOWN = new Set(["ArrowDown", "KeyS"]);
const JUMP = new Set(["Space", "ArrowUp", "KeyZ", "KeyC", "KeyW"]);

export type InputState = {
  x: number;
  /** +1 when holding down (fast-fall). Up is jump, not negative moveY. */
  y: number;
  jumpHeld: boolean;
  jumpPressed: boolean;
  resetPressed: boolean;
};

export type PadButton = "left" | "right" | "down" | "jump" | "reset";

/** Mutable pad held-state, merged with keyboard in `poll`. */
export type VirtualPad = {
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
  reset: boolean;
  /** Latches a tap that is released before the next poll (jump buffer). */
  jumpPulse: boolean;
  resetPulse: boolean;
};

export function createVirtualPad(): VirtualPad {
  return {
    left: false,
    right: false,
    down: false,
    jump: false,
    reset: false,
    jumpPulse: false,
    resetPulse: false,
  };
}

export function createInput(target: Window = window) {
  const keys = new Set<string>();
  const virtual = createVirtualPad();
  let jumpWasDown = false;
  let resetWasDown = false;

  const onDown = (e: KeyboardEvent) => {
    if (LEFT.has(e.code) || RIGHT.has(e.code) || DOWN.has(e.code) || JUMP.has(e.code) || e.code === "KeyR") {
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
      const jumpHeld = [...JUMP].some((k) => keys.has(k)) || virtual.jump || virtual.jumpPulse;
      const resetHeld = keys.has("KeyR") || virtual.reset || virtual.resetPulse;
      const jumpPressed = jumpHeld && !jumpWasDown;
      const resetPressed = resetHeld && !resetWasDown;
      jumpWasDown = jumpHeld;
      resetWasDown = resetHeld;
      virtual.jumpPulse = false;
      virtual.resetPulse = false;
      return {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        y: downHeld ? 1 : 0,
        jumpHeld,
        jumpPressed,
        resetPressed,
      };
    },
  };
}
