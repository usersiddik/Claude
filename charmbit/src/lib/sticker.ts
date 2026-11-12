/**
 * Sticker output: renders an asset's SVG to a transparent bitmap (512×512 by
 * default, the size messaging apps use for stickers) with an optional white
 * die-cut outline of any width (off by default), then copies, downloads, or
 * shares it. Browser-only.
 */

import { captionEdge, captionFontOf, fitCaption, type Caption, type CaptionFont, type Measure, spacedFor } from "./caption.ts";

export interface StickerOptions {
  size?: number;
  /** White die-cut outline width as a share of the sticker size (0 = none). */
  stroke?: number;
  /** Shorthand for the classic thin outline. */
  border?: boolean;
  /** Colour for currentColor linework (images have no surrounding text colour). */
  ink?: string;
  type?: "image/png" | "image/webp";
  /** Encoder quality for WebP, 0 to 1. */
  quality?: number;
  /** Optional SVG used only for the die-cut edge (e.g. without whiskers). */
  silhouette?: string;
  /** Text along the bottom, sized to fit. */
  caption?: Caption;
}

export const STICKER_SIZE = 512;

/** Share of the sticker height kept for a caption; the art moves up to make room. */
const CAPTION_BAND = 0.2;

/** Outline presets, as a share of the sticker size (2.2% is the classic die-cut). */
export const STROKES = [
  { id: "none", name: "None", width: 0 },
  { id: "thin", name: "Thin", width: 0.016 },
  { id: "medium", name: "Medium", width: 0.026 },
  { id: "thick", name: "Thick", width: 0.04 },
  { id: "extra", name: "Extra", width: 0.056 },
] as const;

export type StrokeId = (typeof STROKES)[number]["id"];

export const strokeWidth = (id: StrokeId) => STROKES.find((stroke) => stroke.id === id)?.width ?? 0;

/** Empty space around the art: WhatsApp's ~16px margin at 512px, plus room for the outline. */
export const paddingFor = (stroke: number) => 0.04 + stroke * 1.1;
const DEFAULT_INK = "#1D1D1F";

/** Gives the SVG explicit pixel dimensions and resolves currentColor. */
export function prepareSvg(svg: string, pixels: number, ink: string): string {
  return svg
    .replace(/<svg\b([^>]*)>/, (_match, attributes: string) => {
      const cleaned = attributes.replace(/\s(width|height)="[^"]*"/g, "");
      return `<svg${cleaned} width="${pixels}" height="${pixels}">`;
    })
    .replace(/currentColor/g, ink);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render the sticker."));
    image.src = src;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the sticker."))), type, quality);
  });
}

/** What to render: SVG markup, or an image file by URL. */
export type Art = string | { url: string };

export async function renderSticker(source: Art, options: StickerOptions = {}): Promise<Blob> {
  const size = options.size ?? STICKER_SIZE;
  const stroke = options.stroke ?? (options.border ? 0.022 : 0);
  const border = stroke > 0;
  const ink = options.ink ?? DEFAULT_INK;
  const padding = Math.round(size * paddingFor(stroke));
  const art = size - padding * 2;
  const toUrl = (markup: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(prepareSvg(markup, art, ink))}`;
  const image = await loadImage(typeof source === "string" ? toUrl(source) : source.url);
  const shape = options.silhouette ? await loadImage(toUrl(options.silhouette)) : image;
  // Image files keep their own proportions, centred in the art area.
  const caption = options.caption?.text.trim() ? options.caption : undefined;
  if (caption) await loadCaptionFont(caption);
  // With a caption, the art keeps its shape but gives up the bottom of the frame.
  const artHeight = caption ? Math.round(art * (1 - CAPTION_BAND)) : art;
  const naturalWidth = typeof source === "string" ? art : image.naturalWidth || art;
  const naturalHeight = typeof source === "string" ? art : image.naturalHeight || art;
  const scale = Math.min(art / naturalWidth, artHeight / naturalHeight);
  const width = Math.round(naturalWidth * scale);
  const height = Math.round(naturalHeight * scale);
  const left = Math.round((size - width) / 2);
  const top = Math.round(padding + (artHeight - height) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");

  if (border) {
    // Die-cut outline: stamp the silhouette in a ring, then flood it white.
    const outline = document.createElement("canvas");
    outline.width = size;
    outline.height = size;
    const ring = outline.getContext("2d");
    if (!ring) throw new Error("Canvas is unavailable.");
    // Only solid pixels shape the edge, so soft glows don't balloon into white blobs.
    const mask = document.createElement("canvas");
    mask.width = size;
    mask.height = size;
    const solid = mask.getContext("2d");
    if (!solid) throw new Error("Canvas is unavailable.");
    solid.drawImage(shape, left, top, width, height);
    const pixels = solid.getImageData(0, 0, size, size);
    for (let index = 3; index < pixels.data.length; index += 4) pixels.data[index] = pixels.data[index]! > 170 ? 255 : 0;
    solid.putImageData(pixels, 0, 0);

    // Stamp the shape around circles of decreasing radius: a smooth, even
    // outline at any width, with no gaps between stamps on thick strokes.
    const radius = size * stroke;
    for (const share of [1, 0.66, 0.33]) {
      const r = radius * share;
      const steps = Math.min(72, Math.max(16, Math.ceil((2 * Math.PI * r) / 3)));
      for (let step = 0; step < steps; step += 1) {
        const radians = (step / steps) * Math.PI * 2;
        ring.drawImage(mask, Math.cos(radians) * r, Math.sin(radians) * r);
      }
    }
    ring.globalCompositeOperation = "source-in";
    ring.fillStyle = "#FFFFFF";
    ring.fillRect(0, 0, size, size);

    // No drop shadow: chat apps render stickers on any background, where a baked-in
    // shadow looks like a smudge under the sticker.
    context.drawImage(outline, 0, 0);
  }

  context.drawImage(image, left, top, width, height);
  if (caption) drawCaption(context, caption, size, padding, border);
  return toBlob(canvas, options.type ?? "image/png", options.quality);
}

/** The family next/font registered for a lettering style, read from its CSS variable. */
function captionFamily(font: CaptionFont): string {
  const family = typeof document === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue(font.variable).trim();
  return family || "system-ui, sans-serif";
}

const fontSpec = (font: CaptionFont, size: number) => `${font.style} ${font.weight} ${size}px ${captionFamily(font)}`;

/** Lettering fonts load on demand: make sure the style is ready before drawing with it. */
async function loadCaptionFont(caption: Caption): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.load(fontSpec(captionFontOf(caption.font), 64), caption.text);
  } catch {
    // Drawing falls back to a system face; the sticker is still usable.
  }
}

/** Lettering along the bottom with a contrasting edge, sized to fit the width. */
function drawCaption(context: CanvasRenderingContext2D, caption: Caption, size: number, padding: number, outlined: boolean): void {
  const font = captionFontOf(caption.font);
  const maxWidth = size - padding * 2 - size * 0.04;
  const measure: Measure = (text, fontSize) => {
    context.font = fontSpec(font, fontSize);
    return context.measureText(spacedFor(font, text)).width;
  };
  const layout = fitCaption(measure, caption.text, maxWidth, size * 0.13 * font.scale, size * 0.065 * font.scale);
  if (layout.lines.length === 0) return;
  const lineHeight = layout.size * 1.08;
  // The block sits in the band below the art; outlined stickers keep clear of their edge.
  const bottom = size - padding - (outlined ? size * 0.01 : size * 0.02);
  const edge = captionEdge(caption.color);
  context.font = fontSpec(font, layout.size);
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.lineJoin = "round";
  context.lineWidth = Math.max(2, layout.size * 0.2);
  context.strokeStyle = edge;
  context.fillStyle = caption.color;
  layout.lines.forEach((line, index) => {
    const y = bottom - (layout.lines.length - 1 - index) * lineHeight - layout.size * 0.22;
    context.strokeText(spacedFor(font, line), size / 2, y);
    context.fillText(spacedFor(font, line), size / 2, y);
  });
}

/** True when this browser can put an image on the clipboard. */
export function canCopyImage(): boolean {
  return typeof window !== "undefined" && "ClipboardItem" in window && Boolean(navigator.clipboard?.write);
}

/**
 * Copies a PNG. The ClipboardItem receives a promise so the write starts
 * inside the click (Safari requires that) while rendering finishes.
 */
export async function copyImage(blob: Promise<Blob>): Promise<void> {
  if (!canCopyImage()) throw new Error("Image copy is not supported in this browser.");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

export function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** WhatsApp's limit for a static sticker file. */
export const WHATSAPP_MAX_BYTES = 100 * 1024;

export interface WhatsAppSticker {
  blob: Blob;
  extension: "webp" | "png";
  /** True when the file is 512 px WebP within WhatsApp's size limit. */
  valid: boolean;
}

/**
 * A static WhatsApp sticker: 512 × 512 transparent WebP under 100 KB. Quality
 * steps down until the file fits. Browsers that cannot encode WebP get a PNG,
 * reported as not valid so the UI can say so.
 */
export async function renderForWhatsApp(svg: Art, options: StickerOptions = {}): Promise<WhatsAppSticker> {
  let blob = await renderSticker(svg, { ...options, size: STICKER_SIZE, type: "image/webp", quality: 0.9 });
  if (blob.type !== "image/webp") return { blob, extension: "png", valid: false };
  for (const quality of [0.8, 0.7, 0.6, 0.5, 0.4]) {
    if (blob.size <= WHATSAPP_MAX_BYTES) break;
    blob = await renderSticker(svg, { ...options, size: STICKER_SIZE, type: "image/webp", quality });
  }
  return { blob, extension: "webp", valid: blob.size <= WHATSAPP_MAX_BYTES };
}

/** WebP at any size, or null when this browser cannot encode WebP. */
export async function renderWebp(svg: Art, options: StickerOptions = {}): Promise<Blob | null> {
  const blob = await renderSticker(svg, { ...options, type: "image/webp" });
  return blob.type === "image/webp" ? blob : null;
}

export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([new Blob()], "sticker.png", { type: "image/png" })] });
  } catch {
    return false;
  }
}

/** Opens the system share sheet (WhatsApp, Messages, …) on supporting devices. */
export async function shareSticker(blob: Blob, fileName: string, title: string): Promise<void> {
  const file = new File([blob], fileName, { type: blob.type });
  await navigator.share({ files: [file], title });
}
