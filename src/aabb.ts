export type Rect = { x: number; y: number; w: number; h: number };

export function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return current;
}

export function tileRange(pos: number, size: number, tile: number, limit: number): [number, number] {
  const start = Math.max(0, Math.floor(pos / tile));
  const end = Math.min(limit - 1, Math.floor((pos + size - 0.001) / tile));
  return [start, end];
}
