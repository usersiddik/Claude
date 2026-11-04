import type { Asset } from "../assets/types.ts";

/** The minimum an exporter needs. Keeps exporters easy to test and reuse. */
export type ExportSource = Pick<Asset, "title" | "slug" | "family" | "sourceSvg">;

export interface ExportOptions {
  /**
   * Custom ink (linework) colour. When omitted, exports keep `currentColor`
   * so the artwork inherits the surrounding text colour.
   */
  ink?: string;
}
