import styles from "./Wordmark.module.css";

/** The Charmbit logo: a keyring charm with a pixel-bit body. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <circle cx="16" cy="6.5" r="3.6" stroke="currentColor" strokeWidth="2.2" />
      <rect x="5" y="10.5" width="22" height="18" rx="5" fill="#F6D673" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="18.5" r="1.6" fill="currentColor" />
      <circle cx="20" cy="18.5" r="1.6" fill="currentColor" />
      <path d="M13.5 22.6c1.4 1.2 3.6 1.2 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className={styles.wordmark}>
      <LogoMark />
      <span className={styles.text}>charmbit</span>
    </span>
  );
}
