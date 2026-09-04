const LEFT = new Set(["ArrowLeft", "KeyA"]);
const RIGHT = new Set(["ArrowRight", "KeyD"]);
const JUMP = new Set(["Space", "ArrowUp", "KeyZ", "KeyC", "KeyW"]);

export type InputState = {
  x: number;
  jumpHeld: boolean;
  jumpPressed: boolean;
  resetPressed: boolean;
};

export function createInput(target: Window = window) {
  const down = new Set<string>();
  let jumpWasDown = false;
  let resetWasDown = false;

  const onDown = (e: KeyboardEvent) => {
    if (LEFT.has(e.code) || RIGHT.has(e.code) || JUMP.has(e.code) || e.code === "KeyR") {
      e.preventDefault();
    }
    down.add(e.code);
  };
  const onUp = (e: KeyboardEvent) => {
    down.delete(e.code);
  };

  target.addEventListener("keydown", onDown);
  target.addEventListener("keyup", onUp);

  return {
    poll(): InputState {
      const left = [...LEFT].some((k) => down.has(k));
      const right = [...RIGHT].some((k) => down.has(k));
      const jumpHeld = [...JUMP].some((k) => down.has(k));
      const resetHeld = down.has("KeyR");
      const jumpPressed = jumpHeld && !jumpWasDown;
      const resetPressed = resetHeld && !resetWasDown;
      jumpWasDown = jumpHeld;
      resetWasDown = resetHeld;
      return {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        jumpHeld,
        jumpPressed,
        resetPressed,
      };
    },
  };
}
