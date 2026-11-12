import type { CSSProperties } from "react";
import { stickerSrc, stickerTitle, type LiveCollection, type StickerItem } from "@/lib/universe";
import styles from "./Statement.module.css";

const STEPS = [
  { n: "01", title: "Pick a character", text: "Browse the cast, or search for a feeling: hug, chai, sorry." },
  { n: "02", title: "Make it yours", text: "Change the colours, add your own words, choose an outline." },
  { n: "03", title: "Paste it anywhere", text: "Copy it straight into WhatsApp, or download PNG, WebP or SVG." },
] as const;

/** Polaroids around the statement: [left %, top %, tilt]. */
const SPOTS = [
  [6, 16, -8],
  [80, 10, 7],
  [84, 58, -5],
] as const;

/** One big line, three steps, a few polaroids. */
export function Statement({ collections }: { collections: readonly LiveCollection[] }) {
  // One sticker from each character with artwork, for the polaroids.
  const shots = collections
    .filter((collection) => collection.media === "image")
    .flatMap((collection) => {
      const item = collection.items.filter((candidate) => !candidate.image?.pending)[3] ?? collection.items.find((candidate) => !candidate.image?.pending);
      return item ? [{ collection, item }] : [];
    })
    .concat(collections.filter((collection) => collection.media !== "image").slice(0, 1).map((collection) => ({ collection, item: collection.items[0]! as StickerItem })))
    .slice(0, SPOTS.length);

  return (
    <section className={`grain grainNight ${styles.section}`} aria-labelledby="statement-title">
      {shots.map(({ collection, item }, index) => {
        const [left, top, tilt] = SPOTS[index]!;
        return (
          <figure key={`${collection.id}/${item.id}`} className={styles.polaroid} style={{ "--l": `${left}%`, "--t": `${top}%`, "--r": `${tilt}deg`, "--i": index } as CSSProperties} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
            <img src={stickerSrc(collection, item)} alt="" width={200} height={200} loading="lazy" decoding="async" />
            <figcaption className="mono">{stickerTitle(collection, item)}</figcaption>
          </figure>
        );
      })}

      <div className={`container ${styles.inner}`}>
        <span className={styles.quote} aria-hidden="true">
          “”
        </span>
        <h2 id="statement-title" className={`display ${styles.title}`} data-reveal="">
          Say it with
          <br />a sticker that
          <br />
          looks like you.
        </h2>
        <p className={styles.lede} data-reveal="" style={{ "--i": 1 } as CSSProperties}>
          Every sticker here is original artwork, and every one can carry your words.
        </p>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.n} className={styles.step} data-reveal="" style={{ "--i": index + 2 } as CSSProperties}>
              <span className={`mono ${styles.n}`}>{step.n}</span>
              <span className={styles.stepTitle}>{step.title}</span>
              <span className={styles.stepText}>{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
