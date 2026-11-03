import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { SITE } from "@/lib/site";
import { NAV_LINKS } from "./nav";
import styles from "./Sections.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.footerBrand}>
          <Wordmark />
          <p className={styles.footerTagline}>{SITE.tagline}</p>
          <p className={styles.fine}>{SITE.supportingLine}</p>
        </div>
        <nav aria-label="Footer">
          <ul role="list" className={styles.footerLinks}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/#formats">Code formats</Link>
            </li>
          </ul>
        </nav>
        <p className={styles.footerSmall}>
          © {new Date().getFullYear()} Charmbit · Original SVG artwork · Licence terms coming soon
        </p>
      </div>
    </footer>
  );
}
