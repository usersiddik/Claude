"use client";

import { useSearchParams } from "next/navigation";
import type { Asset } from "@/lib/assets/types";
import { Workspace } from "./Workspace";

/** Reads URL params. Rendered inside <Suspense> so the page stays static. */
export function WorkspaceWithUrl({ assets }: { assets: readonly Asset[] }) {
  const params = useSearchParams();
  return <Workspace assets={assets} params={params} />;
}
