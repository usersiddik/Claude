import type { ReactNode } from "react";
import Link from "next/link";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { SITE } from "@/lib/site";
import styles from "./Doc.module.css";

/** Shared frame for the text pages: header, a readable column, footer. */
export function DocPage({ label, note, title, children }: { label: string; note?: string; title: string; children: ReactNode }) {
  return (
    <AuthProvider>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <article className={`container ${styles.article}`}>
          <p className="eyebrow">
            <span>{label}</span>
            {note ? <span>{note}</span> : null}
          </p>
          <h1 className={`display ${styles.title}`}>{title}</h1>
          {children}
          <p className={styles.back}>
            <Link href="/">Back to {SITE.name}</Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </AuthProvider>
  );
}

export { styles as docStyles };
