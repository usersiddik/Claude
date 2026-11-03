/**
 * Small, dependency-free helpers for the controlled SVG subset Charmbit uses.
 * Pure functions: safe to import on the server, the client, and in tests.
 */

export interface ParsedSvg {
  attributes: Record<string, string>;
  inner: string;
}

const ROOT_PATTERN = /^<svg\b([^>]*)>([\s\S]*)<\/svg>$/;
const ATTRIBUTE_PATTERN = /([:\w-]+)\s*=\s*"([^"]*)"/g;

/** Removes metadata, comments, titles and whitespace between tags. */
export function optimizeSvg(raw: string): string {
  return raw
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(title|desc|metadata)\b[\s\S]*?<\/\1>/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+(\/?>)/g, "$1")
    .trim();
}

export function parseAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const match of source.matchAll(ATTRIBUTE_PATTERN)) {
    const [, name, value] = match;
    if (name !== undefined && value !== undefined) attributes[name] = value;
  }
  return attributes;
}

export function parseSvg(svg: string): ParsedSvg {
  const match = ROOT_PATTERN.exec(svg.trim());
  if (!match) throw new Error("Expected a single <svg> root element.");
  return { attributes: parseAttributes(match[1] ?? ""), inner: match[2] ?? "" };
}

export function readViewBox(viewBox: string): { width: number; height: number } {
  const parts = viewBox.trim().split(/[\s,]+/).map(Number);
  const width = parts[2];
  const height = parts[3];
  if (parts.length !== 4 || !width || !height || parts.some(Number.isNaN)) {
    throw new Error(`Invalid viewBox "${viewBox}".`);
  }
  return { width, height };
}

/** Rules for every SVG in the library. Returns a list of problems (empty = valid). */
export function findSvgProblems(svg: string): string[] {
  const problems: string[] = [];
  let parsed: ParsedSvg | undefined;
  try {
    parsed = parseSvg(svg);
  } catch (error) {
    problems.push((error as Error).message);
  }
  if (parsed && !parsed.attributes.viewBox) problems.push("Missing viewBox on <svg>.");
  if (/<script\b/i.test(svg)) problems.push("Contains a <script> element.");
  if (/<style\b/i.test(svg)) problems.push("Contains a <style> element; use attributes instead.");
  if (/<(foreignObject|image)\b/i.test(svg)) problems.push("Contains embedded foreign content or images.");
  if (/\son[a-z]+\s*=/i.test(svg)) problems.push("Contains an inline event handler.");
  if (/href\s*=\s*"(?!#)/i.test(svg)) problems.push("Contains an external reference.");
  if (svg.includes("'''")) problems.push("Contains ''' which would break Dart raw strings.");
  return problems;
}

/** Indents markup one element per line. Keeps `<tag>text</tag>` on one line. */
export function formatMarkup(markup: string, indent = "  ", baseDepth = 0): string {
  const tokens = markup.split(/(<[^>]+>)/).filter((token) => token.trim() !== "");
  const lines: string[] = [];
  let depth = baseDepth;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index] ?? "";
    const pad = indent.repeat(Math.max(depth, 0));

    if (token.startsWith("</")) {
      depth -= 1;
      lines.push(indent.repeat(Math.max(depth, 0)) + token);
      continue;
    }

    const isTag = token.startsWith("<");
    const selfClosing = isTag && token.endsWith("/>");
    const text = tokens[index + 1];
    const close = tokens[index + 2];

    if (isTag && !selfClosing && text && !text.startsWith("<") && close?.startsWith("</")) {
      lines.push(pad + token + text + close);
      index += 2;
      continue;
    }

    lines.push(pad + token);
    if (isTag && !selfClosing) depth += 1;
  }

  return lines.join("\n");
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
