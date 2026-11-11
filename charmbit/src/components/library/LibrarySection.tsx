"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { IconAsset } from "@/lib/universe";
import type { PackFiles } from "@/lib/universe/packs";
import { Library } from "./Library";

/** The library driven by `?c=collection&s=sticker`, so every sticker has a link. */
function LibraryWithUrl({ icons, packs }: { icons: readonly IconAsset[]; packs: PackFiles }) {
  const params = useSearchParams();
  return (
    <Library
      icons={icons}
      packs={packs}
      initialQuery={params.get("q") ?? ""}
      restore
      // Older links used ?asset=<slug> for the icon library.
      selection={params.get("c") ? { collection: params.get("c"), sticker: params.get("s") } : params.get("asset") ? { collection: "icons", sticker: params.get("asset") } : {}}
      onSelect={({ collection, sticker }) => {
        const url = new URL(window.location.href);
        url.searchParams.set("c", collection);
        url.searchParams.set("s", sticker);
        // Next.js syncs replaceState with useSearchParams, without a navigation.
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }}
    />
  );
}

/** Static HTML shows the default selection; the URL takes over once loaded. */
export function LibraryBlock({ icons, packs }: { icons: readonly IconAsset[]; packs: PackFiles }) {
  return (
    <Suspense fallback={<Library icons={icons} packs={packs} selection={{}} onSelect={() => {}} />}>
      <LibraryWithUrl icons={icons} packs={packs} />
    </Suspense>
  );
}
