/**
 * Stickers floating around the hero headline. Positions are the sticker's
 * centre in % of the stage; size is in vw on desktop. `m*` values are for
 * phones, where the stickers sit above and below the headline instead.
 * `depth` scales parallax: bigger moves more and feels closer.
 */
export interface HeroSticker {
  collection: string;
  item: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  depth: number;
  mx?: number;
  my?: number;
  msize?: number;
  /** Hide on phones. */
  phone?: false;
}

export const HERO_STICKERS: readonly HeroSticker[] = [
  { collection: "diwali", item: "sparkler-siblings", x: 86, y: 19, size: 14, rotate: 7, depth: 1, mx: 76, my: 13, msize: 40 },
  { collection: "love", item: "rose", x: 9, y: 22, size: 10.5, rotate: -11, depth: 0.8, mx: 16, my: 12, msize: 26 },
  { collection: "cats", item: "smitten-standing", x: 82, y: 78, size: 13.5, rotate: 6, depth: 1.15, mx: 79, my: 86, msize: 34 },
  { collection: "diwali", item: "diya-girl", x: 17, y: 79, size: 13, rotate: -6, depth: 1, mx: 21, my: 87, msize: 32 },
  { collection: "frogs", item: "yay", x: 92, y: 50, size: 10, rotate: -9, depth: 0.6, phone: false },
  { collection: "giraffes", item: "smile", x: 7, y: 51, size: 9.5, rotate: 10, depth: 0.7, phone: false },
  { collection: "love", item: "glossy-heart", x: 67, y: 9, size: 6.5, rotate: 14, depth: 0.4, mx: 46, my: 7, msize: 17 },
  { collection: "rabbits", item: "love", x: 26, y: 11, size: 8, rotate: -8, depth: 0.55, phone: false },
  { collection: "everyday", item: "lol", x: 30, y: 91, size: 9, rotate: 7, depth: 0.85, mx: 50, my: 93, msize: 22 },
  { collection: "ghosts", item: "boo", x: 69, y: 91, size: 7.5, rotate: -7, depth: 0.5, phone: false },
  { collection: "diwali", item: "kandil", x: 95, y: 88, size: 6.5, rotate: -4, depth: 0.45, phone: false },
  { collection: "love", item: "balloon", x: 4, y: 86, size: 6.5, rotate: 8, depth: 0.45, phone: false },
];
