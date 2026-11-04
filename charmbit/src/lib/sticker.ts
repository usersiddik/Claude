/**
 * Sticker output: renders an asset's SVG to a transparent bitmap (512×512 by
 * default, the size messaging apps use for stickers) with an optional white
 * die-cut border, then copies, downloads, or shares it. Browser-only.
 */

export interface StickerOptions {
  size?: number;
  border?: boolean;
  /** Colour for currentColor linework (images have no surrounding text colour). */
  ink?: string;
  type?: "image/png" | "image/webp";
}

export const STICKER_SIZE = 512;
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

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the sticker."))), type, 0.9);
  });
}

export async function renderSticker(svg: string, options: StickerOptions = {}): Promise<Blob> {
  const size = options.size ?? STICKER_SIZE;
  const border = options.border ?? true;
  const ink = options.ink ?? DEFAULT_INK;
  // WhatsApp asks for ~16px of margin at 512px; the border lives inside that margin.
  const padding = Math.round(size * (border ? 0.07 : 0.04));
  const art = size - padding * 2;
  const markup = prepareSvg(svg, art, ink);
  const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);

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
    const radius = size * 0.03;
    for (let angle = 0; angle < 360; angle += 12) {
      const radians = (angle * Math.PI) / 180;
      ring.drawImage(image, padding + Math.cos(radians) * radius, padding + Math.sin(radians) * radius, art, art);
    }
    ring.globalCompositeOperation = "source-in";
    ring.fillStyle = "#FFFFFF";
    ring.fillRect(0, 0, size, size);

    context.shadowColor = "rgba(0, 0, 0, 0.18)";
    context.shadowBlur = size * 0.025;
    context.shadowOffsetY = size * 0.008;
    context.drawImage(outline, 0, 0);
    context.shadowColor = "transparent";
  }

  context.drawImage(image, padding, padding, art, art);
  return toBlob(canvas, options.type ?? "image/png");
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

/** WebP when the browser can encode it (WhatsApp's sticker format), PNG otherwise. */
export async function renderForWhatsApp(svg: string, options: StickerOptions = {}): Promise<{ blob: Blob; extension: string }> {
  const blob = await renderSticker(svg, { ...options, type: "image/webp" });
  return blob.type === "image/webp" ? { blob, extension: "webp" } : { blob, extension: "png" };
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
