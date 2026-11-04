"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./Popover.module.css";

interface PopoverProps {
  /** Accessible name for the trigger, e.g. "Fill color: Butter". */
  label: string;
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
}

/** A small anchored panel. Escape or an outside click closes it and returns focus. */
export function Popover({ label, trigger, children, align = "start" }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("input:checked, input, button")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        button.current?.focus();
      }
    }
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className={styles.root}>
      <button
        ref={button}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      <div ref={panel} id={id} className={styles.panel} data-align={align} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
