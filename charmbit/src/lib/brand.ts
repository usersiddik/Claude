/**
 * Brand identity. This is the only file that knows what the product is called.
 *
 * To change the name, edit BRAND_NAME below, or set NEXT_PUBLIC_BRAND_NAME
 * (in .env.local or on Vercel) and rebuild. Nothing else needs editing:
 * header, footer, metadata, social image, favicon, JSON-LD and exports all
 * read from here.
 */

/** The chosen brand name. Trademark and social-handle checks are still pending. */
const BRAND_NAME = "Kitemuse";

const name = process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || BRAND_NAME;

export const BRAND = {
  /** Display name, as written in sentences and metadata. */
  name,
  /** Lowercase form used by the header wordmark. */
  wordmark: name.toLowerCase(),
  /** First letter, for the placeholder monogram and favicon. */
  initial: name.charAt(0).toUpperCase(),
  /**
   * Temporary internal identifier for storage keys, DOM events and cookies.
   * Never shown to people, and independent of the display name so a rename
   * does not log anyone out or lose their saved settings.
   */
  id: "studio",
} as const;

/** Namespaced key for localStorage, sessionStorage and custom events. */
export const brandKey = (key: string) => `${BRAND.id}:${key}`;
