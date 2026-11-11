import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/developers`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/license`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
