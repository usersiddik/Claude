import { Suspense } from "react";
import { CharmLibrary } from "@/components/library/CharmLibrary";
import { LibraryWithUrl } from "@/components/library/LibraryWithUrl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Asset } from "@/lib/assets/types";
import styles from "./Sections.module.css";

export function LibrarySection({ assets }: { assets: readonly Asset[] }) {
  return (
    <section id="library" className={styles.section} aria-labelledby="library-title">
      <div className="container">
        <div className={styles.headingGap}>
          <SectionHeading
            id="library-title"
            eyebrow="Library"
            title="Find it. Color it. Copy it."
            lede="Charms are characters and expressive objects. Marks are interface icons with a little personality."
          />
        </div>
        {/* Static render shows the full library; URL state applies on the client. */}
        <Suspense fallback={<CharmLibrary assets={assets} params={null} />}>
          <LibraryWithUrl assets={assets} />
        </Suspense>
      </div>
    </section>
  );
}
