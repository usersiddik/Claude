import type { Asset } from "@/lib/assets/types";

interface AssetArtProps {
  asset: Pick<Asset, "sourceSvg">;
  /** Accessible name. Omit for decorative use (e.g. next to a visible title). */
  label?: string;
  className?: string;
}

/** Renders a catalogue SVG inline. Sources are local, validated files only. */
export function AssetArt({ asset, label, className }: AssetArtProps) {
  return (
    <span
      data-art=""
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: asset.sourceSvg }}
    />
  );
}
