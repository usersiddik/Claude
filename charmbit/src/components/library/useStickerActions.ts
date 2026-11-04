"use client";

import { useState, useSyncExternalStore } from "react";
import type { ExportFormat } from "@/lib/assets/types";
import { silhouetteOf } from "@/lib/art/kit";
import { copyText } from "@/lib/clipboard";
import { announceCopy } from "@/lib/copy-events";
import { canShareFiles, copyImage, download, renderForWhatsApp, renderSticker, shareSticker } from "@/lib/sticker";

const subscribeNothing = () => () => {};

interface Sticker {
  svg: string;
  title: string;
  slug: string;
  code: (format: ExportFormat) => string;
}

export type CopyState = "idle" | "done" | "error";

/** Copy, download, share, and code export for one sticker, with feedback. */
export function useStickerActions({ svg, title, slug, code }: Sticker, edge: boolean, onCopied?: () => void) {
  const [state, setState] = useState<CopyState>("idle");
  const [pulse, setPulse] = useState(0);
  const shareable = useSyncExternalStore(subscribeNothing, canShareFiles, () => false);
  const options = { border: edge, silhouette: silhouetteOf(svg) };
  const notify = (format: string, ok: boolean, verb?: "Copied" | "Saved") => announceCopy({ title, format, svg, ink: null, ok, verb });
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
      const blob = renderSticker(svg, { ...options, size: 512 });
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
        download(await renderSticker(svg, { ...options, size }), `${slug}-${size}.png`);
        notify(`${size}px PNG`, true, "Saved");
      } catch {
        notify("PNG", false);
      }
    },
    async whatsapp() {
      try {
        const { blob, extension } = await renderForWhatsApp(svg, options);
        download(blob, `${slug}-sticker.${extension}`);
        notify(extension === "webp" ? "WhatsApp WebP" : "PNG", true, "Saved");
      } catch {
        notify("WebP", false);
      }
    },
    svgFile() {
      download(new Blob([code("svg")], { type: "image/svg+xml" }), `${slug}.svg`);
      notify("SVG", true, "Saved");
    },
    async code(format: ExportFormat, label: string) {
      try {
        await copyText(code(format));
        notify(label, true);
      } catch {
        notify(label, false);
      }
    },
    async share() {
      try {
        await shareSticker(await renderSticker(svg, { ...options, size: 512 }), `${slug}.png`, title);
      } catch {
        // Closing the share sheet rejects; nothing to report.
      }
    },
  };
}
