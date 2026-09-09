#!/usr/bin/env python3
"""Slice idle/jump/dash from the 比熊修正版 sheet. No redraw, no palette remap.

Primary art: scripts/ref/bichon-revised-sheet.png
Crops are written to scripts/ref/bichon-{idle,jump,dash}-src.png
Idle feet sit on a shared ground row so the 8x10 collider stays put.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REF_DIR = ROOT / "scripts" / "ref"
OUT_DIR = ROOT / "src" / "assets"
SHEET = REF_DIR / "bichon-revised-sheet.png"

FRAME_W = 72
FRAME_H = 36
TARGET_H = 32
FOOT_Y = 33

# Tight boxes around the three gameplay poses on 比熊修正版 (1280x720).
CROPS = {
    "idle": (582, 66, 794, 236),
    "jump": (590, 388, 754, 558),
    "dash": (870, 390, 1204, 558),
}


def is_navy(c: tuple[int, int, int, int]) -> bool:
    r, g, b, _a = c
    return r < 55 and g < 60 and b < 95


def is_dust(c: tuple[int, int, int, int]) -> bool:
    r, g, b, a = c
    return a > 40 and r > 70 and r > g + 20 and r > b + 25 and g < 160


def punch_navy(im: Image.Image) -> Image.Image:
    out = im.convert("RGBA")
    px = out.load()
    assert px is not None
    w, h = out.size
    for y in range(h):
        for x in range(w):
            if is_navy(px[x, y]):
                px[x, y] = (0, 0, 0, 0)
    return out


def trim(im: Image.Image) -> Image.Image:
    box = im.getbbox()
    if box is None:
        return im
    return im.crop(box)


def harden_alpha(im: Image.Image) -> Image.Image:
    """Keep the sheet's colors; only drop faint navy fringe."""
    out = im.copy()
    px = out.load()
    assert px is not None
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 48:
                px[x, y] = (0, 0, 0, 0)
            elif a < 200 and is_navy((r, g, b, a)):
                px[x, y] = (0, 0, 0, 0)
    return out


def slice_pose(sheet: Image.Image, name: str) -> Image.Image:
    crop = punch_navy(sheet.crop(CROPS[name]))
    dog = harden_alpha(trim(crop))
    dest = REF_DIR / f"bichon-{name}-src.png"
    dog.save(dest, "PNG")
    return dog


def downscale(im: Image.Image) -> Image.Image:
    scale = TARGET_H / im.size[1]
    tw = max(1, round(im.size[0] * scale))
    return harden_alpha(im.resize((tw, TARGET_H), Image.BOX))


def body_box(im: Image.Image) -> tuple[int, int, int, int]:
    px = im.load()
    assert px is not None
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if c[3] < 80 or is_dust(c):
                continue
            found = True
            minx = min(minx, x)
            maxx = max(maxx, x)
            miny = min(miny, y)
            maxy = max(maxy, y)
    if not found:
        box = im.getbbox()
        if box is None:
            return (0, 0, w - 1, h - 1)
        return box
    return (minx, miny, maxx, maxy)


def foot_row(im: Image.Image) -> int:
    px = im.load()
    assert px is not None
    w, h = im.size
    for y in range(h - 1, -1, -1):
        for x in range(w):
            c = px[x, y]
            if c[3] > 80 and not is_dust(c):
                return y
    return h - 1


def pack(im: Image.Image) -> Image.Image:
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    x0, _, x1, _ = body_box(im)
    cx = (x0 + x1) / 2
    dest_x = int(round(FRAME_W / 2 - cx))
    dest_y = FOOT_Y - foot_row(im)
    frame.paste(im, (dest_x, dest_y), im)
    return frame


def main() -> None:
    if not SHEET.exists():
        raise SystemExit(f"missing primary sheet {SHEET}")
    sheet = Image.open(SHEET).convert("RGBA")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name in ("idle", "jump", "dash"):
        frame = pack(downscale(slice_pose(sheet, name)))
        dest = OUT_DIR / f"bichon-{name}.png"
        frame.save(dest, "PNG")
        print(f"wrote {dest} {frame.size} from 比熊修正版 footY={FOOT_Y}")


if __name__ == "__main__":
    main()
