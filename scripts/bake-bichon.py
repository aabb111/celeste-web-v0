#!/usr/bin/env python3
"""Paint 24x20 soft-pixel Bichon frames from explicit maps. Facing right."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

OUT_DIR = Path(__file__).resolve().parents[1] / "src" / "assets"
FRAME_W = 24
FRAME_H = 20

PAL = {
    ".": (0, 0, 0, 0),
    "W": (255, 255, 255, 255),
    "A": (244, 244, 246, 255),
    "B": (226, 226, 230, 255),
    "C": (209, 209, 209, 255),
    "D": (184, 184, 190, 255),
    "K": (20, 20, 24, 255),
    "N": (8, 8, 10, 255),
    "H": (255, 255, 255, 255),
    "s": (18, 20, 36, 96),
    "L": (255, 255, 255, 165),
    "P": (255, 255, 255, 210),
}

# Idle feet sit on the last fur row so the shared ground line is y=17.
IDLE = [
    "........................",
    "........................",
    "............AAWWAA......",
    "...........AWWWWWWAA....",
    "..........AWWWKKWWWAA...",
    "..........AWWWHK.NWWAA..",
    "...........AWWW.NWWWAA..",
    "...........AWWWWWWWAA...",
    "..........AAAAAAAAAAAA..",
    ".......AABAAAAAAAAAAAA..",
    "......ABBAAAAAAAAAAAAAB.",
    "......ABBAAAAAAAAAAAAAB.",
    ".......AAAAAAAAAAAAAAAB.",
    "......AAAABBAAAABBAAAA..",
    "......A.BCC.B....B.CCB..",
    "........CC..........CC..",
    "........DD..........DD..",
    "........................",
    "........................",
    "........................",
]

JUMP = [
    "........................",
    "........................",
    "..............AAWWAA....",
    ".............AWWWWWWAA..",
    "............AWWWKKWWAA..",
    ".......AAA..AWWWHK.NWAA.",
    "......AWWWWAAWWW.NWWWAA.",
    ".....AWWWWWWWWWWWWWWWAA.",
    ".....ABWWWWAAAAAAWWWAA..",
    "....ABBAAAAAAAAAAAAAAB..",
    "....AABBBBAAAABBAAAAAB..",
    "....BB...CC....CCBBBAA..",
    "....CC...CC......CC.....",
    "....DD............C.....",
    "........................",
    "........................",
    ".........ssssssss.......",
    "........ssssssssss......",
    "........................",
    "........................",
]

DASH = [
    "........................",
    "........................",
    "...............AAWWAA...",
    "L.L..........AAWWWWWWAA.",
    "..L.........AWWWKKWWAA..",
    "L.L.L.......AWWWHK.NWAA.",
    "....L..AAA.AAWWW.NWWWAA.",
    "L.L..AWWWWWWWWWWWWWWWAA.",
    "...AABWWWWAAAAAAWWWAA...",
    "..ABBAAAAAAAAAAAAAABB...",
    "...AABBBBAAAABBAAAAAB...",
    "P.P.BB..CC....CCBBBAA...",
    ".P.P....CC......CC......",
    "P.P................C....",
    "..P.....................",
    "........................",
    "..........sssssssss.....",
    ".........sssssssssss....",
    "........................",
    "........................",
]


def paint(rows: list[str]) -> Image.Image:
    if len(rows) != FRAME_H or any(len(r) != FRAME_W for r in rows):
        raise SystemExit("frame map must be 24x20")
    im = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    px = im.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            px[x, y] = PAL[ch]
    return im


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, rows in (("idle", IDLE), ("jump", JUMP), ("dash", DASH)):
        dest = OUT_DIR / f"bichon-{name}.png"
        paint(rows).save(dest, "PNG")
        print(f"wrote {dest}")


if __name__ == "__main__":
    main()
