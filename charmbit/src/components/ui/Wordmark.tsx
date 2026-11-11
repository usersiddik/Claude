import { BRAND } from "@/lib/brand";
import styles from "./Wordmark.module.css";

/**
 * Placeholder mark: the brand initial on a rounded tile. It reads from the
 * brand config, so it follows a rename until the real logo is designed.
 */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2.5" width="27" height="27" rx="7" fill="#F6D673" stroke="currentColor" strokeWidth="2.2" />
      <text x="16" y="17" textAnchor="middle" dominantBaseline="central" fill="#141312" fontSize="19" style={{ fontFamily: "var(--font-display)" }}>
        {BRAND.initial}
      </text>
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className={styles.wordmark}>
      <LogoMark />
      <span className={styles.text}>{BRAND.wordmark}</span>
    </span>
  );
}
