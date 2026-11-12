import Link from "next/link";
import { AccountButton } from "@/components/auth/AccountButton";
import { BRAND } from "@/lib/brand";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { MobileMenu } from "./MobileMenu";
import { NavSearch } from "./NavSearch";
import { NAV_LINKS } from "./nav";
import styles from "./SiteHeader.module.css";

/** Brand, search, links, account: one quiet bar that stays at the top. */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label={`${BRAND.name} home`}>
          <Wordmark />
        </Link>
        <NavSearch />
        <nav aria-label="Primary" className={styles.nav}>
          <ul role="list" className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <ThemeToggle />
          <AccountButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
