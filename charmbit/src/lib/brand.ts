/**
 * Brand identity. This is the only file that knows what the product is called.
 *
 * The public name is still a working name: the final brand has not been chosen.
 * To try another name, set NEXT_PUBLIC_BRAND_NAME (in .env.local or on Vercel)
 * and rebuild, or change WORKING_NAME below. Nothing else needs editing:
 * header, footer, metadata, social image, favicon, JSON-LD and exports all
 * read from here.
 */

/** Placeholder until the brand decision. Not an approved name. */
const WORKING_NAME = "Charmbit";

const name = process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || WORKING_NAME;

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
