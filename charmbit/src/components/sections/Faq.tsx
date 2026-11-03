import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

export const FAQ = [
  {
    question: "What is Charmbit?",
    answer:
      "Charmbit is a curated library of original SVG assets: Charms (characters and expressive objects), Marks (playful interface icons), and, soon, Duos (paired sets). Each asset is a small, carefully tuned SVG file you can copy straight into a product.",
  },
  {
    question: "Which code formats can I copy?",
    answer:
      "Raw SVG, a typed React (TSX) component, and a Flutter widget that uses the flutter_svg package. All three are generated from the same source SVG, so they always match.",
  },
  {
    question: "Can I change the colours or size?",
    answer:
      "Yes. Linework uses currentColor, so it follows the surrounding text colour, and fills are plain hex values you can edit. The React component takes size and color props; the Flutter widget takes size and color parameters.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "Not for SVG. The React export needs only React itself. The Flutter export needs flutter_svg, which you can add with: flutter pub add flutter_svg.",
  },
  {
    question: "Does Charmbit generate images with AI?",
    answer:
      "No. Charmbit is a library of authored SVG files. There is no image generator in Charmbit.",
  },
  {
    question: "How are the assets licensed?",
    answer:
      "Licence terms haven’t been published yet. Until they are, treat the library as a preview and check back before using assets in a shipped product.",
  },
  {
    question: "When will Duos be available?",
    answer:
      "Duos are the next family in progress. There’s no release date yet; the two previews in the library show the direction.",
  },
] as const;

export function Faq() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={`container ${styles.faqGrid}`}>
        <SectionHeading
          id="about-title"
          eyebrow="About"
          title="Small library, clear answers."
          lede="Charmbit is for developers and designers who want personality in their product without a heavy asset pipeline."
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
