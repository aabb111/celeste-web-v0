import { PLAYER_H } from "./params";

export const TILE = 8;
/** World width in tiles. Camera shows a 40-tile window. */
export const COLS = 72;
export const VIEW_COLS = 40;
export const ROWS = 18;
export const ROOM_W = COLS * TILE;
export const VIEW_W = VIEW_COLS * TILE;
export const ROOM_H = ROWS * TILE;
export const VIEW_H = ROWS * TILE;

export const EMPTY = 0;
export const SOLID = 1;
export const SPIKE = 2;

export type RoomId = "room1" | "room2";

export type Checkpoint = { id: number; x: number; y: number; w: number; h: number };
export type Flag = { x: number; y: number; w: number; h: number };
export type Label = { text: string; x: number; y: number };
export type Fill = (x0: number, x1: number, y0: number, y1: number, type: number) => void;

export type RoomBlueprint = {
  id: RoomId;
  next: RoomId | null;
  status: string;
  spawn: { x: number; y: number };
  checkpoints: Checkpoint[];
  flag: Flag;
  goalLedge: { x: number; y: number; w: number; h: number };
  door: { x: number; y: number; w: number; h: number } | null;
  labels: Label[];
  paint: (fill: Fill) => void;
};

export function tilePos(tx: number, top: number) {
  return { x: tx * TILE, y: top * TILE - PLAYER_H };
}

export function tileCheckpoint(id: number, tx: number, top: number): Checkpoint {
  return { id, ...tilePos(tx, top), w: TILE, h: PLAYER_H };
}

export function tileFlag(tx: number, top: number): Flag {
  return { x: tx * TILE + 1, y: top * TILE - 16, w: 6, h: 16 };
}
