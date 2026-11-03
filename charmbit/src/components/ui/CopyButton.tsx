"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { CheckIcon, CopyIcon } from "./icons";
import styles from "./CopyButton.module.css";

type CopyState = "idle" | "copied" | "error";

interface CopyButtonProps {
  /** Called on click so expensive exports are only built when needed. */
  getText: () => string;
  /** Full accessible description, e.g. "Copy React code for Mochi". */
  label: string;
  /** What was copied, for the confirmation message, e.g. "React code". */
  what: string;
  /** Visible text. Omit for an icon-only button. */
  children?: React.ReactNode;
  variant?: "solid" | "ghost" | "chip";
  className?: string;
}

export function CopyButton({ getText, label, what, children, variant = "solid", className }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    clearTimeout(timer.current);
    try {
      await copyText(getText());
      setState("copied");
    } catch {
      setState("error");
    }
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  const message =
    state === "copied" ? `${what} copied to clipboard.` : state === "error" ? `Couldn’t copy ${what}. Select the code and copy it manually.` : "";

  return (
    <>
      <button
        type="button"
        className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
        data-state={state}
        aria-label={label}
        title={children ? undefined : label}
        onClick={handleClick}
      >
        <span className={styles.icons} aria-hidden="true">
          <CopyIcon className={styles.copy} size={16} />
          <CheckIcon className={styles.check} size={16} />
        </span>
        {children ? <span aria-hidden="true" data-copy-text="">{state === "copied" ? "Copied" : children}</span> : null}
      </button>
      <span role="status" className="sr-only">
        {message}
      </span>
    </>
  );
}
