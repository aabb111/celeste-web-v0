export type FrameRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type ViewportSize = { width: number; height: number };

/** Distances from the layout viewport edges to the canvas content box. */
export function canvasFrameOffsets(rect: FrameRect, viewport: ViewportSize) {
  return {
    left: rect.left,
    top: rect.top,
    right: viewport.width - rect.right,
    bottom: viewport.height - rect.bottom,
  };
}

export function applyCanvasFrameVars(hud: HTMLElement, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const offsets = canvasFrameOffsets(rect, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
  hud.style.setProperty("--canvas-left", `${offsets.left}px`);
  hud.style.setProperty("--canvas-top", `${offsets.top}px`);
  hud.style.setProperty("--canvas-right", `${offsets.right}px`);
  hud.style.setProperty("--canvas-bottom", `${offsets.bottom}px`);
}
