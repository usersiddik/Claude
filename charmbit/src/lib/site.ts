export const SITE = {
  name: "Charmbit",
  tagline: "Tiny charms. Serious code.",
  supportingLine: "Original SVG characters, icons, and Duos for products people remember.",
  description:
    "Charmbit is a library of original SVG characters and interface marks. Copy any asset as raw SVG, a typed React component, or a Flutter widget.",
  /** Set NEXT_PUBLIC_SITE_URL in production so canonical, OG and sitemap URLs are absolute. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
} as const;
