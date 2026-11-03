import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

const STEPS = [
  {
    title: "Pick",
    body: "Search by name, mood, or use. Charms share a 96-unit canvas and Marks a 24-unit one, so they sit well together.",
  },
  {
    title: "Copy",
    body: "Open a code label and copy SVG, React, or Flutter. Every format is generated from the same source file, so they always match.",
  },
  {
    title: "Ship",
    body: "Paste it into your project. No account, no API key, and no extra package for SVG or React.",
  },
];

const FORMAT_CARDS = [
  {
    name: "SVG",
    tone: "butter",
    points: [
      "Standalone markup with viewBox, size, and a <title>",
      "Linework uses currentColor, so CSS color recolours it",
      "Works in HTML, Markdown, and design tools",
    ],
    usage: ".empty-state svg {\n  width: 64px;\n  color: #1c1b22;\n}",
  },
  {
    name: "React",
    tone: "lilac",
    points: [
      "Typed TSX with size, color, title, and className props",
      "role=\"img\" and a label by default; title=\"\" makes it decorative",
      "No hooks, so it also renders in Server Components",
    ],
    usage: '<MochiCharm size={64} title="All caught up" />',
  },
  {
    name: "Flutter",
    tone: "mint",
    points: [
      "A StatelessWidget wrapping SvgPicture.string",
      "size, color, and semanticsLabel parameters",
      "Needs flutter_svg: flutter pub add flutter_svg",
    ],
    usage: "const MochiCharm(size: 64)",
  },
];

export function BuiltToShip() {
  return (
    <section id="formats" className={styles.section} aria-labelledby="formats-title">
      <div className="container">
        <SectionHeading
          id="formats-title"
          eyebrow="Built to ship"
          title="Pick. Copy. Ship."
          lede="Three formats from one source of truth. No build step, no SDK, and nothing to sign up for."
        />
        <ol role="list" className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
        <ul role="list" className={styles.formats}>
          {FORMAT_CARDS.map((format) => (
            <li key={format.name} className={styles.format} data-tone={format.tone}>
              <h3 className={styles.formatTitle}>{format.name}</h3>
              <ul className={styles.points}>
                {format.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <pre className={styles.usage}>
                <code>{format.usage}</code>
              </pre>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
