# Charmbit

**Tiny charms. Serious code.**
Original SVG characters, icons, and Duos for products people remember.

Charmbit is a single-page library of original SVG assets. Pick a **Color** (main fill) and an
**Ink** (linework), choose **Copy as** SVG, React, or Flutter, then click any asset to copy it.
All three formats are generated from one source SVG file, with your colour choices applied.

- No database, CMS, auth, analytics, or backend API. The page is fully static.
- Runtime dependencies: `next`, `react`, and `react-dom` only.
- Interactive client code is limited to the library toolbar (search, filters, colour, format), copy-on-click cards, and the mobile menu.

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
  charms/  marks/  duos/
src/
  app/                      Routes: page, layout, OG image, icon, robots, sitemap
  lib/
    assets/
      types.ts              Asset schema
      catalog.ts            Asset metadata (order = catalogue numbers)
      palette.ts            Shared artwork palette
      load.ts               Build-time loader: joins catalogue + SVG files, validates
      svg.ts                Pure SVG helpers: optimise, parse, validate, format
      filters.ts            Search + filter logic and derived counts
    customize.ts            Color / Ink options and SVG recolouring
    exports/
      index.ts              FORMATS registry + buildExport(asset, format, colours)
      svg.ts react.ts flutter.ts naming.ts
    site.ts                 Site name, copy, URL
  components/
    ui/                     AssetArt, Swatches, Segmented, Wordmark, SectionHeading, icons
    library/                CharmLibrary (state, URL sync, copy + toast), Toolbar, AssetCard
    sections/               Header, Hero, Library, How it works, Duos teaser, FAQ, Footer
tests/                      node:test suites
```

Styling uses CSS Modules and design tokens (custom properties) in `src/app/globals.css`. No Tailwind.
One typeface (Instrument Sans via `next/font`), neutral surfaces, hairline borders, and radii of 4px
(controls) and 6px (cards and panels). The artwork carries the colour; the interface stays quiet.

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
- **Ink** (`INK_OPTIONS`): sets the linework colour (`currentColor`). With the default Ink, exports
  keep `currentColor` so they inherit text colour. A custom Ink is written into the export: a `color`
  attribute on the SVG, the default `color` prop in React, and the default `color` in Flutter.

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
4. Add tests in `tests/exports.test.ts`.

The **Copy as** control and the "How it works" format list pick up new formats automatically.

## URL state

| Param    | Example         | Effect                     |
| -------- | --------------- | -------------------------- |
| `q`      | `?q=happy`      | Search query               |
| `filter` | `?filter=marks` | `charms`, `marks`, `duos`, `reactions`, `new` |
| `color`  | `?color=sky`    | Main fill (a `FILL_OPTIONS` id) |
| `ink`    | `?ink=indigo`   | Linework (an `INK_OPTIONS` id)  |
| `as`     | `?as=react`     | Copy format: `svg`, `react`, `flutter` |

Defaults are left out of the URL, so a customised view can be shared as a link.

## Accessibility notes

- Every card is a native `<button>` named "Copy {name} as {format}". Copying shows a check on the card and a toast in a polite live region.
- Filters, colour swatches, and the format control are native radio groups (arrow keys work).
- `/` focuses search; Escape clears it.
- With `prefers-reduced-motion`, all decorative motion is removed.
