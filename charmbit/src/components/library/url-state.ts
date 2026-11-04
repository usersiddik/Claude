import { DEFAULT_FILTER, isFilterId, type FilterId } from "@/lib/assets/filters";
import type { ExportFormat } from "@/lib/assets/types";
import { DEFAULT_FILL_ID, DEFAULT_INK_ID, FILL_OPTIONS, INK_OPTIONS } from "@/lib/customize";
import { isExportFormat } from "@/lib/exports";

export const CANVASES = ["light", "dark", "grid"] as const;
export type Canvas = (typeof CANVASES)[number];

/** What a copy produces: a sticker image, or code in one of the export formats. */
export type Output = "sticker" | ExportFormat;
export const DEFAULT_OUTPUT: Output = "sticker";
export const isOutput = (value: string | null | undefined): value is Output => value === "sticker" || isExportFormat(value);

export interface LibraryState {
  query: string;
  filter: FilterId;
  fill: string;
  ink: string;
  format: Output;
  /** White die-cut outline on sticker output (off by default). */
  border: boolean;
  canvas: Canvas;
  /** Slug of the asset open in the inspector. */
  asset: string | null;
}

export const DEFAULT_STATE: LibraryState = {
  query: "",
  filter: DEFAULT_FILTER,
  fill: DEFAULT_FILL_ID,
  ink: DEFAULT_INK_ID,
  format: DEFAULT_OUTPUT,
  border: false,
  canvas: "light",
  asset: null,
};

interface ParamsLike {
  get(name: string): string | null;
}

const known = (options: readonly { id: string }[], value: string | null, fallback: string) =>
  options.some((option) => option.id === value) ? (value as string) : fallback;

export function readState(params: ParamsLike | null): LibraryState {
  if (!params) return DEFAULT_STATE;
  const filter = params.get("filter");
  const format = params.get("as");
  const canvas = params.get("canvas");
  return {
    query: params.get("q") ?? "",
    filter: isFilterId(filter) ? filter : DEFAULT_FILTER,
    fill: known(FILL_OPTIONS, params.get("color"), DEFAULT_FILL_ID),
    ink: known(INK_OPTIONS, params.get("ink"), DEFAULT_INK_ID),
    format: isOutput(format) ? format : DEFAULT_OUTPUT,
    border: params.get("border") === "on",
    canvas: CANVASES.includes(canvas as Canvas) ? (canvas as Canvas) : "light",
    asset: params.get("asset"),
  };
}

/** Serialises state into a search string, omitting defaults and keeping unrelated params. */
export function writeSearch(current: string, state: LibraryState): string {
  const params = new URLSearchParams(current);
  const set = (key: string, value: string | null, fallback: string) =>
    value && value !== fallback ? params.set(key, value) : params.delete(key);
  set("q", state.query.trim() ? state.query : "", "");
  set("filter", state.filter, DEFAULT_FILTER);
  set("color", state.fill, DEFAULT_FILL_ID);
  set("ink", state.ink, DEFAULT_INK_ID);
  set("as", state.format, DEFAULT_OUTPUT);
  set("border", state.border ? "on" : "", "");
  set("canvas", state.canvas, "light");
  set("asset", state.asset, "");
  const search = params.toString();
  return search ? `?${search}` : "";
}
