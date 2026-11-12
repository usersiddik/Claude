#!/usr/bin/env python3
"""
Writes a 400px WebP thumbnail for every sticker image in public/packs/<pack>/,
into public/packs/<pack>/thumbs/. Tiles, cards and polaroids use these; the
full 1024px files are kept for the editor, downloads and the hero.

    python3 scripts/make-thumbs.py          # only missing or out-of-date thumbs
    python3 scripts/make-thumbs.py --force  # rebuild all
"""

import sys
from pathlib import Path

from PIL import Image

SIZE = 400
PACKS = Path(__file__).resolve().parent.parent / "public" / "packs"


def thumb_path(source: Path) -> Path:
    return source.parent / "thumbs" / f"{source.stem}.webp"


def make_thumb(source: Path) -> Path:
    """Saves the thumbnail for one pack image and returns its path."""
    target = thumb_path(source)
    target.parent.mkdir(exist_ok=True)
    image = Image.open(source).convert("RGBA")
    image.thumbnail((SIZE, SIZE), Image.Resampling.LANCZOS)
    image.save(target, "WEBP", quality=82, method=6)
    return target


def main() -> None:
    force = "--force" in sys.argv[1:]
    made = 0
    for source in sorted(PACKS.glob("*/*")):
        if source.suffix not in (".webp", ".png") or not source.is_file():
            continue
        target = thumb_path(source)
        if force or not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
            make_thumb(source)
            made += 1
    print(f"{made} thumbnail(s) written")


if __name__ == "__main__":
    main()
