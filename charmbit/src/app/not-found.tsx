import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SiteHeader } from "@/components/sections/SiteHeader";
import styles from "@/components/docs/Doc.module.css";
import { stickerPath } from "@/lib/universe/paths";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <AuthProvider>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <div className={`container ${styles.center}`}>
          <div className={styles.fan} aria-hidden="true">
            {/* eslint-disable @next/next/no-img-element -- static SVG stickers */}
            <img src={stickerPath("ghosts", "hi")} alt="" width={150} height={150} />
            <img src={stickerPath("cats", "huh")} alt="" width={150} height={150} />
            <img src={stickerPath("frogs", "crying")} alt="" width={150} height={150} />
            {/* eslint-enable @next/next/no-img-element */}
          </div>
          <h1 className={`display ${styles.title}`}>Nothing here.</h1>
          <p className={styles.lede}>That page doesn&rsquo;t exist, or it has moved. The stickers are all still where you left them.</p>
          <Link href="/#library" className={styles.button}>
            Browse the library
          </Link>
        </div>
      </main>
    </AuthProvider>
  );
}
