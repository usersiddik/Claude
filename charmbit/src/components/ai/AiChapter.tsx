import { AiStudio } from "./AiStudio";
import styles from "./AiChapter.module.css";

/** Chapter 02: the AI sticker maker. */
export function AiChapter() {
  return (
    <section id="make" className={styles.section} aria-labelledby="make-title">
      <div className="container">
        <p className="eyebrow">
          <span>Chapter 02 — Make one with AI</span>
          <span>Designed with Claude</span>
        </p>
        <div className={styles.head}>
          <h2 id="make-title" className={`display ${styles.title}`} data-reveal="">
            Describe it.
            <br />
            We&rsquo;ll draw it.
          </h2>
          <p className={styles.lede} data-reveal="" style={{ "--i": 2 } as React.CSSProperties}>
            Tell the sticker AI the feeling, who it&rsquo;s for, and the words you want. It designs three stickers from the Charmbit cast, letters names and wishes by hand, and changes anything you ask.
          </p>
        </div>
        <AiStudio />
      </div>
    </section>
  );
}
