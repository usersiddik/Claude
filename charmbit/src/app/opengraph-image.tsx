import { ImageResponse } from "next/og";
import { loadAssets } from "@/lib/assets/load";
import { PALETTE } from "@/lib/assets/palette";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SHOWCASE = ["gold-star", "mochi", "wisp", "sprout"];

function dataUri(svg: string): string {
  const inked = svg.replace(/currentColor/g, PALETTE.ink.hex);
  return `data:image/svg+xml;base64,${Buffer.from(inked).toString("base64")}`;
}

export default function OpenGraphImage() {
  const assets = loadAssets().filter((asset) => SHOWCASE.includes(asset.slug));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#FAFAF9",
          color: PALETTE.ink.hex,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 700 }}>
          <div
            style={{
              width: 44,
              height: 36,
              borderRadius: 6,
              border: `4px solid ${PALETTE.ink.hex}`,
              background: PALETTE.butter.hex,
            }}
          />
          charmbit
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{SITE.tagline}</div>
          <div style={{ fontSize: 30, color: "#4A4752" }}>{SITE.supportingLine}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
          {assets.map((asset) => (
            <img key={asset.id} src={dataUri(asset.sourceSvg)} width={132} height={132} alt="" />
          ))}
          <div style={{ display: "flex", marginLeft: "auto", fontSize: 26, color: "#4A4752" }}>
            SVG · React · Flutter
          </div>
        </div>
      </div>
    ),
    size,
  );
}
