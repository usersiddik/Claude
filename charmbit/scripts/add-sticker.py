#!/usr/bin/env python3
"""
Prepare a generated image as a sticker and put it in a pack.

    python3 scripts/add-sticker.py <image> <pack> <sticker-id> [look]

    python3 scripts/add-sticker.py ~/Downloads/coffee.png sheru coffee
    python3 scripts/add-sticker.py ~/Downloads/coffee-black.png sheru coffee black

What it does:
  1. Removes a flat background colour (the prompts ask for solid green). Images
     that already have a transparent background are left as they are.
  2. Trims the empty space, centres the character on a square with a small
     margin, and resizes to 1024 x 1024.
  3. Saves a WebP with transparency to public/packs/<pack>/.

Needs Pillow:  pip install pillow
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

SIZE = 1024
MARGIN = 0.04
# Colour distance at which a pixel counts as fully background / fully character.
NEAR, FAR = 60, 130


def has_transparency(image: Image.Image) -> bool:
    return image.getchannel("A").getextrema()[0] < 250


def background_colour(image: Image.Image) -> tuple[int, int, int]:
    """The colour around the edge of the image (median of the border pixels)."""
    width, height = image.size
    rgb = image.convert("RGB")
    pixels = [rgb.getpixel((x, y)) for x in range(0, width, 8) for y in (0, 1, height - 2, height - 1)]
    pixels += [rgb.getpixel((x, y)) for y in range(0, height, 8) for x in (0, 1, width - 2, width - 1)]
    return tuple(sorted(channel)[len(pixels) // 2] for channel in zip(*pixels))  # type: ignore[return-value]


def remove_background(image: Image.Image) -> Image.Image:
    key = background_colour(image)
    rgb = image.convert("RGB")
    difference = ImageChops.difference(rgb, Image.new("RGB", rgb.size, key))
    red, green, blue = difference.split()
    # Largest channel difference is a cheap, good-enough colour distance.
    distance = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    alpha = distance.point(lambda value: 0 if value <= NEAR else 255 if value >= FAR else int((value - NEAR) * 255 / (FAR - NEAR)))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))

    # Despill: where the key colour is green, stop green exceeding the other channels,
    # so white fur does not keep a green edge.
    if key[1] > key[0] + 40 and key[1] > key[2] + 40:
        r, g, b = rgb.split()
        g = ImageChops.darker(g, ImageChops.lighter(r, b))
        rgb = Image.merge("RGB", (r, g, b))

    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    return result


def frame(image: Image.Image) -> Image.Image:
    box = image.getchannel("A").point(lambda value: 255 if value > 16 else 0).getbbox()
    if not box:
        sys.exit("Nothing left after removing the background. Is the character the same colour as the background?")
    image = image.crop(box)
    inner = round(SIZE * (1 - 2 * MARGIN))
    scale = inner / max(image.size)
    image = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(image, ((SIZE - image.width) // 2, (SIZE - image.height) // 2))
    return canvas


def main() -> None:
    if len(sys.argv) not in (4, 5):
        sys.exit(__doc__)
    source, pack, sticker = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
    look = sys.argv[4] if len(sys.argv) == 5 else None
    image = Image.open(source).convert("RGBA")
    if not has_transparency(image):
        image = remove_background(image)
    image = frame(image)
    folder = Path(__file__).resolve().parent.parent / "public" / "packs" / pack
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / (f"{sticker}.{look}.webp" if look else f"{sticker}.webp")
    image.save(target, "WEBP", quality=92, method=6)
    print(f"Saved {target.relative_to(folder.parent.parent.parent)} ({target.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
