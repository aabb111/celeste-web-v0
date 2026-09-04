import { ROOM_H, ROOM_W } from "./level";

/** Contain-fit the room in the visual viewport. Letterboxing is OK. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const vv = window.visualViewport;
  const vw = vv?.width ?? window.innerWidth;
  const vh = vv?.height ?? window.innerHeight;
  const cssScale = Math.min(vw / ROOM_W, vh / ROOM_H);
  const dpr = window.devicePixelRatio || 1;
  const pixelScale = Math.max(1, Math.round(cssScale * dpr));

  canvas.width = ROOM_W * pixelScale;
  canvas.height = ROOM_H * pixelScale;
  canvas.style.width = `${ROOM_W * cssScale}px`;
  canvas.style.height = `${ROOM_H * cssScale}px`;
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
