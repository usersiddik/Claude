# Kitemuse

> The brand name lives in one place, `src/lib/brand.ts`, and nowhere else in `src/` (a test enforces this).
> See [Brand name](#brand-name). It was previously developed under the working name "Charmbit".

**Original art, made to share.**

This is a growing universe of original stickers, for people who send them to friends and for
developers who ship them in products. The site reads like a magazine in four chapters:

1. **The universe** (hero): the headline, search and two calls to action on the left; on the right, a
   sticker sheet drawn from the real collections. The big sticker changes colour (on its own until you pick
   one), and the others peel up on hover and open in the library. The sheet is set in
   `src/components/home/Hero.tsx` (`FEATURED` and `SHEET`).
2. **Collections**: a card per collection with three stickers fanned out (they spread on hover), filters for
   Characters, Festivals, Feelings, and Icons, and cards for festivals that are on the way.
3. **Library**: search every collection or pick one, filter by group, tap a sticker, change its colours and details, then copy it.
   On phones the editor opens as a bottom sheet.
4. **Formats** (footer): every way a sticker leaves the site.

| Collection             | Stickers | What's inside |
| ---------------------- | -------: | ------------- |
| Love & Valentine's     | 26 | A cream kitten bringing daisies; glossy, winged, balloon, mended, and happy hearts; roses, tulips, a bouquet, a daisy; sweethearts |
| Cats                   | 45 | 21 sitting moods, 16 standing poses, 3 couples, 5 festive (kurta, saree, diyas, sparklers) |
| Diwali                 | 25 | 16 scenes with kids and family (diyas, sparklers, rangoli, kandil, laddoos, aarti, anar), 3 lettered wishes, 6 decor pieces |
| Ghosts                 | 23 | The full mood set, plus Boo! and festive lights |
| Everyday Expressions   | 20 | Lettered stickers: Hi!, Good morning, LOL, OMG, Sorry, Miss you, Get well soon… |
| Frogs, Rabbits, Giraffes | 21 each | The shared mood set on new characters |
| Charms & Icons         | 14 | The original flat charms and UI marks |
| Christmas, Eid, Halloween | soon | Preview covers |

Every sticker can be recoloured (fur, eyes, hearts, flowers, outfits, skin tones, lettering) and has
toggles where they make sense (blush, stripes or spots, whiskers, glass ears, string lights).

- **Exports:** copy as a transparent sticker image, download PNG (512 or 1024 px), a WhatsApp-sized WebP,
  or SVG, or copy SVG, React, or Flutter code. Phones get the system share sheet. GIF is next.
- Light and dark themes (system preference, plus a remembered toggle).
- **Sign in with Google to copy:** browsing, searching, and customising are open to everyone; copying,
  downloading, code export, and sharing ask for a Google sign-in first (see "Google sign-in").
- No database, CMS, or analytics. Pages and stickers are static (one prerendered SVG per sticker at
  `/stickers/<collection>/<sticker>.svg`); four small routes under `/api/auth` handle sign-in.
- Runtime dependencies: `next`, `react`, and `react-dom` only (sign-in uses Web Crypto and `fetch`).

## Brand name

Everything people see (header wordmark, placeholder monogram, favicon, page title, social tags,
JSON-LD, footer, Flutter export comments) reads from `src/lib/brand.ts`.

- **Try another name without touching code:** set `NEXT_PUBLIC_BRAND_NAME=Example` in `.env.local` or in
  Vercel's environment variables, then rebuild or redeploy.
- **Change the name for good:** edit `BRAND_NAME` in `src/lib/brand.ts`.
- **Internal identifier:** storage keys, events and cookies use `BRAND.id` (`"studio"`), which is separate
  from the display name, so a rename doesn't sign anyone out or lose saved settings.
- **Logo:** the mark is a placeholder monogram (the brand initial on a yellow tile) until a real logo is
  designed. Replace `LogoMark` in `src/components/ui/Wordmark.tsx` and `src/app/icon.tsx`.
- **Not yet renamed:** the project folder (`charmbit/`, which Vercel's root directory setting points at) and
  the Vercel project and domain (`claude-charmbit.vercel.app`). Renaming them changes the live address and the Google sign-in redirect address, so do them together.

## Pages and launch features

- `/` home: hero with search and two calls to action, collections, the library with its editor.
- `/developers`: how to use the SVG, React and Flutter exports. The code shown is real exporter output.
- `/license`: usage terms. **Owner to confirm the wording before launch** (`src/app/license/page.tsx`).
- `/privacy`, and a not-found page.
- Library: search (press `/`), collections, groups, A–Z sort, and Saved stickers kept in the browser.
- Editor: swatches, hex input, toggles, outline, Surprise me, Reset to original.
- Exports: PNG and WebP at 256, 512 and 1024 px, SVG, a WhatsApp sticker (512 px WebP kept under 100 KB)
  and a Telegram sticker (512 px PNG), plus SVG, React and Flutter code.

## Image packs and the archive

The new direction is character packs made of image files, starting with **Sheru** (a white lion in white and gold).

- **Definition:** `src/lib/universe/packs/sheru.ts` lists the character's fixed identity, outfits, groups and
  16 stickers, each with the scene to generate.
- **Prompts:** `docs/sheru-prompts.md` (regenerate with `node --experimental-strip-types scripts/prompts.ts sheru`).
  Generate one master image first, then attach it to every sticker prompt so the face stays the same.
- **Adding a sticker:** `python3 scripts/add-sticker.py <image> sheru <sticker-id> [look]` removes the green
  background, trims, squares and saves a 1024 px WebP in `public/packs/sheru/`. Needs Pillow.
- **Outfits:** a file named `<sticker>.<look>.webp` (e.g. `coffee.black.webp`) adds that outfit to the sticker.
- **Publishing rule:** a sticker appears once its default-look file exists. As soon as any pack has a sticker,
  the older code-drawn collections are hidden. They are archived, not deleted: `buildArchive` in
  `src/lib/universe/index.ts` still holds them, and `buildUniverse(icons, files, true)` shows both.
- **Image stickers** export PNG, WebP, WhatsApp and Telegram files and can be copied. They have no SVG or
  code exports and no live recolouring.
- **Animated stickers later:** `StickerImage.animated` is reserved for GIF or animated WebP files. Nothing
  reads it yet.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + tests + production build
```

Requires Node 22.6+ (tests use Node's built-in TypeScript type stripping).

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://example.com`) once you have a custom domain so canonical,
Open Graph, robots, and sitemap URLs use it. On Vercel it falls back to the project's production domain
(`VERCEL_PROJECT_PRODUCTION_URL`), then `VERCEL_URL`; locally it defaults to `http://localhost:3000`.

| Script              | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run lint`      | ESLint (Next core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` in strict mode                    |
| `npm test`          | `node:test` unit tests (art, universe, search, sign-in, exports) |
| `npm run build`     | Static production build                          |

## Google sign-in

Copy sticker, every download (PNG, WhatsApp WebP, SVG), every code export (SVG, React, Flutter), and Share
ask the visitor to sign in with Google first. Everything else stays open.

How it works (no auth library, no database):

- `GET /api/auth/google` starts the OAuth 2.0 authorization-code flow with PKCE (S256) and a random `state`,
  both kept in a signed, http-only, 10-minute cookie along with where to come back to (same-site paths only).
- `GET /api/auth/callback/google` checks `state`, exchanges the code with Google, checks the ID token's issuer,
  audience, expiry, and verified email, then sets a signed, http-only session cookie (30 days).
- `GET /api/auth/session` says whether sign-in is on and who is signed in; `POST /api/auth/logout` signs out.
- Cookies are signed with HMAC-SHA256 (`AUTH_SECRET`) and compared in constant time. Nothing is stored on the
  server; the site only receives the name, email, and photo Google shares.
- Before leaving for Google, the library saves the visitor's colours, outline, and search in `sessionStorage`
  and restores them on return, so they land back on the same sticker. A note says who they're signed in as.

### Turn it on

1. Google Cloud Console → APIs & Services → OAuth consent screen: choose External, add the app name and a
   support email, and the scopes `openid`, `email`, `profile`.
2. Credentials → Create credentials → OAuth client ID → Web application. Authorised redirect URIs:
   `https://claude-charmbit.vercel.app/api/auth/callback/google` (and
   `http://localhost:3000/api/auth/callback/google` for local development).
3. In Vercel → Project → Settings → Environment Variables, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
   `AUTH_SECRET` (32+ random characters, e.g. `openssl rand -base64 32`), then redeploy.

Until all three are set, sign-in stays off and copying works without it, so the site never locks everyone out.
The gate protects the buttons; like any website, the artwork itself can still be seen and saved from the page.

## Search

`src/lib/universe/search.ts` searches every live collection in the browser, with no service to host. Words are
folded into shared concepts before matching, so people can type the way they talk:

- "mwah" and "smooch" find kisses; "sad" finds crying and single-tear stickers; "birthday" finds Yay and
  Congrats; "bunny" finds rabbits; "good morning" is one idea, not two words.
- Each sticker is indexed by its name (strongest), extra meanings (a tear also says sorry), caption and id,
  then its group and collection. Every query word must match; prefixes of three letters or more count.
- Stickers from the collection a word names rank first ("diwali" leads with the Diwali collection).
- To teach it a word, add it to `CONCEPTS` (synonyms), `PHRASES` (multi-word), or `TAGS` (extra meaning
  for a sticker id). `npm test` checks that every popular search returns results.

The hero search and its chips scroll to the library and show the results there; `?q=love` links straight to
a search (and the hero form works without JavaScript).

## Project structure

```
assets/svg/                 Flat charm and mark artwork, one file per asset
scripts/lettering.cjs       Traces sticker lettering to SVG paths (see "Lettering")
src/
  app/                      Page, layout, OG image, icon, robots, sitemap
    api/auth/               google (start), callback/google, session, logout
    stickers/[collection]/[file]/route.ts   Prerendered SVG for every sticker
  lib/
    art/                    The drawing engines (pure string building, server or browser)
      kit.ts                Shared shapes, scene gradients, tapered limbs, composition, silhouettes
      face.ts               Eyes, brows, mouths, blush, tears, lashes, heart eyes
      props.ts              Mug, night cap, sunglasses, diya, sparkler, string lights, marigolds…
      species.ts            Rigs and drawings for cat, ghost, frog, rabbit, giraffe; character()
      creatures.ts          Reactions (faces + poses + props), couples, drawCreature()
      kids.ts               Kid rig (skin, hair, kurta/lehenga/saree, poses) and Diwali scenes
      festive.ts            Rangoli, kandil, anar, fireworks, toran, laddoos, aarti thali, gifts
      love.ts               Hearts, flowers, love letter, chocolates
      lettering.ts          Captions with traced lettering; lettering-glyphs.ts is generated
      seasons.ts            Covers for upcoming festivals
      color.ts              Shading from one picked colour
    universe/               The sticker universe: data, separate from the UI
      types.ts              Collection, StickerItem, Property schema
      swatches.ts           Colour presets
      collections/          One file per collection (creatures.ts builds five of them)
      index.ts              Registry, rendering, naming, and exports
      paths.ts              Static sticker URLs and library links
      search.ts             Keyword search with synonyms and ranking
      server.ts             Builds the universe at build time (reads the icon files)
    assets/                 Flat charm catalogue, loader, SVG helpers
    customize.ts            Fill and Ink options for flat charms
    exports/                SVG, React, and Flutter exporters
    auth/                   Google sign-in: signed tokens, PKCE, ID token checks (token.ts), settings (config.ts)
    sticker.ts              Bitmap rendering (PNG/WebP), image copy, download, share
    copy-events.ts          Copy notifications (any component announces, the island listens)
  components/
    auth/                   AuthProvider (session, gate, toast), SignInDialog, AccountButton
    home/                   Hero (+ stage, search, sticker layout), Collections (+ grid), LibraryChapter,
                            FloatingCta, Reveal (scroll reveal and in-place library links)
    library/                Library (search, rail, groups, grid, phone sheet), Editor, StickerActions, Fields,
                            useStickerActions, LibrarySection (URL sync)
    sections/               Header, mobile menu, footer
    ui/                     Popover, CopyIsland, ThemeToggle, Wordmark, icons
tests/                      node:test suites
```

Styling uses CSS Modules and design tokens (custom properties) in `src/app/globals.css`. No Tailwind.

- **Type:** Instrument Serif in capitals for display (editorial, a little playful), Inter for everything else.
- **Surfaces:** a warm paper canvas (`#F2F0EB` / `#0F0E0D`), white sheets, hairline borders. Colour comes from the
  stickers; each collection has a soft accent tint for its cards and previews.
- **Radii:** 4–6px on cards, tiles, and sheets; pills for chips and buttons.
- **Spacing:** one scale (`--space-1` to `--space-8`: 4, 8, 12, 16, 24, 32, 48, 64px) plus `--section-y` for
  the gap between chapters. Chapter label to headline is 32px, headline to content 48px, form fields 24px apart
  with 12px from label to control, and swatches 12px apart so the selection ring never crowds a neighbour.
- **Chapters:** small corner labels ("Chapter 02 — Collections") give the page a magazine rhythm.
- **Motion:** transform and opacity only, two curves (`--ease` and a gentle overshoot `--ease-spring`):
  - Hero: letters set one by one; stickers pop in with a stagger, float idly, follow the pointer by depth
    (one listener, two CSS variables), and drift up with the scroll (CSS scroll-driven animations).
  - Collections: cards rise in sequence; fanned stickers spread on hover.
  - Library: the section is a sheet that rises and straightens as it enters; tiles cascade in on every
    collection or group change; the preview floats; copying plays a small "peel and stick" and the button
    morphs to "Copied".
  - Under `prefers-reduced-motion`, all of it is removed and nothing is hidden waiting for a reveal.
- **Performance:** stickers on the page are static SVG files (lazy-loaded, cached). The library only renders
  stickers in the browser once you change a colour.

## Asset schema

Defined in `src/lib/assets/types.ts`. You author `AssetMeta` and the loader adds the rest.

| Field             | Type                                         | Notes                                                    |
| ----------------- | -------------------------------------------- | -------------------------------------------------------- |
| `id`              | `string`                                     | Unique, e.g. `charm-mochi`                               |
| `slug`            | `string`                                     | Kebab-case, unique; matches the SVG filename |
| `title`           | `string`                                     | Display name and default accessible label                |
| `family`          | `"charm" \| "mark" \| "duo"`                 | Selects the SVG folder and component suffix              |
| `subject`         | `"character" \| "object" \| "icon" \| "pair"` |                                                          |
| `description`     | `string`                                     | One sentence on where it fits                            |
| `tags`            | `string[]`                                   | Searchable. The `reaction` tag powers the Reactions filter |
| `palette`         | `PaletteKey[]`                               | Keys from `palette.ts`. **The first entry is the main fill** that the Color control replaces |
| `traits?`         | `{ character, pose?, expression? }`          | For future pose/expression variants                      |
| `relationship?`   | `{ groupId, kind, occasion, memberIds }`     | Required for Duos; links paired characters               |
| `preview`         | `{ tone: PaletteKey }`                       | Card label tint                                          |
| `relatedAssetIds` | `string[]`                                   | Related assets (kept in the data model for future views) |
| `exports`         | `("svg" \| "react" \| "flutter")[]`          | Formats offered                                          |
| `status`          | `"available" \| "comingSoon"`                | `comingSoon` shows a preview that can't be copied yet    |
| `featured?`       | `boolean`                                    | Reserved for curated views                               |
| `isNew?`          | `boolean`                                    | Appears under the New filter                             |

The loader derives `number`, `sourceSvg` (optimised), `viewBox`, `width`, and `height`.
Every count in the UI (chips, hero facts, results) is computed from this data.

## Adding to the universe

A collection is data plus one `render(item, values)` function (`src/lib/universe/types.ts`):

| Field | Notes |
| ----- | ----- |
| `id`, `title`, `noun` | `noun` names files and components, e.g. `Cat` → `cat-hi.svg`, `CatHiSticker` |
| `tagline`, `description` | Card and library copy |
| `families` | Discovery filters it appears under: `characters`, `festivals`, `feelings`, `icons` |
| `accent` | Card and preview tint |
| `groups` | Sub-filters inside the collection |
| `properties` | `color` (swatches, default, optional custom picker) or `toggle` |
| `items` | `{ id, name, caption, group, uses }`; `uses` lists the properties that change it, and only those show in the editor |
| `cover` | Three item ids for the card |
| `status: "soon"` | Instead of items: `arrives` and a `preview()` cover |

- **A new sticker in an existing collection:** add a scene (for example to `DIWALI_SCENES` in `kids.ts` or
  `LOVE_SCENES` in `love.ts`) or a reaction (to `REACTIONS` and `FACES` in `creatures.ts`, then compose it in
  `single()`). It appears in the library, the static files, and the counts.
- **A new character:** add a rig and drawing to `SPECIES` in `species.ts` (face anchors, shoulders, prop anchors,
  head, body, feet), then call `creatureCollection()` in `collections/creatures.ts`. Every reaction works on it.
- **A new collection:** write `collections/<name>.ts` and list it in `GENERATED` in `universe/index.ts`.
- **Bringing a festival out of "soon":** replace its `SoonCollection` with a live one.

`npm test` renders every sticker in every collection, every reaction for every species and stance, and checks
that the SVG is safe, every `url(#…)` reference resolves, portable output has no filters, groups and properties
are consistent, and live collections have at least 15 stickers (Cats at least 40).

### The drawing engines

- **Creatures** share one rig: the same eyes, blush, brows, mouths, and tears; tapered arms that grow out of the
  body and end in proper paws (pads show when a paw faces you); and anchors for props, so "Good night" puts a cap
  on any head and "Love" puts a heart in any paws. Cats can sit or stand.
- **Kids** use the same face system at a smaller scale with skin tones, hairstyles (short, curly, long, bun with
  a jasmine gajra, braid, pigtails), outfits (kurta with churidar and juttis, lehenga with dupatta, saree), bangles,
  and poses (hold, raise, wave, namaste, hands over ears, point, hug).
- **Ids** are namespaced with a hash of the options, so many variants can share a page.
- **Portable mode** drops SVG filters. It's used for Flutter, the OG image, and library thumbnails.
- `silhouetteOf()` removes whiskers, glows, string lights, and sparks so the die-cut edge follows the body.

### Lettering

Lettering is traced to SVG paths from Baloo 2 ExtraBold (SIL Open Font License), so it renders the same in
every browser, in the PNG export, and in flutter_svg, with no font to load. To add a phrase, run
`scripts/lettering.cjs` with every phrase (see the comment at the top of the script).

## Sticker output

`src/lib/sticker.ts` renders any asset in the browser:

- **Copy sticker** writes a transparent 512×512 PNG to the clipboard (`ClipboardItem`). Where image copy
  isn't supported, it downloads the PNG instead.
- **PNG** and **WhatsApp WebP** downloads. WebP is used when the browser can encode it, otherwise PNG.
- **Share** opens the system share sheet on devices that support sharing files.
- **Outline** sets a white die-cut edge in five widths (None, Thin, Medium, Thick, Extra). It follows only the
  solid parts of the art (not glows, lights, or sparks), the preview shows the exact bitmap that will be copied,
  and the choice carries across stickers. It's off by default, so stickers paste cleanly into chats.

## Adding a flat Charm or Mark

1. **Draw** the artwork and export a plain SVG.
   - Charms use a `0 0 96 96` viewBox. Marks use `0 0 24 24`.
   - Use `stroke="currentColor"` / `fill="currentColor"` for ink linework so it can be recoloured.
   - Use palette hex values for fills (the test suite rejects off-palette colours; add new ones to `palette.ts`).
   - Paint the main body with the colour you list **first** in `palette`, so the Color control can recolour it.
   - Don't use `<script>`, `<style>`, event handlers, embedded images, or external `href`s. The loader rejects them.
2. **Save** it as `assets/svg/<charms|marks|duos>/<slug>.svg`.
3. **Register** it in `src/lib/assets/catalog.ts`:

   ```ts
   {
     id: "charm-pebble",
     slug: "pebble",
     title: "Pebble",
     family: "charm",
     subject: "character",
     description: "A calm little stone for meditation and quiet states.",
     tags: ["calm", "reaction"],
     palette: ["stone", "ink"],
     traits: { character: "Pebble", pose: "resting", expression: "calm" },
     preview: { tone: "stone" },
     relatedAssetIds: ["charm-mochi"],
     exports: ["svg", "react", "flutter"],
     status: "available",
   },
   ```

4. Run `npm test`. It checks that every catalogue entry has a file, there are no orphan
   files, ids, slugs, and references are valid, the SVG is safe, colours are on-palette, and the
   main fill is present so recolouring works.

## Colour customisation

Options live in `src/lib/customize.ts`:

- **Color** (`FILL_OPTIONS`): replaces the asset's main fill (`palette[0]`) everywhere it appears.
  "Original" keeps the artwork's own colours.
- **Ink** (`INK_OPTIONS`): sets the linework colour (`currentColor`). **Auto** (the default) keeps
  `currentColor` in exports so they inherit text colour. Any other ink is written into the export: a
  `color` attribute on the SVG, the default `color` prop in React, and the default `color` in Flutter.

To add a swatch, append `{ id, name, hex }` to either list.

## Adding or changing export formats

Exporters are pure functions in `src/lib/exports/` that take
`{ title, slug, family, sourceSvg }` plus optional `{ ink }` and return a string.
`buildExport(asset, format, { fill, ink })` applies the colour choices first.

- **SVG** (`svg.ts`): adds `role="img"`, a `<title>`, and intrinsic `width`/`height`.
- **React** (`react.ts`): converts attributes to JSX (`stroke-width` → `strokeWidth`) and wraps
  the result in a typed component with `size`, `color`, `title`, and `className` props. It is
  accessible by default (`role="img"` + `aria-label`), and `title=""` marks it decorative.
  It uses no hooks, so it works in Server Components.
- **Flutter** (`flutter.ts`): a `StatelessWidget` using `SvgPicture.string` with
  `SvgTheme(currentColor: …)`, so the ink colour follows `color`. Requires
  `flutter pub add flutter_svg`.

To add a format (for example Vue or SwiftUI):

1. Create `src/lib/exports/<format>.ts` exporting `to<Format>(asset: ExportSource, options?: ExportOptions): string`.
2. Add the id to `ExportFormat` in `src/lib/assets/types.ts`.
3. Register it in `FORMATS` in `src/lib/exports/index.ts` with a label and one-line summary.
4. Give it a `language`, the `props` a developer can change, and a `fileName`.
5. Add tests in `tests/exports.test.ts`.

Add the new format to the Code menu in `src/components/library/Editor.tsx`.

## URL state

| Param | Example | Effect |
| ----- | ------- | ------ |
| `c`   | `?c=diwali` | Opens the library at a collection |
| `s`   | `?c=cats&s=smitten-standing` | Selects a sticker |
| `q`   | `?q=kiss` | Opens the library with search results |

Every sticker has a link. Hero stickers and collection cards update the URL and scroll to the library without a
reload. Colour changes stay on the page. Older `?asset=<slug>` links open that charm in Charms & Icons.

## Accessibility notes

- Collection pills, group filters, tiles, and toggles are buttons with `aria-pressed`; swatches are native radio
  groups (arrow keys work), with a labelled custom colour well.
- The headline is read as one sentence; its animated letters are hidden from screen readers. Hero stickers are
  decorative shortcuts (out of the tab order); the same stickers are reachable in the library.
- On phones the editor is a native modal `<dialog>`: Escape, the close button, or a backdrop tap closes it.
- Popovers close on Escape or an outside click and return focus to their trigger.
- Copy results are announced through a polite live region (the copy island). Search forms use
  `role="search"` with labelled fields, and the result count is announced politely.
- Contrast is at least 4.5:1 for text in both themes; axe reports no violations in light, dark, or phone layouts.
- With `prefers-reduced-motion`, all decorative and scroll-linked motion is removed.
