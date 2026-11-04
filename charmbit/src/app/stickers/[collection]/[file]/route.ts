import { defaultValues, findItem, isLive } from "@/lib/universe";
import { getUniverse } from "@/lib/universe/server";

/**
 * Every sticker in its default colours, prerendered as a static SVG file so
 * pages stay light and images load lazily from the CDN.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getUniverse().flatMap((collection) =>
    isLive(collection) ? collection.items.map((item) => ({ collection: collection.id, file: `${item.id}.svg` })) : [{ collection: collection.id, file: "cover.svg" }],
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ collection: string; file: string }> }) {
  const { collection: collectionId, file } = await params;
  const collection = getUniverse().find((candidate) => candidate.id === collectionId);
  const id = file.replace(/\.svg$/, "");
  let svg: string | undefined;
  if (collection && isLive(collection)) {
    const item = collection.items.find((candidate) => candidate.id === id) ? findItem(collection, id) : undefined;
    if (item) svg = collection.render(item, defaultValues(collection));
  } else if (collection && id === "cover") {
    svg = collection.preview()[0];
  }
  if (!svg) return new Response("Not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
