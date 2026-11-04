import type { Asset } from "../assets/types.ts";
import type { ExportFamily } from "./naming.ts";

/** The minimum an exporter needs. Keeps exporters easy to test and reuse. */
export type ExportSource = Pick<Asset, "title" | "slug" | "sourceSvg"> & { family: ExportFamily };

export interface ExportOptions {
  /**
   * Custom ink (linework) colour. When omitted, exports keep `currentColor`
   * so the artwork inherits the surrounding text colour.
   */
  ink?: string;
}
