import Link from "next/link";
import { AssetArt } from "@/components/ui/AssetArt";
import { CheckIcon } from "@/components/ui/icons";
import type { Asset } from "@/lib/assets/types";
import { primaryFill } from "@/lib/customize";
import { buildExport, FORMATS } from "@/lib/exports";
import { FillInkDemo } from "./FillInkDemo";
import styles from "./Bento.module.css";

const DUO_SETS = ["Friends", "Couples", "Celebrations", "Inside jokes"];

const CARE = [
  { title: "Clean vector source", body: "Each asset is a small SVG on a 96- or 24-unit grid. No raster images, no embedded fonts." },
  { title: "Not an image generator", body: "Charmbit is a curated library of authored artwork. Nothing is generated on request." },
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
  const duos = assets.filter((asset) => asset.family === "duo");
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
              <h3 className={styles.cardTitle}>One source. Three outputs.</h3>
              <p className={styles.body}>
                Every format is generated from the same SVG file, so they never drift. React needs only React. Flutter
                uses flutter_svg.
              </p>
            </div>
            <div className={styles.flow}>
              <div className={styles.source}>
                <AssetArt asset={mochi} label="Mochi source SVG" className={styles.sourceArt} />
                <code>{FORMATS[0]!.fileName(mochi)}</code>
              </div>
              <svg className={styles.wires} viewBox="0 0 60 120" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 60 C30 60 30 12 60 12M0 60 H60M0 60 C30 60 30 108 60 108" />
              </svg>
              <ul role="list" className={styles.outputs}>
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

          <article id="duos" className={`${styles.card} ${styles.half} ${styles.duos}`}>
            <div className={styles.copy}>
              <p className={styles.kicker}>
                <span className={styles.soon}>Coming soon</span>
              </p>
              <h3 className={styles.cardTitle}>Duos. Better together.</h3>
              <p className={styles.body}>
                Matching pairs for shared moments. Every set is designed to be all-ages.
              </p>
            </div>
            <ul role="list" className={styles.duoArt}>
              {duos.map((duo) => (
                <li key={duo.id}>
                  <AssetArt asset={duo} label={`${duo.title}, Duo preview`} className={styles.duoImage} />
                  <span>{duo.title}</span>
                </li>
              ))}
            </ul>
            <div className={styles.duoFooter}>
              <ul role="list" className={styles.tags}>
                {DUO_SETS.map((set) => (
                  <li key={set}>{set}</li>
                ))}
              </ul>
              <Link href="/?filter=duos#library" className={styles.link}>
                Preview Duos <span aria-hidden="true">›</span>
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
