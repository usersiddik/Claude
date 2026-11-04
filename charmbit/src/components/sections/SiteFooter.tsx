import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { SITE } from "@/lib/site";
import { NAV_LINKS } from "./nav";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Wordmark />
          <p>{SITE.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <ul role="list" className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className={styles.small}>© {new Date().getFullYear()} Charmbit. Original SVG artwork. License terms coming soon.</p>
      </div>
    </footer>
  );
}
