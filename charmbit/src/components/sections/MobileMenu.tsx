"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { NAV_LINKS } from "./nav";
import styles from "./SiteHeader.module.css";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
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
    <div ref={root} className={styles.mobile}>
      <button
        ref={toggle}
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
        <span>Menu</span>
      </button>
      <nav id={panelId} aria-label="Mobile" className={styles.panel} hidden={!open}>
        <ul role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.panelLink} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
