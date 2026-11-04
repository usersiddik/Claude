import { ImageResponse } from "next/og";
import { drawSticker } from "@/lib/characters/draw";
import { DEFAULT_SPEC } from "@/lib/characters/options";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

export default function OpenGraphImage() {
  // The OG renderer doesn't support SVG filters, so use the portable variants.
  const stickers = [
    drawSticker({ ...DEFAULT_SPEC, reaction: "love", portable: true }),
    drawSticker({ ...DEFAULT_SPEC, reaction: "naughty", look: { fur: "#5A5B66", eyes: "#2E9E6A" }, portable: true }),
    drawSticker({ ...DEFAULT_SPEC, reaction: "diwali-diya", portable: true }),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "#F5F5F7",
          backgroundColor: "#08080F",
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(124,92,255,0.55), transparent 45%), radial-gradient(circle at 85% 90%, rgba(255,79,154,0.4), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>charmbit</div>
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 500 }}>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{SITE.tagline}</div>
            <div style={{ fontSize: 28, color: "#C7C7CC" }}>27 reactions, any colour, couples and Diwali specials.</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {stickers.map((svg, index) => (
              <img key={index} src={dataUri(svg)} width={168} height={168} alt="" />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#A1A1A6" }}>Stickers · SVG · React · Flutter</div>
      </div>
    ),
    size,
  );
}
