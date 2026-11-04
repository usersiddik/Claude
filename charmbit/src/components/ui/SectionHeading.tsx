import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "start" | "center";
}

export function SectionHeading({ id, eyebrow, title, lede, align = "start" }: SectionHeadingProps) {
  return (
    <header className={styles.heading} data-align={align}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {lede ? <p className={styles.lede}>{lede}</p> : null}
    </header>
  );
}
