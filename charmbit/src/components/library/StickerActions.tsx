"use client";

import { CheckIcon, CodeIcon, CopyIcon, DownloadIcon, ShareIcon } from "@/components/ui/icons";
import { Popover } from "@/components/ui/Popover";
import type { ExportFormat } from "@/lib/assets/types";
import { useStickerActions } from "./useStickerActions";
import styles from "./Library.module.css";

interface StickerActionsProps {
  svg: string;
  title: string;
  slug: string;
  code: (format: ExportFormat) => string;
  /** Outline width as a share of the sticker size (0 = none). */
  stroke: number;
  /** Called after a successful copy, e.g. to play a little animation. */
  onCopied?: () => void;
}

/** Copy, download, code, and share for one sticker. Used by the library editor. */
export function StickerActions({ svg, title, slug, code, stroke, onCopied }: StickerActionsProps) {
  const actions = useStickerActions({ svg, title, slug, code }, stroke, onCopied);

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.copy} data-state={actions.state} onClick={actions.copy}>
        <span className={styles.copyIdle}>
          <CopyIcon size={18} />
          Copy sticker
        </span>
        <span className={styles.copyDone} aria-hidden={actions.state !== "done"}>
          <CheckIcon size={18} />
          Copied
        </span>
      </button>
      <div className={styles.secondaryActions}>
        <Popover label="Download" align="start" trigger={<><DownloadIcon size={16} /> Download</>}>
          <div className={styles.menu}>
            <button type="button" data-dismiss onClick={() => actions.png(512)}>
              PNG <span>512 px · transparent</span>
            </button>
            <button type="button" data-dismiss onClick={() => actions.png(1024)}>
              PNG, large <span>1024 px · transparent</span>
            </button>
            <button type="button" data-dismiss onClick={actions.whatsapp}>
              WhatsApp sticker <span>512 px WebP, under 100 KB</span>
            </button>
            <button type="button" data-dismiss onClick={actions.svgFile}>
              SVG <span>vector, any size</span>
            </button>
          </div>
        </Popover>
        <Popover label="Copy code" align="end" trigger={<><CodeIcon size={16} /> Code</>}>
          <div className={styles.menu}>
            <button type="button" data-dismiss onClick={() => actions.code("svg", "SVG code")}>
              SVG <span>inline markup</span>
            </button>
            <button type="button" data-dismiss onClick={() => actions.code("react", "React")}>
              React <span>typed TSX component</span>
            </button>
            <button type="button" data-dismiss onClick={() => actions.code("flutter", "Flutter")}>
              Flutter <span>flutter_svg widget</span>
            </button>
          </div>
        </Popover>
        {actions.shareable ? (
          <button type="button" className={styles.iconAction} onClick={actions.share} aria-label="Share">
            <ShareIcon size={16} />
          </button>
        ) : null}
      </div>
      <p className={styles.hint}>Paste into WhatsApp, iMessage, Telegram, or Slack. GIF export is coming next.</p>
    </div>
  );
}
