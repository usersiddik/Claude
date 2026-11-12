import { AuthProvider } from "@/components/auth/AuthProvider";
import { Collections } from "@/components/home/Collections";
import { FloatingCta } from "@/components/home/FloatingCta";
import { Hero } from "@/components/home/Hero";
import { LibraryChapter } from "@/components/home/LibraryChapter";
import { Reveal } from "@/components/home/Reveal";
import { ScrollScene } from "@/components/home/ScrollScene";
import { Statement } from "@/components/home/Statement";
import { Tilt } from "@/components/home/Tilt";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { CopyIsland } from "@/components/ui/CopyIsland";
import { countStickers, isLive, readyCount, type Collection } from "@/lib/universe";
import { getUniverse, iconAssets, packFiles } from "@/lib/universe/server";
import { SITE } from "@/lib/site";

function structuredData(universe: readonly Collection[]) {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: `${SITE.url}/`,
    description: SITE.description,
  };
  const collections = universe.filter(isLive).map((collection) => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${collection.title} stickers`,
    url: `${SITE.url}/?c=${collection.id}`,
    description: collection.description,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: `${SITE.url}/` },
    mainEntity: { "@type": "ItemList", numberOfItems: readyCount(collection) },
  }));
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify([website, ...collections]).replace(/</g, "\\u003c");
}

export default function HomePage() {
  const universe = getUniverse();
  const live = universe.filter(isLive);
  const total = countStickers(universe);

  return (
    <AuthProvider>
      <SiteHeader />
      <main id="main">
        <Hero total={total} collections={live} />
        <Collections universe={universe} />
        <Statement collections={live} />
        <LibraryChapter icons={iconAssets()} packs={packFiles()} total={total} />
      </main>
      <SiteFooter />
      <FloatingCta />
      <Reveal />
      <ScrollScene />
      <Tilt />
      <CopyIsland scope="page" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(universe) }} />
    </AuthProvider>
  );
}
