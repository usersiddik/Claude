import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  badge?: string;
}

export function SectionHeading({ id, eyebrow, title, lede, badge }: SectionHeadingProps) {
  return (
    <header className={styles.heading}>
      <p className={styles.eyebrow}>
        <span className={styles.dot} aria-hidden="true" />
        {eyebrow}
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {lede ? <p className={styles.lede}>{lede}</p> : null}
    </header>
  );
}
