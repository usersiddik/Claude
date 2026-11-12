#!/usr/bin/env python3
"""
Prepare a generated image as a sticker and put it in a pack.

    python3 scripts/add-sticker.py <image> <pack> <sticker-id> [look] [--border N] [--tolerance N] [--square-bottom]

    python3 scripts/add-sticker.py ~/Downloads/chai.png sheru chai-sip
    python3 scripts/add-sticker.py ~/Downloads/chai.png sheru chai-sip --border 22
    python3 scripts/add-sticker.py ~/Downloads/chai-black.png sheru chai-sip black

What it does:
  1. Removes the flat background around the character. It fills inwards from
     the edges of the picture and stops at the character, so light greys and
     whites inside the character are never touched. Images that already have a
     transparent background are left as they are.
  2. With --border N, shaves N pixels off the outline. Use it when the
     generator drew its own white sticker border, so the site's outline
     option (none, thin, thick) stays in control.
  3. Rounds off a body that the picture cuts with a straight line at the
     bottom, so the sticker ends in a soft curve instead of a hard edge.
     --square-bottom keeps the straight cut.
     If the cutout bites into shaded fur or clothing, lower --tolerance
     (default 26); if a rim of background is left, raise it.
  4. Trims the empty space, centres the character on a square with a small
     margin, and resizes to 1024 x 1024.
  5. Saves a WebP with transparency to public/packs/<pack>/.

Needs Pillow:  pip install pillow
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

SIZE = 1024
MARGIN = 0.04
# How far a pixel may differ from the background colour and still count as background.
TOLERANCE = 26
MARKER = (255, 0, 255)


def has_transparency(image: Image.Image) -> bool:
    return image.getchannel("A").getextrema()[0] < 250


def remove_background(image: Image.Image, tolerance: int = TOLERANCE) -> Image.Image:
    """Flood the background in from every edge; whatever the flood cannot reach is the character."""
    rgb = image.convert("RGB")
    width, height = rgb.size
    work = rgb.copy()
    seeds = [(x, y) for x in range(0, width, 16) for y in (0, height - 1)] + [(x, y) for y in range(0, height, 16) for x in (0, width - 1)]
    key = work.getpixel((0, 0))
    for seed in seeds:
        pixel = work.getpixel(seed)
        if pixel != MARKER and max(abs(a - b) for a, b in zip(pixel, key)) <= tolerance * 2:
            ImageDraw.floodfill(work, seed, MARKER, thresh=tolerance)
    red, green, blue = work.split()
    # Background = exactly the marker colour.
    background = ImageChops.multiply(ImageChops.multiply(red.point(lambda v: 255 if v == 255 else 0), green.point(lambda v: 255 if v == 0 else 0)), blue.point(lambda v: 255 if v == 255 else 0))
    alpha = ImageChops.invert(background)
    # Pull the edge in by a pixel to drop the background-tinted fringe, then soften it.
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    return result


def shave(image: Image.Image, pixels: int) -> Image.Image:
    """Removes a border of the given width from the outline (for a baked-in white sticker edge)."""
    alpha = image.getchannel("A").point(lambda v: 255 if v > 128 else 0)
    try:
        # A true round shave when SciPy is installed: it follows curves and dips far better.
        import numpy
        from scipy import ndimage

        inside = ndimage.distance_transform_edt(numpy.asarray(alpha) > 0) > pixels
        alpha = Image.fromarray((inside * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))
        image = image.copy()
        image.putalpha(ImageChops.darker(alpha, image.getchannel("A")))
        return image
    except ImportError:
        pass
    # Alternate square and diamond steps so the shaved outline stays rounded, not boxy.
    for step in range(pixels):
        if step % 2 == 0:
            alpha = alpha.filter(ImageFilter.MinFilter(3))
        else:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                alpha = ImageChops.darker(alpha, ImageChops.offset(alpha, dx, dy))
    alpha = alpha.filter(ImageFilter.GaussianBlur(1))
    image = image.copy()
    image.putalpha(ImageChops.darker(alpha, image.getchannel("A")))
    return image


def round_bottom(image: Image.Image) -> Image.Image:
    """
    Where the body is cut by a straight line at the bottom, trims the two
    lower corners along a curve so the sticker ends in a soft rounded shape.
    Stickers that already end in a curve or a point are left alone.
    """
    alpha = image.getchannel("A")
    solid = alpha.point(lambda value: 255 if value > 128 else 0)
    box = solid.getbbox()
    if not box:
        return image
    bottom = box[3] - 1
    # A straight cut is as wide a few pixels up as it is further up; a rounded bottom narrows quickly.
    def run(rows_up: int) -> tuple[int, int] | None:
        found = solid.crop((0, max(0, bottom - rows_up), image.width, max(1, bottom - rows_up + 1))).getbbox()
        return (found[0], found[2]) if found else None

    low, high = run(4), run(28)
    if not low or not high:
        return image
    left, right = low
    span = right - left
    if span < (box[2] - box[0]) * 0.3 or span < (high[1] - high[0]) * 0.88:
        return image
    depth = span * 0.3
    centre = (left + right) / 2
    steps = 96
    curve = []
    for step in range(steps + 1):
        t = -1 + 2 * step / steps
        # A superellipse: flat through the middle, sweeping up at the sides.
        lift = depth * (1 - (1 - abs(t) ** 2.4) ** (1 / 2.4))
        curve.append((centre + t * (span / 2 + 6), bottom - lift))
    # Only the area under the curve, between the two ends of the cut, is removed.
    keep = Image.new("L", image.size, 255)
    ImageDraw.Draw(keep).polygon([*curve, (curve[-1][0], image.height), (curve[0][0], image.height)], fill=0)
    keep = keep.filter(ImageFilter.GaussianBlur(1.5))
    image = image.copy()
    image.putalpha(ImageChops.darker(alpha, keep))
    return image


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
    args = sys.argv[1:]
    border = 0
    square_bottom = "--square-bottom" in args
    if square_bottom:
        args.remove("--square-bottom")
    tolerance = TOLERANCE
    if "--tolerance" in args:
        at = args.index("--tolerance")
        tolerance = int(args[at + 1])
        del args[at : at + 2]
    if "--border" in args:
        at = args.index("--border")
        border = int(args[at + 1])
        del args[at : at + 2]
    if len(args) not in (3, 4):
        sys.exit(__doc__)
    source, pack, sticker = Path(args[0]), args[1], args[2]
    look = args[3] if len(args) == 4 else None
    image = Image.open(source).convert("RGBA")
    if not has_transparency(image):
        image = remove_background(image, tolerance)
    if border > 0:
        image = shave(image, border)
    if not square_bottom:
        image = round_bottom(image)
    image = frame(image)
    folder = Path(__file__).resolve().parent.parent / "public" / "packs" / pack
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / (f"{sticker}.{look}.webp" if look else f"{sticker}.webp")
    image.save(target, "WEBP", quality=92, method=6)
    print(f"Saved {target.relative_to(folder.parent.parent.parent)} ({target.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
