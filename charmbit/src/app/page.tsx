import { Bento } from "@/components/sections/Bento";
import { Hero } from "@/components/sections/Hero";
import { LibrarySection } from "@/components/sections/LibrarySection";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { CopyIsland } from "@/components/ui/CopyIsland";
import { loadAssets } from "@/lib/assets/load";
import { SITE } from "@/lib/site";

function structuredData(assets: ReturnType<typeof loadAssets>) {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: `${SITE.url}/`,
    description: SITE.description,
  };
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE.name} library`,
    url: `${SITE.url}/`,
    description: SITE.supportingLine,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: `${SITE.url}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: assets.length,
      itemListElement: assets.map((asset, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: asset.title,
        description: asset.description,
      })),
    },
  };
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify([website, collection]).replace(/</g, "\\u003c");
}

export default function HomePage() {
  const assets = loadAssets();

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <LibrarySection assets={assets} />
        <Bento assets={assets} />
      </main>
      <SiteFooter />
      <CopyIsland scope="page" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(assets) }} />
    </>
  );
}
