import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { BRAND } from "@/lib/brand";
import { SITE } from "@/lib/site";
import styles from "./SiteFooter.module.css";

const FORMATS = [
  { name: "Sticker", detail: "Copy a transparent PNG. Paste into WhatsApp, iMessage, Telegram, Slack." },
  { name: "WhatsApp", detail: "512 px WebP under 100 KB, ready for sticker packs." },
  { name: "PNG", detail: "512 or 1024 px, transparent, optional white outline." },
  { name: "SVG", detail: "Clean vector markup with a title. Scales to billboards." },
  { name: "React", detail: "A typed TSX component, no packages to install." },
  { name: "Flutter", detail: "A flutter_svg widget, filter-free so it renders everywhere." },
  { name: "GIF", detail: "Animated stickers. Coming soon.", soon: true },
] as const;

/** Chapter 04: formats, then the sign-off. Always dark, like the back cover. */
export function SiteFooter() {
  return (
    <footer id="formats" className={styles.footer}>
      <div className="container">
        <p className={`eyebrow ${styles.eyebrow}`}>
          <span>Chapter 04 — Formats</span>
          <span>Free to use in chats and products</span>
        </p>
        <h2 className={`display ${styles.title}`} data-reveal="">
          Copy. Paste.
          <br />
          Anywhere.
        </h2>
        <ul role="list" className={styles.formats}>
          {FORMATS.map((format, index) => (
            <li key={format.name} className={styles.format} data-reveal="" data-soon={"soon" in format ? "" : undefined} style={{ "--i": index } as React.CSSProperties}>
              <span className={styles.formatName}>{format.name}</span>
              <span className={styles.formatDetail}>{format.detail}</span>
            </li>
          ))}
        </ul>
        <div className={styles.bottom}>
          <a href="#top" className={styles.brand} aria-label={`${BRAND.name}, back to top`}>
            <Wordmark />
          </a>
          <p className={styles.tagline}>{SITE.tagline}</p>
          <p className={styles.small}>
            Original artwork. © {new Date().getFullYear()} {BRAND.name}. <Link href="/privacy">Privacy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
