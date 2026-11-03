import { readFileSync } from "node:fs";
import path from "node:path";
import { CATALOG } from "./catalog.ts";
import { findSvgProblems, optimizeSvg, parseSvg, readViewBox } from "./svg.ts";
import type { Asset, AssetFamily, AssetMeta } from "./types.ts";

/** Server/build-time only: reads SVG files from disk. */

export const FAMILY_DIRECTORY: Record<AssetFamily, string> = {
  charm: "charms",
  mark: "marks",
  duo: "duos",
};

export function svgPathFor(meta: Pick<AssetMeta, "family" | "slug">, root = process.cwd()): string {
  return path.join(root, "assets", "svg", FAMILY_DIRECTORY[meta.family], `${meta.slug}.svg`);
}

export function buildAsset(meta: AssetMeta, rawSvg: string, number: number): Asset {
  const sourceSvg = optimizeSvg(rawSvg);
  const problems = findSvgProblems(sourceSvg);
  if (problems.length > 0) {
    throw new Error(`${meta.id}: ${problems.join(" ")}`);
  }
  const viewBox = parseSvg(sourceSvg).attributes.viewBox ?? "";
  const { width, height } = readViewBox(viewBox);
  return { ...meta, number, sourceSvg, viewBox, width, height };
}

/** Cross-checks the catalogue. Returns human-readable problems. */
export function validateCatalog(catalog: readonly AssetMeta[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const meta of catalog) {
    if (ids.has(meta.id)) problems.push(`Duplicate id "${meta.id}".`);
    if (slugs.has(meta.slug)) problems.push(`Duplicate slug "${meta.slug}".`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.slug)) problems.push(`Slug "${meta.slug}" must be kebab-case.`);
    if (meta.palette.length === 0) problems.push(`${meta.id} has an empty palette.`);
    if (meta.family === "duo" && !meta.relationship) problems.push(`${meta.id} is a Duo without a relationship.`);
    ids.add(meta.id);
    slugs.add(meta.slug);
  }

  for (const meta of catalog) {
    const references = [...meta.relatedAssetIds, ...(meta.relationship?.memberIds ?? [])];
    for (const reference of references) {
      if (!ids.has(reference)) problems.push(`${meta.id} references unknown asset "${reference}".`);
    }
  }

  return problems;
}

let cache: Asset[] | undefined;

export function loadAssets(root = process.cwd()): Asset[] {
  if (cache) return cache;
  const problems = validateCatalog(CATALOG);
  if (problems.length > 0) throw new Error(`Invalid catalogue:\n${problems.join("\n")}`);

  cache = CATALOG.map((meta, index) =>
    buildAsset(meta, readFileSync(svgPathFor(meta, root), "utf8"), index + 1),
  );
  return cache;
}
