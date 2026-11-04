import { highlight } from "./highlight";
import styles from "./CodeView.module.css";

interface CodeViewProps {
  code: string;
  language: "xml" | "tsx" | "dart";
  label: string;
  /** Changing this key replays the swap animation. */
  swapKey?: string;
  className?: string;
}

/** Syntax-highlighted, keyboard-scrollable code with line numbers. */
export function CodeView({ code, language, label, swapKey, className }: CodeViewProps) {
  const lines = code.split("\n").length;
  return (
    <div className={[styles.view, className].filter(Boolean).join(" ")}>
      <pre key={swapKey} className={styles.pre} tabIndex={0} aria-label={label}>
        <span className={styles.gutter} aria-hidden="true">
          {Array.from({ length: lines }, (_, index) => index + 1).join("\n")}
        </span>
        <code className={styles.code}>{highlight(code, language)}</code>
      </pre>
    </div>
  );
}
