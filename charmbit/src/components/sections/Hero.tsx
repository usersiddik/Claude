import Link from "next/link";
import { Studio } from "@/components/studio/Studio";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>
          <span className={styles.new}>New</span> Sticker Studio, now with couples
        </p>
        <h1 id="hero-title" className={styles.title}>
          Tiny charms.
          <br />
          Serious code.
        </h1>
        <p className={styles.lede}>
          Design your own sticker cat: pick a mood, any colour, and a glass finish. Send it to the people you love, or
          ship it in your app.
        </p>
        <div className={styles.ctas}>
          <Link href="#studio" className={styles.primary}>
            Start creating
          </Link>
          <Link href="#library" className={styles.secondary}>
            Browse the library <span aria-hidden="true">›</span>
          </Link>
        </div>
        <Studio />
      </div>
    </section>
  );
}
