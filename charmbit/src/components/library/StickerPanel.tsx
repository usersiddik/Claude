"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CopyIcon, DownloadIcon, ShareIcon } from "@/components/ui/icons";
import type { Asset } from "@/lib/assets/types";
import { announceCopy } from "@/lib/copy-events";
import { canShareFiles, download, renderForWhatsApp, renderSticker, shareSticker, STICKER_SIZE } from "@/lib/sticker";
import styles from "./StickerPanel.module.css";

const subscribeNothing = () => () => {};

interface StickerPanelProps {
  asset: Asset;
  svg: string;
  ink: string | null;
  border: boolean;
  onBorderChange: (border: boolean) => void;
  onCopy: () => void;
}

/** Sticker output: real rendered preview plus copy, download, and share. */
export function StickerPanel({ asset, svg, ink, border, onBorderChange, onCopy }: StickerPanelProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const shareable = useSyncExternalStore(subscribeNothing, canShareFiles, () => false);
  const options = { border, ink: ink ?? undefined };

  useEffect(() => {
    let alive = true;
    let url: string | null = null;
    renderSticker(svg, { border, ink: ink ?? undefined })
      .then((blob) => {
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setPreview(url);
      })
      .catch(() => {
        if (alive) setPreview(null);
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [svg, border, ink]);

  const notice = (format: string, ok: boolean) =>
    announceCopy({ title: asset.title, format, svg, ink, ok, verb: "Saved" });

  async function savePng() {
    try {
      download(await renderSticker(svg, options), `${asset.slug}.png`);
      notice("PNG", true);
    } catch {
      notice("PNG", false);
    }
  }

  async function saveWhatsApp() {
    try {
      const { blob, extension } = await renderForWhatsApp(svg, options);
      download(blob, `${asset.slug}-sticker.${extension}`);
      notice(extension === "webp" ? "WebP" : "PNG", true);
    } catch {
      notice("WebP", false);
    }
  }

  async function share() {
    try {
      await shareSticker(await renderSticker(svg, options), `${asset.slug}.png`, asset.title);
    } catch {
      // Dismissing the share sheet rejects; nothing to report.
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.preview}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local blob URL, not an optimisable asset
          <img src={preview} alt={`${asset.title} sticker preview`} width={STICKER_SIZE} height={STICKER_SIZE} className={styles.image} />
        ) : (
          <span className={styles.placeholder} aria-hidden="true" />
        )}
        <span className={styles.meta}>
          {STICKER_SIZE} × {STICKER_SIZE} · transparent
        </span>
      </div>

      <label className={styles.toggle}>
        <span>
          <strong>White outline</strong>
          <span>Optional die-cut edge. Off keeps the sticker clean in chats.</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={border}
          onChange={(event) => onBorderChange(event.target.checked)}
          className={styles.switch}
        />
      </label>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onCopy}>
          <CopyIcon size={16} />
          Copy sticker
        </button>
        <button type="button" className={styles.secondary} onClick={savePng}>
          <DownloadIcon size={16} />
          PNG
        </button>
        <button type="button" className={styles.secondary} onClick={saveWhatsApp}>
          <DownloadIcon size={16} />
          WhatsApp WebP
        </button>
        {shareable ? (
          <button type="button" className={styles.secondary} onClick={share}>
            <ShareIcon size={16} />
            Share
          </button>
        ) : null}
      </div>

      <p className={styles.help}>
        Paste it straight into WhatsApp, iMessage, Telegram, or Slack. The WebP is 512 × 512 with a transparent
        background, ready for sticker-maker apps.
      </p>
    </div>
  );
}
