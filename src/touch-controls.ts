import type { PadButton, VirtualPad } from "./input";
import "./touch-controls.css";

const SHOW_PADS = "(max-width: 768px), (pointer: coarse), (hover: none)";

export function mountTouchControls(virtual: VirtualPad, canvas: HTMLCanvasElement) {
  const hud = createHud();
  document.body.appendChild(hud);

  const media = window.matchMedia(SHOW_PADS);
  const syncVis = () => {
    const show = media.matches;
    hud.hidden = !show;
    hud.setAttribute("aria-hidden", show ? "false" : "true");
  };
  media.addEventListener("change", syncVis);
  syncVis();

  const pointers = new Map<number, PadButton>();
  for (const btn of hud.querySelectorAll<HTMLElement>("[data-action]")) {
    bindPadButton(btn, btn.dataset.action as PadButton, virtual, pointers);
  }

  const blockScroll = (e: Event) => {
    const t = e.target;
    const onCanvas = t === canvas || (t instanceof Node && canvas.contains(t));
    const onHud = !hud.hidden && (t === hud || (t instanceof Node && hud.contains(t)));
    if (onCanvas || onHud || !hud.hidden) e.preventDefault();
  };

  document.addEventListener("touchmove", blockScroll, { passive: false });
  document.addEventListener("gesturestart", blockScroll, { passive: false });
  canvas.addEventListener("pointerdown", (e) => e.preventDefault());
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  hud.addEventListener("contextmenu", (e) => e.preventDefault());
}

function createHud(): HTMLDivElement {
  const hud = document.createElement("div");
  hud.id = "touch-hud";
  hud.className = "touch-hud";
  hud.hidden = true;
  hud.innerHTML = `
    <div class="touch-pad touch-pad-move">
      <button type="button" class="touch-btn touch-btn-dir" data-action="left" tabindex="-1" aria-label="Move left">←</button>
      <button type="button" class="touch-btn touch-btn-dir" data-action="right" tabindex="-1" aria-label="Move right">→</button>
    </div>
    <div class="touch-pad touch-pad-actions">
      <button type="button" class="touch-btn touch-btn-dash" data-action="dash" tabindex="-1" aria-label="Dash">Dash</button>
      <button type="button" class="touch-btn touch-btn-jump" data-action="jump" tabindex="-1" aria-label="Jump">Jump</button>
      <button type="button" class="touch-btn touch-btn-down" data-action="down" tabindex="-1" aria-label="Down">Down</button>
    </div>
    <button type="button" class="touch-btn touch-btn-reset" data-action="reset" tabindex="-1" aria-label="Reset">R</button>
  `;
  return hud;
}

function bindPadButton(
  el: HTMLElement,
  action: PadButton,
  virtual: VirtualPad,
  pointers: Map<number, PadButton>,
) {
  const press = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    el.blur();
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported */
    }
    pointers.set(e.pointerId, action);
    virtual[action] = true;
    el.classList.add("is-held");
    if (action === "jump") virtual.jumpPulse = true;
    if (action === "dash") virtual.dashPulse = true;
    if (action === "reset") virtual.resetPulse = true;
  };

  const release = (e: PointerEvent) => {
    if (pointers.get(e.pointerId) !== action) return;
    pointers.delete(e.pointerId);
    for (const held of pointers.values()) {
      if (held === action) return;
    }
    virtual[action] = false;
    el.classList.remove("is-held");
  };

  el.addEventListener("pointerdown", press);
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);
  el.addEventListener("lostpointercapture", release);
}
