export const SITE = {
  name: "Charmbit",
  tagline: "Tiny charms. Serious code.",
  supportingLine: "Original SVG characters, icons, and Duos for products people remember.",
  description:
    "Charmbit is a library of original SVG characters and interface marks. Copy any asset as raw SVG, a typed React component, or a Flutter widget.",
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
