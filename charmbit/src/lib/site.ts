import { BRAND } from "./brand.ts";

/** Site copy and URLs. The name comes from the brand config; never write it here. */
export const SITE = {
  name: BRAND.name,
  tagline: "Original art, made to share.",
  supportingLine: "Original SVG characters, icons, and Duos for products people remember.",
  description:
    `${BRAND.name} is a growing universe of original stickers: cats, ghosts, frogs, giraffes, Lumi the bunny, Diwali kids, hearts, and lettered expressions. Recolour any sticker, paste it into a chat, or export it as SVG, React, or Flutter.`,
  /** Where questions about licensing, privacy and support go. */
  contact: "namesiddik@gmail.com",
  /** Canonical origin for metadata, OG, robots and sitemap URLs. */
  url: resolveSiteUrl(),
} as const;

/**
 * NEXT_PUBLIC_SITE_URL wins (set it once you have a custom domain). On Vercel,
 * fall back to the project's production domain, then the deployment URL.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const url = explicit ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}
