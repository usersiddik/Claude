import { SectionHeading } from "@/components/ui/SectionHeading";
import { FORMATS } from "@/lib/exports";
import styles from "./Sections.module.css";

const STEPS = [
  { title: "Find", body: "Search by name or mood, or filter to Charms, Marks, and Reactions." },
  { title: "Color", body: "Choose a fill and an ink color. Every preview updates instantly." },
  { title: "Copy", body: "Pick SVG, React, or Flutter, then click an asset. It’s on your clipboard." },
];

export function HowItWorks() {
  return (
    <section id="how" className={styles.section} aria-labelledby="how-title">
      <div className="container">
        <div className={styles.headingGap}>
          <SectionHeading
            id="how-title"
            eyebrow="How it works"
            title="Three steps. No setup."
            lede="No account, no API key, and no package to install for SVG or React."
          />
        </div>
        <ol role="list" className={styles.columns}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={styles.column}>
              <span className={styles.step} aria-hidden="true">
                {index + 1}
              </span>
              <h3 className={styles.columnTitle}>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <h3 className={styles.subTitle}>Formats</h3>
        <dl className={styles.formats}>
          {FORMATS.map((format) => (
            <div key={format.id}>
              <dt>{format.label}</dt>
              <dd>{format.summary}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
