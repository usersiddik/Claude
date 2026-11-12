"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { searchLibrary } from "@/components/library/search-events";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import styles from "./SiteHeader.module.css";

/**
 * The site's search, living in the navigation. On the home page it runs the
 * library search in place and scrolls to it; anywhere else it opens the home
 * page with the query. On phones it folds into an icon that expands.
 */
export function NavSearch() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const id = useId();
  const pathname = usePathname();
  const router = useRouter();

  function run(query: string) {
    const text = query.trim();
    if (!text) return;
    if (pathname === "/") {
      searchLibrary(text);
      document.getElementById("library")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    } else {
      router.push(`/?q=${encodeURIComponent(text)}#library`);
    }
    setOpen(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    run(value);
  }

  // "/" focuses the search from anywhere, unless something else is being typed.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || target?.closest("input, textarea, select, [contenteditable]") || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      setOpen(true);
      field.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  return (
    <div className={styles.searchWrap} data-open={open ? "" : undefined}>
      <button type="button" className={styles.searchToggle} aria-expanded={open} aria-controls={id} aria-label={open ? "Close search" : "Search stickers"} onClick={() => setOpen((state) => !state)}>
        {open ? <CloseIcon size={18} /> : <SearchIcon size={18} />}
      </button>
      <form id={id} className={styles.search} role="search" action="/#library" method="get" onSubmit={submit}>
        <label htmlFor={`${id}-field`} className="sr-only">
          Search stickers
        </label>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          ref={field}
          id={`${id}-field`}
          name="q"
          type="search"
          className={styles.searchField}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setValue("");
              setOpen(false);
              field.current?.blur();
            }
          }}
          placeholder="Search stickers"
          maxLength={60}
          autoComplete="off"
          enterKeyHint="search"
        />
        <kbd className={styles.searchKey} aria-hidden="true">
          /
        </kbd>
        {value ? (
          <button type="button" className={styles.searchClear} aria-label="Clear search" onClick={() => setValue("")}>
            <CloseIcon size={14} />
          </button>
        ) : null}
      </form>
    </div>
  );
}
