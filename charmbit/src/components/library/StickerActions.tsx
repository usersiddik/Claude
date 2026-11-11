"use client";

import { CheckIcon, CodeIcon, CopyIcon, DownloadIcon, ShareIcon } from "@/components/ui/icons";
import { Popover } from "@/components/ui/Popover";
import type { ExportFormat } from "@/lib/assets/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStickerActions } from "./useStickerActions";
import styles from "./Library.module.css";

interface StickerActionsProps {
  svg: string;
  /** File URL for image stickers, which have no SVG or code exports. */
  image?: string;
  /** GIFs are downloaded or shared as the original file. */
  animated?: boolean;
  title: string;
  slug: string;
  code?: (format: ExportFormat) => string;
  /** Outline width as a share of the sticker size (0 = none). */
  stroke: number;
  /** Called after a successful copy, e.g. to play a little animation. */
  onCopied?: () => void;
}

/** Copy, download, code, and share for one sticker. Used by the library editor. */
export function StickerActions({ svg, image, animated, title, slug, code, stroke, onCopied }: StickerActionsProps) {
  const actions = useStickerActions({ svg, image, title, slug, code }, stroke, onCopied);
  // Browsing and customising are open to all; taking a sticker away needs a sign-in.
  const { locked, requireSignIn } = useAuth();
  const gate =
    <A extends unknown[]>(run: (...args: A) => unknown) =>
    (...args: A) => {
      if (locked) requireSignIn();
      else void run(...args);
    };

  if (animated) {
    return (
      <div className={styles.actions}>
        <button type="button" className={styles.copy} data-state={actions.state} onClick={gate(actions.gif)}>
          <span className={styles.copyIdle}>
            <DownloadIcon size={18} />
            Download GIF
          </span>
          <span className={styles.copyDone} aria-hidden={actions.state !== "done"}>
            <CheckIcon size={18} />
            Saved
          </span>
        </button>
        {actions.shareable ? (
          <div className={styles.secondaryActions}>
            <button type="button" className={styles.shareWide} onClick={gate(actions.shareGif)}>
              <ShareIcon size={16} /> Share
            </button>
          </div>
        ) : null}
        <p className={styles.hint}>Download the GIF, then attach it in WhatsApp, Telegram or any chat. Browsers can&rsquo;t copy a moving image to the clipboard.</p>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.copy} data-state={actions.state} onClick={gate(actions.copy)}>
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
            <p className={styles.menuLabel}>Image</p>
            <div className={styles.menuRow}>
              <span>PNG</span>
              {[256, 512, 1024].map((size) => (
                <button key={size} type="button" data-dismiss aria-label={`PNG, ${size} pixels`} onClick={gate(() => actions.png(size))}>
                  {size}
                </button>
              ))}
            </div>
            <div className={styles.menuRow}>
              <span>WebP</span>
              {[256, 512, 1024].map((size) => (
                <button key={size} type="button" data-dismiss aria-label={`WebP, ${size} pixels`} onClick={gate(() => actions.webp(size))}>
                  {size}
                </button>
              ))}
            </div>
            {code ? (
              <button type="button" data-dismiss onClick={gate(actions.svgFile)}>
                SVG <span>vector, any size</span>
              </button>
            ) : null}
            <p className={styles.menuLabel}>Messaging</p>
            <button type="button" data-dismiss onClick={gate(actions.whatsapp)}>
              WhatsApp sticker <span>512 px WebP, under 100 KB</span>
            </button>
            <button type="button" data-dismiss onClick={gate(actions.telegram)}>
              Telegram sticker <span>512 px PNG</span>
            </button>
          </div>
        </Popover>
        {code ? (
        <Popover label="Copy code" align="end" trigger={<><CodeIcon size={16} /> Code</>}>
          <div className={styles.menu}>
            <button type="button" data-dismiss onClick={gate(() => actions.code("svg", "SVG code"))}>
              SVG <span>inline markup</span>
            </button>
            <button type="button" data-dismiss onClick={gate(() => actions.code("react", "React"))}>
              React <span>typed TSX component</span>
            </button>
            <button type="button" data-dismiss onClick={gate(() => actions.code("flutter", "Flutter"))}>
              Flutter <span>flutter_svg widget</span>
            </button>
          </div>
        </Popover>
        ) : null}
        {actions.shareable ? (
          <button type="button" className={styles.iconAction} onClick={gate(actions.share)} aria-label="Share">
            <ShareIcon size={16} />
          </button>
        ) : null}
      </div>
      <p className={styles.hint}>
        Copy, then paste into WhatsApp, iMessage, Telegram or Slack. <a href="/developers#messaging">Adding it to a sticker pack?</a>
      </p>
    </div>
  );
}
