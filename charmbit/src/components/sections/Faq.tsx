import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

export const FAQ = [
  {
    question: "What is Charmbit?",
    answer:
      "A library of original SVG artwork for products: Charms (characters and expressive objects), Marks (interface icons with personality), and soon, Duos (matching pairs).",
  },
  {
    question: "Which formats can I copy?",
    answer:
      "SVG, a typed React component, or a Flutter widget. Choose one with Copy as, then click any asset. All three come from the same source file, so they always match.",
  },
  {
    question: "Can I change the colors?",
    answer:
      "Yes. Color changes the main fill and Ink changes the linework. Your choice is built into whatever you copy, and you can still change size and color later through props.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "Not for SVG. React output only needs React. Flutter output uses the flutter_svg package.",
  },
  {
    question: "Is the artwork AI-generated?",
    answer: "No. Charmbit is a library of authored SVG files. There is no image generator.",
  },
  {
    question: "How is it licensed?",
    answer:
      "License terms haven’t been published yet. Until they are, treat the library as a preview and check back before shipping it in a product.",
  },
] as const;

export function Faq() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={`container ${styles.faqGrid}`}>
        <SectionHeading
          id="about-title"
          eyebrow="About"
          title="Questions"
          lede="Charmbit is for developers and designers who want personality in a product without a heavy asset pipeline."
        />
        <div className={styles.faq}>
          {FAQ.map((item) => (
            <details key={item.question} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                <h3>{item.question}</h3>
                <span className={styles.faqToggle} aria-hidden="true" />
              </summary>
              <p className={styles.faqAnswer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
