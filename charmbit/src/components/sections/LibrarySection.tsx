import { Suspense } from "react";
import { Workspace } from "@/components/library/Workspace";
import { WorkspaceWithUrl } from "@/components/library/WorkspaceWithUrl";
import type { Asset } from "@/lib/assets/types";
import styles from "./LibrarySection.module.css";

export function LibrarySection({ assets }: { assets: readonly Asset[] }) {
  const available = assets.filter((asset) => asset.status === "available").length;
  return (
    <section id="library" className={styles.section} aria-labelledby="library-title">
      <div className="container">
        <header className={styles.header}>
          <h2 id="library-title" className={styles.title}>
            Library
          </h2>
          <p className={styles.lede}>
            {available} characters and icons ready to copy as stickers or code. Click a card to inspect it, or use the pill to copy in one click.
          </p>
        </header>
        {/* Static render shows the full library; URL state applies on the client. */}
        <Suspense fallback={<Workspace assets={assets} params={null} />}>
          <WorkspaceWithUrl assets={assets} />
        </Suspense>
      </div>
    </section>
  );
}
