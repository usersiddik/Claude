import type { AssetFamily } from "@/lib/assets/types";

export function catalogNumber(number: number): string {
  return `No. ${String(number).padStart(3, "0")}`;
}

const LABELS: Record<AssetFamily, string> = { charm: "Charm", mark: "Mark", duo: "Duo" };

export function familyLabel(family: AssetFamily): string {
  return LABELS[family];
}
