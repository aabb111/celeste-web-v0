import { PLAYER_W } from "./params";
import { ROOM_W, VIEW_W } from "./rooms";

/** Small horizontal deadzone (px) around the view center. */
export const CAM_DEADZONE = 20;

export type Camera = { x: number; y: number };

export function createCamera(): Camera {
  return { x: 0, y: 0 };
}

export function clampCameraX(x: number, levelW = ROOM_W, viewW = VIEW_W) {
  const max = Math.max(0, levelW - viewW);
  return Math.max(0, Math.min(max, x));
}

export function snapCamera(cam: Camera, playerX: number, levelW = ROOM_W) {
  cam.x = clampCameraX(playerX + PLAYER_W / 2 - VIEW_W / 2, levelW);
  cam.y = 0;
}

export function followCamera(cam: Camera, playerX: number, levelW = ROOM_W) {
  const focus = playerX + PLAYER_W / 2;
  const mid = cam.x + VIEW_W / 2;
  if (focus < mid - CAM_DEADZONE) cam.x += focus - (mid - CAM_DEADZONE);
  if (focus > mid + CAM_DEADZONE) cam.x += focus - (mid + CAM_DEADZONE);
  cam.x = clampCameraX(cam.x, levelW);
  cam.y = 0;
}
