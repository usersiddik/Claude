import type { Asset, ExportFormat } from "@/lib/assets/types";
import { copyText } from "@/lib/clipboard";
import { announceCopy } from "@/lib/copy-events";
import { customizeSvg } from "@/lib/customize";
import { buildExport, findFormat } from "@/lib/exports";

export interface Colors {
  fill: string | null;
  ink: string | null;
}

/** Copies an asset in a format with the chosen colours and announces the result. */
export async function copyAsset(asset: Asset, format: ExportFormat, colors: Colors): Promise<boolean> {
  const code = buildExport(asset, format, { fill: colors.fill, ink: colors.ink ?? undefined });
  let ok = true;
  try {
    await copyText(code);
  } catch {
    ok = false;
  }
  announceCopy({
    title: asset.title,
    format: findFormat(format).label,
    svg: customizeSvg(asset, colors.fill),
    ink: colors.ink,
    ok,
  });
  return ok;
}
