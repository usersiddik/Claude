import type { CSSProperties } from "react";
import { stickerThumb, stickerTitle, type LiveCollection, type StickerItem } from "@/lib/universe";
import styles from "./Statement.module.css";

const STEPS = [
  { n: "01", title: "Pick a character", text: "Browse the cast, or search for a feeling: hug, chai, sorry." },
  { n: "02", title: "Make it yours", text: "Change the colours, add your own words, choose an outline." },
  { n: "03", title: "Paste it anywhere", text: "Copy it straight into WhatsApp, or download PNG, WebP or SVG." },
] as const;

/**
 * Where each polaroid comes to rest on wide screens, as [left %, top %, tilt °,
 * depth, spin °]. They sweep in from their own side as the section scrolls in;
 * depth sets how far each travels and how fast it drifts afterwards.
 */
const SPOTS = [
  [3, 7, -9, 1.2, -34],
  [11, 40, 6, 0.7, 26],
  [84, 4, 8, 0.9, 30],
  [78, 37, -5, 1.3, -22],
  [2, 70, 5, 0.5, -18],
  [87, 68, -7, 0.8, 20],
] as const;

type Shot = { collection: LiveCollection; item: StickerItem };

/** Spread the picks across every character with finished artwork. */
function pickShots(collections: readonly LiveCollection[], count: number): Shot[] {
  const pools = collections
    .filter((collection) => collection.media === "image")
    .map((collection) => ({ collection, items: collection.items.filter((item) => !item.image?.pending) }))
    .filter((pool) => pool.items.length > 0);
  const shots: Shot[] = [];
  for (let round = 0; shots.length < count && round < count; round++) {
    for (const pool of pools) {
      const item = pool.items[(3 + round * 7) % pool.items.length]!;
      if (shots.length < count && !shots.some((shot) => shot.item === item)) shots.push({ collection: pool.collection, item });
    }
  }
  return shots;
}

function Polaroid({ shot, className, style }: { shot: Shot; className?: string; style: CSSProperties }) {
  return (
    <figure className={className} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
      <img src={stickerThumb(shot.collection, shot.item)} alt="" width={200} height={200} loading="lazy" decoding="async" draggable={false} />
      <figcaption className="mono">{stickerTitle(shot.collection, shot.item)}</figcaption>
    </figure>
  );
}

/** One big line, three steps, and polaroids that sweep in on scroll. */
export function Statement({ collections }: { collections: readonly LiveCollection[] }) {
  const shots = pickShots(collections, SPOTS.length);
  const fan = shots.slice(0, 5);

  return (
    <section className={`grain grainNight ${styles.section}`} aria-labelledby="statement-title" data-scene="0.95 0.05">
      <div className={styles.scatter} aria-hidden="true">
        {shots.map((shot, index) => {
          const [x, y, tilt, depth, spin] = SPOTS[index]!;
          return <Polaroid key={`${shot.collection.id}/${shot.item.id}`} shot={shot} className={styles.polaroid} style={{ "--x": x, "--y": y, "--r": tilt, "--d": depth, "--spin": spin, "--side": x < 50 ? -1 : 1 } as CSSProperties} />;
        })}
      </div>

      <div className={`container ${styles.inner}`}>
        <span className={styles.quote} aria-hidden="true">
          “”
        </span>
        <h2 id="statement-title" className={`display ${styles.title}`} data-reveal="">
          Say it with
          <br />a sticker that
          <br />
          <em>looks like you.</em>
        </h2>
        <p className={styles.lede} data-reveal="" style={{ "--i": 1 } as CSSProperties}>
          Every sticker here is original artwork, and every one can carry your words.
        </p>

        {/* Phones and tablets: the same cards, fanned out from a stack. */}
        <div className={styles.fan} aria-hidden="true" data-scene="0.95 0.45">
          {fan.map((shot, index) => (
            <Polaroid key={`${shot.collection.id}/${shot.item.id}`} shot={shot} className={styles.fanCard} style={{ "--k": index - (fan.length - 1) / 2 } as CSSProperties} />
          ))}
        </div>

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
