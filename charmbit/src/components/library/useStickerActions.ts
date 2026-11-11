"use client";

import { useState, useSyncExternalStore } from "react";
import type { ExportFormat } from "@/lib/assets/types";
import { silhouetteOf } from "@/lib/art/kit";
import { copyText } from "@/lib/clipboard";
import { announceCopy } from "@/lib/copy-events";
import { canShareFiles, copyImage, download, renderForWhatsApp, renderSticker, renderWebp, shareSticker, type Art } from "@/lib/sticker";

const subscribeNothing = () => () => {};

interface Sticker {
  /** SVG markup for drawn stickers. Empty for image stickers. */
  svg: string;
  /** File URL for image stickers. */
  image?: string;
  title: string;
  slug: string;
  /** Code exports; drawn stickers only. */
  code?: (format: ExportFormat) => string;
}

export type CopyState = "idle" | "done" | "error";

/** Copy, download, share, and code export for one sticker, with feedback. */
export function useStickerActions({ svg, image, title, slug, code }: Sticker, stroke: number, onCopied?: () => void) {
  const [state, setState] = useState<CopyState>("idle");
  const [pulse, setPulse] = useState(0);
  const shareable = useSyncExternalStore(subscribeNothing, canShareFiles, () => false);
  const art: Art = image ? { url: image } : svg;
  const options = image ? { stroke } : { stroke, silhouette: silhouetteOf(svg) };
  const notify = (format: string, ok: boolean, verb?: "Copied" | "Saved") => announceCopy({ title, format, svg, image, ink: null, ok, verb });
  const flash = (next: CopyState) => {
    setState(next);
    if (next === "done") {
      setPulse((value) => value + 1);
      onCopied?.();
    }
    window.setTimeout(() => setState("idle"), 1600);
  };

  return {
    state,
    pulse,
    shareable,
    async copy() {
      const blob = renderSticker(art, { ...options, size: 512 });
      try {
        await copyImage(blob);
        notify("Sticker", true);
        flash("done");
      } catch {
        try {
          download(await blob, `${slug}.png`);
          notify("PNG", true, "Saved");
          flash("done");
        } catch {
          notify("Sticker", false);
          flash("error");
        }
      }
    },
    async png(size: number) {
      try {
        download(await renderSticker(art, { ...options, size }), `${slug}-${size}.png`);
        notify(`${size}px PNG`, true, "Saved");
      } catch {
        notify("PNG", false);
      }
    },
    async whatsapp() {
      try {
        const { blob, extension, valid } = await renderForWhatsApp(art, options);
        download(blob, `${slug}-whatsapp.${extension}`);
        // Say what was actually saved: a PNG is not a WhatsApp sticker file.
        notify(valid ? "WhatsApp WebP" : extension === "webp" ? "WebP (over 100 KB)" : "PNG (no WebP here)", true, "Saved");
      } catch {
        notify("WhatsApp sticker", false);
      }
    },
    async webp(size: number) {
      try {
        const blob = await renderWebp(art, { ...options, size });
        if (!blob) {
          notify("WebP (not supported in this browser)", false);
          return;
        }
        download(blob, `${slug}-${size}.webp`);
        notify(`${size}px WebP`, true, "Saved");
      } catch {
        notify("WebP", false);
      }
    },
    /** Telegram static stickers: 512 px on a side, PNG with transparency. */
    async telegram() {
      try {
        download(await renderSticker(art, { ...options, size: 512 }), `${slug}-telegram.png`);
        notify("Telegram PNG", true, "Saved");
      } catch {
        notify("Telegram sticker", false);
      }
    },
    svgFile() {
      if (!code) return;
      try {
        download(new Blob([code("svg")], { type: "image/svg+xml" }), `${slug}.svg`);
        notify("SVG", true, "Saved");
      } catch {
        notify("SVG", false);
      }
    },
    async code(format: ExportFormat, label: string) {
      if (!code) return;
      try {
        await copyText(code(format));
        notify(label, true);
      } catch {
        notify(label, false);
      }
    },
    /** GIFs: save the original file, untouched. */
    async gif() {
      if (!image) return;
      try {
        const response = await fetch(image);
        if (!response.ok) throw new Error("Could not load the GIF.");
        download(await response.blob(), `${slug}.gif`);
        notify("GIF", true, "Saved");
        flash("done");
      } catch {
        notify("GIF", false);
        flash("error");
      }
    },
    async shareGif() {
      if (!image) return;
      try {
        const response = await fetch(image);
        await shareSticker(new Blob([await response.blob()], { type: "image/gif" }), `${slug}.gif`, title);
      } catch {
        // Closing the share sheet rejects; nothing to report.
      }
    },
    async share() {
      try {
        await shareSticker(await renderSticker(art, { ...options, size: 512 }), `${slug}.png`, title);
      } catch {
        // Closing the share sheet rejects; nothing to report.
      }
    },
  };
}
