import type { AssetFamily } from "@/lib/assets/types";

const LABELS: Record<AssetFamily, string> = { charm: "Charm", mark: "Mark", duo: "Duo" };

export function familyLabel(family: AssetFamily): string {
  return LABELS[family];
}
