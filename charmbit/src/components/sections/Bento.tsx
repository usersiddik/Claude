import Link from "next/link";
import { AssetArt } from "@/components/ui/AssetArt";
import { CheckIcon } from "@/components/ui/icons";
import type { Asset } from "@/lib/assets/types";
import { drawSticker } from "@/lib/characters/draw";
import { DEFAULT_SPEC } from "@/lib/characters/options";
import { primaryFill } from "@/lib/customize";
import { buildExport, FORMATS } from "@/lib/exports";
import { FillInkDemo } from "./FillInkDemo";
import styles from "./Bento.module.css";

const COUPLE_TAGS = ["Hug", "Head on shoulder", "Cheek to cheek", "Diwali couples", "Matching outfits"];

const CARE = [
  { title: "Clean vector source", body: "Each asset is a small SVG on a 96- or 24-unit grid. No raster images, no embedded fonts." },
  { title: "Not an AI image generator", body: "Every sticker is drawn from authored vector parts, so colours and moods change instantly and stay crisp." },
  { title: "Customizable after copy", body: "React and Flutter outputs take size and color props; fills are plain hex values." },
  { title: "License: preview", body: "Terms haven’t been published yet. Check back before shipping in a product." },
];

/** First few meaningful lines of each real export, for the "one source" diagram. */
function excerpt(code: string, startsWith: string, lines = 4): string {
  const all = code.split("\n");
  const start = Math.max(0, all.findIndex((line) => line.trimStart().startsWith(startsWith)));
  return all.slice(start, start + lines).join("\n");
}

export function Bento({ assets }: { assets: readonly Asset[] }) {
  const mochi = assets.find((asset) => asset.slug === "mochi") ?? assets[0];
  const couples = [
    { label: "Head on shoulder", svg: drawSticker({ ...DEFAULT_SPEC, reaction: "shoulder", look: { fur: "#F1DCC0", eyes: "#C27A22" }, partner: { fur: "#5A5B66", eyes: "#2E9E6A" } }) },
    { label: "Diya for two", svg: drawSticker({ ...DEFAULT_SPEC, reaction: "diwali-diya" }) },
  ];
  if (!mochi) return null;

  const outputs = FORMATS.map((format) => {
    const code = buildExport(mochi, format.id);
    const start = format.id === "svg" ? "<svg" : format.id === "react" ? "export function" : "class ";
    return { id: format.id, label: format.label, file: format.fileName(mochi), code: excerpt(code, start) };
  });

  return (
    <section id="features" className={styles.section} aria-labelledby="features-title">
      <div className="container">
        <header className={styles.header}>
          <h2 id="features-title" className={styles.title}>
            Small assets.
            <br />
            Considered details.
          </h2>
        </header>

        <div className={styles.bento}>
          <article className={`${styles.card} ${styles.wide}`}>
            <div className={styles.copy}>
              <p className={styles.kicker}>Zero setup</p>
              <h3 className={styles.cardTitle}>One source. Every format.</h3>
              <p className={styles.body}>
                Stickers for chats, code for products. Everything is generated from the same SVG file, so it never
                drifts. React needs only React; Flutter uses flutter_svg.
              </p>
            </div>
            <div className={styles.flow}>
              <div className={styles.source}>
                <AssetArt asset={mochi} label="Mochi source SVG" className={styles.sourceArt} />
                <code>{FORMATS[0]!.fileName(mochi)}</code>
              </div>
              <svg className={styles.wires} viewBox="0 0 60 120" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 60C30 60 30 14 60 14M0 60C30 60 30 46 60 46M0 60C30 60 30 76 60 76M0 60C30 60 30 106 60 106" />
              </svg>
              <ul role="list" className={styles.outputs}>
                <li className={`${styles.output} ${styles.stickerOut}`}>
                  <AssetArt asset={mochi} className={styles.stickerArt} />
                  <span className={styles.stickerText}>
                    <strong>Sticker</strong>
                    <span>512 × 512 transparent PNG with a die-cut edge. Paste into any chat.</span>
                  </span>
                </li>
                {outputs.map((output) => (
                  <li key={output.id} className={styles.output}>
                    <span className={styles.outputHead}>
                      <span>{output.label}</span>
                      <code>{output.file}</code>
                    </span>
                    <pre aria-label={`${output.label} excerpt`}>
                      <code>{output.code}</code>
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={`${styles.card} ${styles.narrow}`}>
            <div className={styles.copy}>
              <p className={styles.kicker}>Dual-layer color</p>
              <h3 className={styles.cardTitle}>Fill and Ink, independently.</h3>
              <p className={styles.body}>Color sets the main shape. Ink sets the linework. Try it.</p>
            </div>
            <FillInkDemo svg={mochi.sourceSvg} primary={primaryFill(mochi)} />
          </article>

          <article id="couples" className={`${styles.card} ${styles.half} ${styles.duos}`}>
            <div className={styles.copy}>
              <p className={styles.kicker}>
                <span className={styles.soon}>New</span>
              </p>
              <h3 className={styles.cardTitle}>Couples. Better together.</h3>
              <p className={styles.body}>Two cats, your two colours, one shared moment, including Diwali scenes with matching outfits.</p>
            </div>
            <ul role="list" className={styles.duoArt}>
              {couples.map((couple) => (
                <li key={couple.label}>
                  <AssetArt asset={{ sourceSvg: couple.svg }} label={`Couple sticker: ${couple.label}`} className={styles.duoImage} />
                  <span>{couple.label}</span>
                </li>
              ))}
            </ul>
            <div className={styles.duoFooter}>
              <ul role="list" className={styles.tags}>
                {COUPLE_TAGS.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <Link href="#studio" className={styles.link}>
                Make yours <span aria-hidden="true">›</span>
              </Link>
            </div>
          </article>

          <article id="about" className={`${styles.card} ${styles.half}`}>
            <div className={styles.copy}>
              <p className={styles.kicker}>Made with care</p>
              <h3 className={styles.cardTitle}>What you should know.</h3>
            </div>
            <ul role="list" className={styles.care}>
              {CARE.map((item) => (
                <li key={item.title}>
                  <span className={styles.check} aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
