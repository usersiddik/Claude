import type { Asset } from "@/lib/assets/types";
import { copyText } from "@/lib/clipboard";
import { announceCopy } from "@/lib/copy-events";
import { customizeSvg } from "@/lib/customize";
import { buildExport } from "@/lib/exports";
import { copyImage, download, renderSticker } from "@/lib/sticker";
import { outputLabel } from "./options";
import type { Output } from "./url-state";

export interface Colors {
  fill: string | null;
  ink: string | null;
}

/**
 * Copies an asset as a sticker image or as code, with the chosen colours,
 * and announces the result. Where image copy isn't supported, the sticker
 * downloads instead.
 */
export async function copyAsset(asset: Asset, output: Output, colors: Colors, border = true): Promise<boolean> {
  const svg = customizeSvg(asset, colors.fill);
  const notice = { title: asset.title, format: outputLabel(output), svg, ink: colors.ink };

  if (output === "sticker") {
    const blob = renderSticker(svg, { border, ink: colors.ink ?? undefined });
    try {
      await copyImage(blob);
      announceCopy({ ...notice, ok: true });
      return true;
    } catch {
      try {
        download(await blob, `${asset.slug}.png`);
        announceCopy({ ...notice, format: "PNG", verb: "Saved", ok: true });
        return true;
      } catch {
        announceCopy({ ...notice, ok: false });
        return false;
      }
    }
  }

  let ok = true;
  try {
    await copyText(buildExport(asset, output, { fill: colors.fill, ink: colors.ink ?? undefined }));
  } catch {
    ok = false;
  }
  announceCopy({ ...notice, ok });
  return ok;
}
