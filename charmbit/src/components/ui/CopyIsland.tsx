"use client";

import { useEffect, useRef, useState } from "react";
import { onCopy, type CopyNotice } from "@/lib/copy-events";
import { svgDataUri } from "@/lib/universe/paths";
import { CheckIcon } from "./icons";
import styles from "./CopyIsland.module.css";

interface CopyIslandProps {
  /** "page" yields to a dialog's own island while a modal is open. */
  scope: "page" | "dialog";
}

/** Floating pill at the top of the screen confirming each copy. */
export function CopyIsland({ scope }: CopyIslandProps) {
  const [notice, setNotice] = useState<(CopyNotice & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const stop = onCopy((next) => {
      if (scope === "page" && document.querySelector("dialog[open]")) return;
      clearTimeout(timer.current);
      setNotice({ ...next, id: Date.now() });
      timer.current = setTimeout(() => setNotice(null), 2400);
    });
    return () => {
      stop();
      clearTimeout(timer.current);
    };
  }, [scope]);

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {notice ? (
        <div key={notice.id} className={styles.island} data-error={notice.ok ? undefined : ""}>
          <span className={styles.thumb} style={notice.ink ? { color: notice.ink } : undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG thumbnail */}
            <img src={svgDataUri(notice.svg)} alt="" className={styles.art} />
          </span>
          <span className={styles.text}>
            {notice.ok ? (
              <>
                {notice.verb ?? "Copied"} <strong>{notice.title}</strong> as {notice.format}
              </>
            ) : (
              <>Couldn’t copy {notice.title}. Check clipboard permissions.</>
            )}
          </span>
          {notice.ok ? <CheckIcon className={styles.check} size={16} /> : null}
        </div>
      ) : null}
    </div>
  );
}
