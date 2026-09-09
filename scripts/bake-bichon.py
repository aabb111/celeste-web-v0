#!/usr/bin/env python3
"""Paint 16x14 Bichon frames from explicit pixel maps. Facing right.

These are newly drawn at game scale — not crops or downscales of
scripts/ref/bichon-revised-sheet.png (style guide only).

Idle feet sit on row 12 so FOOT_Y=13 matches src/sprites/bichon.ts.
Jump is a tucked ball a couple of rows above that line.
Dash is a short stretch with a tiny dust trail, feet on the same ground row.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

OUT_DIR = Path(__file__).resolve().parents[1] / "src" / "assets"
FRAME_W = 16
FRAME_H = 14

PAL = {
    ".": (0, 0, 0, 0),
    "W": (255, 255, 255, 255),
    "A": (244, 244, 248, 255),
    "B": (224, 224, 230, 255),
    "C": (198, 198, 206, 255),
    "D": (172, 172, 180, 255),
    "K": (26, 26, 30, 255),
    "N": (10, 10, 12, 255),
    "H": (255, 255, 255, 255),
    "s": (110, 74, 48, 150),
    "t": (88, 60, 40, 90),
    "L": (255, 255, 255, 150),
}

# Compact side stand. Round powder-puff head, one button eye, curled tail.
IDLE = [
    "................",
    ".......AWWWWA...",
    "......AWWWWWWAA.",
    ".....AWWWKWWWWA.",
    ".....AWWWH.NWWA.",
    "..A..AAWWW.NWA..",
    ".AWA.AAAAAAAAAA.",
    ".AWAAAAAAAAAAAA.",
    "..AAAAAAAAAAAAA.",
    "..AABAAAAAABBAA.",
    "..A.BB.AA..BB.A.",
    "....CC......CC..",
    "....DD......DD..",
    "................",
]

# Tucked ball, head tipped a little down, tiny takeoff dust.
JUMP = [
    "................",
    "......AWWWWA....",
    ".....AWWWWWWAA..",
    "....AWWWKWWWWA..",
    "...AAWWWH.NWWA..",
    "..AWWAWWW.NWA...",
    "..AWAAAAAAAAAA..",
    "...AAAAAAAAAAA..",
    "...AABBBBBBAA...",
    "....A.CCCC.A....",
    ".....A....A.....",
    "......ssss......",
    ".......tt.......",
    "................",
]

# Short horizontal stretch, flattened tail puff, tiny rear dust.
DASH = [
    "................",
    "................",
    ".........AWWWA..",
    "........AWWWWWA.",
    ".......AWWKWWWA.",
    "......AWWWH.NWA.",
    "L.AA.AAWWW.NWA..",
    ".AWA.AAAAAAAAA..",
    ".AWAAAAAAAAAAA..",
    "..AABBAAAABBAA..",
    ".s.CC....CC.A...",
    "s...CC....CC....",
    "t...DD....DD....",
    "................",
]


def paint(rows: list[str]) -> Image.Image:
    if len(rows) != FRAME_H or any(len(r) != FRAME_W for r in rows):
        raise SystemExit(f"frame map must be {FRAME_W}x{FRAME_H}")
    im = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    px = im.load()
    assert px is not None
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            px[x, y] = PAL[ch]
    return im


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, rows in (("idle", IDLE), ("jump", JUMP), ("dash", DASH)):
        dest = OUT_DIR / f"bichon-{name}.png"
        paint(rows).save(dest, "PNG")
        print(f"wrote {dest} {FRAME_W}x{FRAME_H}")


if __name__ == "__main__":
    main()
