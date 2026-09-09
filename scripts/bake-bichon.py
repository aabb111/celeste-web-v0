#!/usr/bin/env python3
"""Slice 比熊修正版 source crops into transparent in-game frames.

Primary art: scripts/ref/bichon-{idle,jump,dash}-src.png
(cropped from the 比熊修正版 sheet — curly powder-puff, short snout).
Idle feet sit on a shared ground row so the 8x10 collider stays put.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "scripts" / "ref"
OUT_DIR = ROOT / "src" / "assets"

FRAME_W = 72
FRAME_H = 36
TARGET_H = 32
FOOT_Y = 33

PAL = [
    (255, 255, 255, 255),
    (248, 248, 246, 255),
    (236, 234, 228, 255),
    (220, 218, 210, 255),
    (198, 196, 188, 255),
    (176, 172, 164, 255),
    (148, 144, 136, 255),
    (110, 106, 100, 255),
    (28, 24, 22, 255),
    (12, 10, 10, 255),
    (168, 118, 70, 255),
    (120, 78, 42, 255),
    (86, 54, 30, 255),
]


def is_dust(c: tuple[int, int, int, int]) -> bool:
    r, g, b, a = c
    return a > 40 and r > 70 and r > g + 20 and r > b + 25 and g < 160


def nearest_pal(c: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    r, g, b, a = c
    if a < 40:
        return (0, 0, 0, 0)
    if a < 160 or is_dust(c):
        best = min(PAL[10:], key=lambda p: (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2)
        return (*best[:3], 220 if a >= 80 else 160)
    best = min(PAL, key=lambda p: (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2)
    return best


def quantize(im: Image.Image) -> Image.Image:
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sp, dp = im.load(), out.load()
    assert sp is not None and dp is not None
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            dp[x, y] = nearest_pal(sp[x, y])
    return out


def downscale(im: Image.Image) -> Image.Image:
    scale = TARGET_H / im.size[1]
    tw = max(1, round(im.size[0] * scale))
    return im.resize((tw, TARGET_H), Image.BOX)


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
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name in ("idle", "jump", "dash"):
        src = Image.open(SRC_DIR / f"bichon-{name}-src.png").convert("RGBA")
        frame = pack(quantize(downscale(src)))
        dest = OUT_DIR / f"bichon-{name}.png"
        frame.save(dest, "PNG")
        print(f"wrote {dest} {frame.size} footY={FOOT_Y}")


if __name__ == "__main__":
    main()
