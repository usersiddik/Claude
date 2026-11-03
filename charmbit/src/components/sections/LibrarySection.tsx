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
        <SectionHeading
          id="library-title"
          eyebrow="Library"
          title="The Charm Shelf"
          lede="Charms are characters and expressive objects. Marks are interface icons with a bit of personality. Open any label to see its code."
        />
        {/* The static render shows the full shelf; URL state (search, filter, open asset) applies on the client. */}
        <Suspense fallback={<CharmLibrary assets={assets} params={null} />}>
          <LibraryWithUrl assets={assets} />
        </Suspense>
      </div>
    </section>
  );
}
