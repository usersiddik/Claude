# Charmbit

**Tiny charms. Serious code.**
Original SVG characters, icons, and Duos for products people remember.

Charmbit is a sticker studio and SVG library, for people who send stickers to friends and for developers
who ship them in products:

- **Sticker Studio** (the hero): 27 reactions for a cat (and a ghost) in five categories, browsed with a
  ◀ ▶ carousel:
  - **Everyday:** Hi, Morning (coffee), Good night, Thank you, Huh?
  - **Feelings:** Smile, Naughty, LOL, Single tear, Crying, Shy, Shocked, Grumpy, Cool, Fever, plus Boo! for
    the ghost
  - **Love:** Love (one classic glowing heart), Kiss, Miss you
  - **Together:** Hug, Head on shoulder, Cheek to cheek
  - **Diwali:** Diya, Sparkler, Sparklers together, Diya for two, Diwali hug (matching outfits, string lights)

  Any fur and eye colour (presets or a custom picker), partner colours for couples, an outfit colour for festive
  stickers, and toggles for glass ears, blush, stripes, whiskers, and the sticker edge.
- **Exports**: copy as a transparent sticker image (256, 512, or 1024 px), download PNG, a WhatsApp-sized
  WebP, or SVG, or copy SVG, React, or Flutter code. Phones get the system share sheet.
- **Library**: original charms and interface marks with search, two-tier categories, Fill and Ink colours,
  an inspector with size previews and code, and one-click copy as a sticker or code.
- **Bento**: one source to every format, the Fill + Ink model, couples, and the essentials.

All three formats are generated from one source SVG file, with the chosen colors applied.

- Light and dark themes (system preference, plus a remembered toggle).
- No database, CMS, auth, analytics, or backend API. The page is fully static.
- Runtime dependencies: `next`, `react`, and `react-dom` only.

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
| `npm test`          | `node:test` unit tests (catalogue + exporters)   |
| `npm run build`     | Static production build                          |

## Project structure

```
assets/svg/                 Source artwork, one file per asset
  charms/  marks/
src/
  app/                      Routes: page, layout, OG image, icon, robots, sitemap
  lib/
    assets/
      types.ts              Asset schema
      catalog.ts            Library asset metadata
      palette.ts            Shared artwork palette
      load.ts               Build-time loader: joins catalogue + SVG files, validates
      svg.ts                Pure SVG helpers: optimise, parse, validate, format
      filters.ts            Search + filter logic and derived counts
    customize.ts            Color / Ink options and SVG recolouring
    exports/
      index.ts              FORMATS registry + buildExport(asset, format, colours)
      svg.ts react.ts flutter.ts naming.ts
    site.ts                 Site name, copy, URL
    characters/             Studio character engine
      options.ts            Reaction catalogue, categories, colour and outfit presets, StickerSpec
      draw.ts               Drawing engine: cat and ghost anatomy, faces, poses, props, outfits, pair scenes
      color.ts              Shading palette from one picked colour
      export.ts             Studio subjects → SVG / React / Flutter
    sticker.ts              Sticker rendering (PNG/WebP), image copy, download, share
    copy-events.ts          Copy notifications (any component announces, the island listens)
  components/
    ui/                     SegmentedControl, SwatchPicker, Popover, CodeView + highlight,
                            CopyIsland, ThemeToggle, AssetArt, Wordmark, icons
    studio/                 Studio (stage, categories, reaction carousel, controls, exports), ColorPicker
    library/                Workspace (state + URL sync), ControlBar, CategoryNav, AssetCard,
                            Inspector (dialog), StickerPanel, copy action, URL state
    sections/               Header, Hero (+ Studio), LibrarySection, Bento + FillInkDemo, Footer
tests/                      node:test suites
```

Styling uses CSS Modules and design tokens (custom properties) in `src/app/globals.css`. No Tailwind.

- **Type:** the system font (SF Pro on Apple platforms) with Inter as the fallback. Code uses SF Mono or JetBrains Mono.
- **Surfaces:** canvas `#F5F5F7` / `#000`, cards `#FFF` / `#1C1C1E`, and hairline borders. Glass appears only
  where content scrolls beneath it (header and control bar).
- **Radii:** 10px controls, 20px cards, 24px panels.
- **Motion:** one spring curve (`cubic-bezier(0.22, 1, 0.36, 1)`), animating transform and opacity only.
  Everything decorative turns off under `prefers-reduced-motion`.
- **Accessible color:** light mode uses `#6E6E73` for secondary text and `#0066CC` for text links, both at
  least 4.5:1. Code tokens are tuned for contrast on the dark code surface.
- **Art surface:** artwork is drawn for light surfaces, so the default preview canvas stays light in both themes.
  Dark and Grid canvases are there for contrast testing.

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

## Sticker Studio and the drawing engine

Studio stickers aren't stored as files. `src/lib/characters/draw.ts` draws them as SVG from a
`StickerSpec` (species, reaction, colours, outfit, toggles), so every reaction works in every colour.

- **Characters** are drawn in their own 512 × 512 space. The cat has cheek tufts, solid ears with pink insides
  (or optional glass ears), eyes with an eyeliner wing, a :3 mouth, whiskers, a soft face glow, a body with chest
  fluff, paws, and a curled tail. The ghost shares the same face system.
- **Faces** are combinations of eyes (open, happy, wink, closed, teary, wide, angry, droopy, up, side, laugh),
  mouths, brows, blush levels, and tears (single, streams, joy). See the `FACES` table.
- **Poses** move the arms (wave, hold, together, chin, cheeks, kiss, sparkler, crossed, up) and stack props between
  the body and the paws, so held items sit naturally in the paws.
- **Props:** classic glowing heart, mug, thermometer, ice pack, pillow and blanket, night cap, sunglasses, anger and
  question marks, Zz, sweat drops, diya, sparkler, Diwali string lights, and marigolds.
- **Outfits:** a kurta and a saree drape in one shared colour, so couples always match.
- **Pair scenes** place two full characters with one transform each (hug arms are drawn across both).
- **Adding a reaction:** add it to `REACTIONS` in `options.ts` (category, caption, species), give it a face in
  `FACES`, and compose its pose and props in `single()` or `pair()` in `draw.ts`. The tests render every reaction
  for every species and check that all references resolve.
- **Ids** are namespaced with a hash of the spec, so many variants can share a page.
- **Portable mode** drops SVG filters. It's used for Flutter exports, the OG image, and carousel thumbnails.
- `silhouetteOf()` removes whiskers so the die-cut edge follows the body, not the whisker tips.

**Size** sets the exported pixel size (256, 512, or 1024 px). The WhatsApp download is always 512 px WebP.
Exported stickers have no drop shadow and no outline by default, so they look clean on any chat background.

## Sticker output

`src/lib/sticker.ts` renders any asset in the browser:

- **Copy sticker** writes a transparent 512×512 PNG to the clipboard (`ClipboardItem`). Where image copy
  isn't supported, it downloads the PNG instead.
- **PNG** and **WhatsApp WebP** downloads. WebP is used when the browser can encode it, otherwise PNG.
- **Share** opens the system share sheet on devices that support sharing files.
- **White outline** adds an optional die-cut edge that follows only the solid parts of the art (not glows, lights,
  or sparks). It's off by default, so stickers paste cleanly into chats.

## Adding a Charm, Mark, or Duo

1. **Draw** the artwork and export a plain SVG.
   - Charms and Duos use a `0 0 96 96` viewBox. Marks use `0 0 24 24`.
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

   For a **Duo**, use `family: "duo"`, `subject: "pair"`, and add a `relationship`
   with the `memberIds` of the characters it pairs.
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
4. Give it a `language` for highlighting, the `props` to show in the inspector, and a `fileName`.
5. Add tests in `tests/exports.test.ts`.

The format switchers (control bar, hero, inspector) and the bento diagram pick up new formats automatically.

## Categories

`src/lib/assets/filters.ts` defines two tiers in `FILTER_GROUPS`:

- **Collections:** All Assets, Charms, Marks
- **Use cases:** Characters & Mascots, Objects & Rewards, UI & Status Marks, Reactions & Celebrations

Each filter is a predicate over asset data, and counts are always derived. Assets with
`status: "comingSoon"` never appear in these views, so everything shown can be copied.

## URL state

| Param    | Example         | Effect                     |
| -------- | --------------- | -------------------------- |
| `q`      | `?q=happy`      | Search query               |
| `filter` | `?filter=marks` | `charms`, `marks`, `characters`, `objects`, `ui`, `reactions` |
| `color`  | `?color=sky`    | Main fill (a `FILL_OPTIONS` id) |
| `ink`    | `?ink=indigo`   | Linework (an `INK_OPTIONS` id)  |
| `as`     | `?as=react`     | Copy as: `sticker` (default), `svg`, `react`, `flutter` |
| `border` | `?border=on`    | Adds the optional white outline to sticker output |
| `canvas` | `?canvas=dark`  | Preview canvas: `light`, `dark`, `grid` |
| `asset`  | `?asset=wisp`   | Opens that asset in the inspector |

Defaults are left out of the URL, so a customised view can be shared as a link.

## Accessibility notes

- Card names are buttons that open the inspector, and the copy pill is a separate button with its own label
  ("Copy Mochi as React"). On touch devices the pill is always visible.
- The inspector is a native modal `<dialog>`. Focus starts on the title, Escape or a backdrop click closes it,
  and focus returns to the card.
- Popovers close on Escape or an outside click and return focus to their trigger.
- Categories, format switchers, canvas toggles, and swatches are native radio groups (arrow keys work).
- ⌘K / Ctrl K or `/` focuses search; Escape clears it.
- Copy results are announced through a polite live region (the copy island).
- With `prefers-reduced-motion`, all decorative motion is removed.
