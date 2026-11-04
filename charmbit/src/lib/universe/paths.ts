/** Static URLs for prerendered stickers (default colours) and library links. */

export const stickerPath = (collectionId: string, itemId: string) => `/stickers/${collectionId}/${itemId}.svg`;

export const coverPath = (collectionId: string) => `/stickers/${collectionId}/cover.svg`;

/** An SVG as an image URL. Images keep each sticker's ids to themselves. */
export const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Opens the library at a collection (and sticker). */
export const libraryHref = (collectionId: string, itemId?: string) => `/?c=${collectionId}${itemId ? `&s=${itemId}` : ""}#library`;
