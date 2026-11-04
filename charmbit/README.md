# Charmbit

**Tiny charms. Serious code.**
Original SVG characters, icons, and Duos for products people remember.

Charmbit is a growing universe of original stickers, for people who send them to friends and for
developers who ship them in products. The site reads like a magazine in four chapters:

1. **The universe** (hero): an editorial headline surrounded by floating stickers from every collection, with
   an AI prompt bar as the main action. Letters drop into place, stickers pop in one by one, drift with the
   pointer and the scroll, and show their name on hover. Clicking one opens it in the library.
2. **Make one with AI**: describe a sticker ("Diwali sticker for my sister Riya") and get three designs, with
   names and wishes lettered in. Keep chatting to change colours, words, mood, or pose, then copy or export.
3. **Collections**: a card per collection with three stickers fanned out (they spread on hover), filters for
   Characters, Festivals, Feelings, and Icons, and cards for festivals that are on the way.
4. **Library**: pick a collection, filter by group, tap a sticker, change its colours and details, then copy it.
   On phones the editor opens as a bottom sheet.
5. **Formats** (footer): every way a sticker leaves the site.

| Collection             | Stickers | What's inside |
| ---------------------- | -------: | ------------- |
| Love & Valentine's     | 25 | Glossy, winged, balloon, mended, and happy hearts; roses, tulips, a bouquet, a daisy; sweethearts |
| Cats                   | 43 | 21 sitting moods, 15 standing poses, 3 couples, 5 festive (kurta, saree, diyas, sparklers) |
| Diwali                 | 25 | 16 scenes with kids and family (diyas, sparklers, rangoli, kandil, laddoos, aarti, anar), 3 lettered wishes, 6 decor pieces |
| Ghosts                 | 22 | The full mood set, plus Boo! and festive lights |
| Everyday Expressions   | 20 | Lettered stickers: Hi!, Good morning, LOL, OMG, Sorry, Miss you, Get well soon… |
| Frogs, Rabbits, Giraffes | 20 each | The shared mood set on new characters |
| Charms & Icons         | 14 | The original flat charms and UI marks |
| Christmas, Eid, Halloween | soon | Preview covers |

Every sticker can be recoloured (fur, eyes, hearts, flowers, outfits, skin tones, lettering) and has
toggles where they make sense (blush, stripes or spots, whiskers, glass ears, string lights).

- **Exports:** copy as a transparent sticker image, download PNG (512 or 1024 px), a WhatsApp-sized WebP,
  or SVG, or copy SVG, React, or Flutter code. Phones get the system share sheet. GIF is next.
- Light and dark themes (system preference, plus a remembered toggle).
- No database, CMS, auth, or analytics. Everything is static (including one prerendered SVG file per sticker at
  `/stickers/<collection>/<sticker>.svg`) except one API route for the AI maker.
- Runtime dependencies: `next`, `react`, `react-dom`, `@anthropic-ai/sdk` (the AI maker), and `opentype.js`
  (traces custom lettering on the server).

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
| `npm test`          | `node:test` unit tests (art, universe, AI, exports) |
| `npm run build`     | Static production build                          |

## The AI sticker maker

Claude is the designer and the drawing engines are the illustrator. Claude never writes SVG. It reads the
conversation and fills in designs from the same vocabulary the library uses (character, reaction, pose, Diwali
or love scene, colours, toggles, and a caption) as structured output. The server checks every design against the
catalogue, repairs or drops anything the engine can't draw, and traces any caption (names, wishes) into vector
lettering with the sticker font. So every AI sticker matches the set, can be recoloured, and exports to PNG,
WhatsApp WebP, SVG, React, and Flutter like any other sticker.

```
Hero prompt / composer ──► POST /api/sticker-chat ──► Claude (structured output, cached brief)
                                     │                         │
                                     │                 { reply, designs[] }
                                     ▼                         ▼
                         sanitizeDesign() + traceText() ──► { reply, designs (+ lettering), source }
                                                               │
                                       renderDesign() in the browser ──► preview, copy, export
```

- **Model:** `claude-opus-5-5` with `effort: "low"` (mapping a request to a design is quick work), structured
  outputs (`output_config.format` with a strict JSON schema built from the catalogue), and the server-side
  refusal fallback (`fallbacks: "default"`). Set `CHARMBIT_AI_MODEL` to use another model, for example
  `claude-haiku-5-5` for lower cost (the fallback is only sent to models that support it).
- **Prompt caching:** the designer's brief (`src/lib/ai/prompt.ts`) is generated from the catalogue, contains no
  dates or ids, and is sent with `cache_control`, so repeat requests read it from the cache.
- **Conversation:** the browser keeps the chat and sends it with each request (up to 14 turns). Earlier designs
  go back as JSON, which is how "make it pink" or "add her name" changes the right sticker.
- **Quick mode:** without an API key, or if Claude is unavailable, a keyword designer (`src/lib/ai/local.ts`)
  answers instead, so the feature always works. It understands characters, moods, Diwali, love, colours,
  quoted words, names, and the refine chips. The studio shows which mode answered.
- **Safety and limits:** user messages are capped at 500 characters, captions at 24 Latin characters, and each
  IP gets 30 requests per 10 minutes (best-effort, in memory). Declines come back as a kind reply. Rendering
  only ever goes through the engines, so model output can't inject markup.

### Turn it on

1. Create an API key at console.anthropic.com.
2. In Vercel: Project → Settings → Environment Variables, add `ANTHROPIC_API_KEY` (Production, and Preview if
   you like), then redeploy. Locally, copy `.env.example` to `.env.local`.
3. Optional: `CHARMBIT_AI_MODEL` to change the model.

Every request is billed to that key. The limiter only slows bursts; for a public launch, add a spend limit in the
Anthropic Console and consider a shared rate limiter in front of the route.

## Project structure

```
assets/svg/                 Flat charm and mark artwork, one file per asset
assets/fonts/               Baloo 2 ExtraBold for runtime lettering (SIL OFL, see OFL.txt)
scripts/lettering.cjs       Traces sticker lettering to SVG paths (see "Lettering")
src/
  app/                      Page, layout, OG image, icon, robots, sitemap
    api/sticker-chat/route.ts               The AI designer (Claude, with quick mode)
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
      server.ts             Builds the universe at build time (reads the icon files)
    assets/                 Flat charm catalogue, loader, SVG helpers
    customize.ts            Fill and Ink options for flat charms
    exports/                SVG, React, and Flutter exporters
    ai/                     The AI sticker maker
      design.ts             Design types, strict JSON schema, validation, rendering
      prompt.ts             The designer's brief, generated from the catalogue
      local.ts              Quick mode: the keyword designer
      trace.ts              Server-side caption tracing (opentype.js + assets/fonts)
      export.ts             Code export for AI designs
    sticker.ts              Bitmap rendering (PNG/WebP), image copy, download, share
    copy-events.ts          Copy notifications (any component announces, the island listens)
  components/
    ai/                     AiChapter, AiStudio (chat, design cards, preview, phone sheet), events
    home/                   Hero (+ stage, prompt, sticker layout), Collections (+ grid), LibraryChapter,
                            FloatingCta, Reveal (scroll reveal and in-place library links)
    library/                Library (rail, groups, grid, phone sheet), Editor, StickerActions, Fields,
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
- **White outline** adds an optional die-cut edge that follows only the solid parts of the art (not glows, lights,
  or sparks). It's off by default, so stickers paste cleanly into chats.

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

Every sticker has a link. Hero stickers and collection cards update the URL and scroll to the library without a
reload. Colour changes stay on the page. Older `?asset=<slug>` links open that charm in Charms & Icons.

## Accessibility notes

- Collection pills, group filters, tiles, and toggles are buttons with `aria-pressed`; swatches are native radio
  groups (arrow keys work), with a labelled custom colour well.
- The headline is read as one sentence; its animated letters are hidden from screen readers. Hero stickers are
  decorative shortcuts (out of the tab order); the same stickers are reachable in the library.
- On phones the editor is a native modal `<dialog>`: Escape, the close button, or a backdrop tap closes it.
- Popovers close on Escape or an outside click and return focus to their trigger.
- Copy results are announced through a polite live region (the copy island). The AI conversation is a
  `role="log"` live region, and the prompt fields have labels; Enter sends, Shift+Enter adds a line.
- Contrast is at least 4.5:1 for text in both themes; axe reports no violations in light, dark, or phone layouts.
- With `prefers-reduced-motion`, all decorative and scroll-linked motion is removed.
