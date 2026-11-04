import { ImageResponse } from "next/og";
import { countStickers, defaultValues, findItem, isLive } from "@/lib/universe";
import { getUniverse } from "@/lib/universe/server";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}: stickers for every feeling`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/** [collection, sticker, size, left, top, rotation], kept clear of the headline. */
const PICKS = [
  ["love", "glossy-heart", 140, 40, 24, -10],
  ["diwali", "sparkler-siblings", 210, 970, 14, 6],
  ["frogs", "yay", 160, 46, 430, -8],
  ["diwali", "diya-girl", 150, 250, 470, 8],
  ["rabbits", "love", 130, 820, 488, -6],
  ["cats", "smitten-standing", 190, 1000, 400, 4],
] as const;

export default function OpenGraphImage() {
  const universe = getUniverse();
  const live = universe.filter(isLive);
  // The OG renderer doesn't support SVG filters, so use the portable drawings.
  const stickers = PICKS.map(([collectionId, itemId, width, x, y, rotate]) => {
    const collection = live.find((candidate) => candidate.id === collectionId)!;
    return { svg: collection.render(findItem(collection, itemId), defaultValues(collection), { portable: true }), width, x, y, rotate };
  });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", backgroundColor: "#F2F0EB", color: "#141312" }}>
        {stickers.map((sticker, index) => (
          <img
            key={index}
            src={dataUri(sticker.svg)}
            width={sticker.width}
            height={sticker.width}
            alt=""
            style={{ position: "absolute", left: sticker.x, top: sticker.y, transform: `rotate(${sticker.rotate}deg)` }}
          />
        ))}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", gap: 18, marginTop: -40 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#625E57" }}>{SITE.tagline}</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 0.92, textTransform: "uppercase" }}>
            <span>Stickers for</span>
            <span>every feeling.</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#625E57" }}>{countStickers(universe)} stickers · copy, paste, or export to SVG, React, Flutter</div>
        </div>
      </div>
    ),
    size,
  );
}
