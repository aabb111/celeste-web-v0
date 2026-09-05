import { VIEW_H, VIEW_W } from "./level";

/** Contain-fit the camera view in the visual viewport. Letterboxing is OK. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const vv = window.visualViewport;
  const vw = vv?.width ?? window.innerWidth;
  const vh = vv?.height ?? window.innerHeight;
  const cssScale = Math.min(vw / VIEW_W, vh / VIEW_H);
  const dpr = window.devicePixelRatio || 1;
  const pixelScale = Math.max(1, Math.round(cssScale * dpr));
  const cssW = VIEW_W * cssScale;
  const cssH = VIEW_H * cssScale;

  canvas.width = VIEW_W * pixelScale;
  canvas.height = VIEW_H * pixelScale;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const slot = canvasPlacement(cssW, cssH, vw, vh, vv?.offsetLeft ?? 0, vv?.offsetTop ?? 0);
  canvas.style.position = "fixed";
  canvas.style.left = `${slot.left}px`;
  canvas.style.top = `${slot.top}px`;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
}

/**
 * Portrait: pin the game frame to the visual-viewport bottom so pads sit on
 * the content (390×844 → ~175px-tall canvas at y≈669–844, not a centered strip
 * ending at y≈509 with keys floating in the letterbox). Landscape stays centered.
 */
export function canvasPlacement(
  cssW: number,
  cssH: number,
  vw: number,
  vh: number,
  ox = 0,
  oy = 0,
) {
  const portrait = vh >= vw;
  return {
    left: ox + (vw - cssW) / 2,
    top: portrait ? oy + Math.max(0, vh - cssH) : oy + (vh - cssH) / 2,
  };
}

export function bindViewportFit(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  onFit?: () => void,
) {
  const onResize = () => {
    fitCanvas(canvas, ctx);
    onFit?.();
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("scroll", onResize);
  onResize();
}
