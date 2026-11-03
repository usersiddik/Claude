import type { ReactNode } from "react";
import styles from "./CodeTabs.module.css";

const TOKEN = /(\/\/[^\n]*|\/\*\*[^\n]*?\*\/|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|<\/?[a-zA-Z][\w.]*|\b(?:import|export|from|type|function|return|const|class|extends|final|static|super|this|default|undefined|true|null)\b)/g;

/** Minimal, dependency-free tinting: comments, strings, tags, and keywords. */
export function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > last) nodes.push(code.slice(last, index));
    const kind =
      token.startsWith("//") || token.startsWith("/**")
        ? styles.comment
        : token.startsWith('"') || token.startsWith("'")
          ? styles.string
          : token.startsWith("<")
            ? styles.tag
            : styles.keyword;
    nodes.push(
      <span key={index} className={kind}>
        {token}
      </span>,
    );
    last = index + token.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}
