"use client";

import { useSearchParams } from "next/navigation";
import type { Asset } from "@/lib/assets/types";
import { CharmLibrary } from "./CharmLibrary";

/** Reads URL params. Rendered inside <Suspense> so the page stays static. */
export function LibraryWithUrl({ assets }: { assets: readonly Asset[] }) {
  const params = useSearchParams();
  return <CharmLibrary assets={assets} params={params} />;
}
