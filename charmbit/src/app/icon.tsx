import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

/** Favicon: the placeholder monogram, drawn from the brand config. */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          border: "4px solid #141312",
          backgroundColor: "#F6D673",
          color: "#141312",
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        {BRAND.initial}
      </div>
    ),
    size,
  );
}
