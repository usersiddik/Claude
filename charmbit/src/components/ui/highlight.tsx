import type { ReactNode } from "react";
import styles from "./CodeView.module.css";

type Language = "xml" | "tsx" | "dart";

const KEYWORDS: Record<Language, string> = {
  xml: "",
  tsx: "import|export|from|type|function|return|const|default|undefined|true|false|null",
  dart: "import|class|extends|const|final|static|super|this|return|double|String|Widget|override",
};

function pattern(language: Language): RegExp {
  const keywords = KEYWORDS[language];
  return new RegExp(
    [
      String.raw`(?<comment>\/\/[^\n]*|\/\*\*?[\s\S]*?\*\/|<!--[\s\S]*?-->)`,
      String.raw`(?<raw>r?'''[\s\S]*?''')`,
      String.raw`(?<string>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')`,
      String.raw`(?<tag><\/?[A-Za-z][\w.]*|\/?>)`,
      String.raw`(?<attr>[A-Za-z_:][\w:-]*(?==))`,
      keywords ? String.raw`(?<keyword>\b(?:${keywords})\b)` : "",
      String.raw`(?<type>\b[A-Z][A-Za-z0-9]*\b)`,
      String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
    ]
      .filter(Boolean)
      .join("|"),
    "g",
  );
}

const CLASS: Record<string, string | undefined> = {
  comment: styles.comment,
  raw: styles.string,
  string: styles.string,
  tag: styles.tag,
  attr: styles.attr,
  keyword: styles.keyword,
  type: styles.type,
  number: styles.number,
};

/** Small, dependency-free syntax tinting for the three export languages. */
export function highlight(code: string, language: Language): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(pattern(language))) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(code.slice(last, index));
    const kind = Object.entries(match.groups ?? {}).find(([, value]) => value !== undefined)?.[0] ?? "";
    nodes.push(
      <span key={index} className={CLASS[kind]}>
        {match[0]}
      </span>,
    );
    last = index + match[0].length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}
