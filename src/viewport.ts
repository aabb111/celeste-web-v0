import { VIEW_H, VIEW_W } from "./level";

/** Contain-fit the camera view in the visual viewport. Letterboxing is OK. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const vv = window.visualViewport;
  const vw = vv?.width ?? window.innerWidth;
  const vh = vv?.height ?? window.innerHeight;
  const cssScale = Math.min(vw / VIEW_W, vh / VIEW_H);
  const dpr = window.devicePixelRatio || 1;
  const pixelScale = Math.max(1, Math.round(cssScale * dpr));

  canvas.width = VIEW_W * pixelScale;
  canvas.height = VIEW_H * pixelScale;
  canvas.style.width = `${VIEW_W * cssScale}px`;
  canvas.style.height = `${VIEW_H * cssScale}px`;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
}

export function bindViewportFit(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const onFit = () => fitCanvas(canvas, ctx);
  window.addEventListener("resize", onFit);
  window.addEventListener("orientationchange", onFit);
  window.visualViewport?.addEventListener("resize", onFit);
  window.visualViewport?.addEventListener("scroll", onFit);
  onFit();
}
