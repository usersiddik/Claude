import type { Asset } from "../assets/types.ts";

/** The minimum an exporter needs. Keeps exporters easy to test and reuse. */
export type ExportSource = Pick<Asset, "title" | "slug" | "family" | "sourceSvg">;
