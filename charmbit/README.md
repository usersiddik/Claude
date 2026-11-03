# Charmbit

**Tiny charms. Serious code.**
Original SVG characters, icons, and Duos for products people remember.

Charmbit is a single-page library of original SVG assets. Every asset can be copied as
**raw SVG**, a **typed React (TSX) component**, or a **Flutter widget** (`flutter_svg`).
All three formats are generated from one source SVG file.

- No database, CMS, auth, analytics, or backend API. The page is fully static.
- Runtime dependencies: `next`, `react`, and `react-dom` only.
- Interactive client code is limited to search, filters, copy buttons, code tabs, the asset drawer, and the mobile menu.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + tests + production build
```

Requires Node 22.6+ (tests use Node's built-in TypeScript type stripping).

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://example.com`) in production so canonical,
Open Graph, robots, and sitemap URLs are absolute. It defaults to `http://localhost:3000`.

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
    exports/
      index.ts              FORMATS registry + buildExports()
      svg.ts react.ts flutter.ts naming.ts
    site.ts                 Site name, copy, URL
  components/
    ui/                     AssetArt, CodeTabs, CopyButton, Wordmark, icons…
    library/                CharmLibrary (state + URL sync), Discovery, AssetCard, AssetDrawer
    sections/               Header, Hero + CharmShelf, Library, Duos teaser, Built to ship, FAQ, Footer
tests/                      node:test suites
```

Styling uses CSS Modules and design tokens (custom properties) in `src/app/globals.css`.
No Tailwind. Fonts load through `next/font`: Fraunces (display), Instrument Sans (UI), and JetBrains Mono (code).

## Asset schema

Defined in `src/lib/assets/types.ts`. You author `AssetMeta` and the loader adds the rest.

| Field             | Type                                         | Notes                                                    |
| ----------------- | -------------------------------------------- | -------------------------------------------------------- |
| `id`              | `string`                                     | Unique, e.g. `charm-mochi`                               |
| `slug`            | `string`                                     | Kebab-case, unique; matches the SVG filename; used in `?asset=` |
| `title`           | `string`                                     | Display name and default accessible label                |
| `family`          | `"charm" \| "mark" \| "duo"`                 | Selects the SVG folder and component suffix              |
| `subject`         | `"character" \| "object" \| "icon" \| "pair"` |                                                          |
| `description`     | `string`                                     | One sentence on where it fits                            |
| `tags`            | `string[]`                                   | Searchable. The `reaction` tag powers the Reactions filter |
| `palette`         | `PaletteKey[]`                               | Keys from `palette.ts`                                   |
| `traits?`         | `{ character, pose?, expression? }`          | For future pose/expression variants                      |
| `relationship?`   | `{ groupId, kind, occasion, memberIds }`     | Required for Duos; links paired characters               |
| `preview`         | `{ tone: PaletteKey }`                       | Card label tint                                          |
| `relatedAssetIds` | `string[]`                                   | Shown as "On the same shelf"                             |
| `exports`         | `("svg" \| "react" \| "flutter")[]`          | Formats offered                                          |
| `status`          | `"available" \| "comingSoon"`                | `comingSoon` shows a preview without code                |
| `featured?`       | `boolean`                                    | Appears in "Fresh from the shelf"                        |
| `isNew?`          | `boolean`                                    | Appears under the New filter                             |

The loader derives `number`, `sourceSvg` (optimised), `viewBox`, `width`, and `height`.
Every count in the UI (chips, hero facts, results) is computed from this data.

## Adding a Charm, Mark, or Duo

1. **Draw** the artwork and export a plain SVG.
   - Charms and Duos use a `0 0 96 96` viewBox. Marks use `0 0 24 24`.
   - Use `stroke="currentColor"` / `fill="currentColor"` for ink linework so it can be recoloured.
   - Use palette hex values for fills (the test suite rejects off-palette colours; add new ones to `palette.ts`).
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
   files, ids, slugs, and references are valid, the SVG is safe, and colours are on-palette.

## Adding or changing export formats

Exporters are pure functions in `src/lib/exports/` that take
`{ title, slug, family, sourceSvg }` and return a string.

- **SVG** (`svg.ts`): adds `role="img"`, a `<title>`, and intrinsic `width`/`height`.
- **React** (`react.ts`): converts attributes to JSX (`stroke-width` → `strokeWidth`) and wraps
  the result in a typed component with `size`, `color`, `title`, and `className` props. It is
  accessible by default (`role="img"` + `aria-label`), and `title=""` marks it decorative.
  It uses no hooks, so it works in Server Components.
- **Flutter** (`flutter.ts`): a `StatelessWidget` using `SvgPicture.string` with
  `SvgTheme(currentColor: …)`, so the ink colour follows `color`. Requires
  `flutter pub add flutter_svg`.

To add a format (for example Vue or SwiftUI):

1. Create `src/lib/exports/<format>.ts` exporting `to<Format>(asset: ExportSource): string`.
2. Add the id to `ExportFormat` in `src/lib/assets/types.ts`.
3. Register it in `FORMATS` in `src/lib/exports/index.ts` with a label, note, and file extension.
4. Add it to the `exports` array of the assets that should offer it, and add tests in `tests/exports.test.ts`.

The code tabs in the hero and drawer pick up new formats automatically.

## URL state

| Param    | Example         | Effect                     |
| -------- | --------------- | -------------------------- |
| `q`      | `?q=happy`      | Search query               |
| `filter` | `?filter=marks` | `charms`, `marks`, `duos`, `reactions`, `new` |
| `asset`  | `?asset=wisp`   | Opens that asset's drawer  |

## Accessibility notes

- The drawer is a native modal `<dialog>`. It traps focus, closes on Escape or a backdrop click, and returns focus to the opener.
- Copy buttons announce success or failure through a `role="status"` live region.
- Filters are a native radio group, and code tabs follow the WAI-ARIA tabs pattern (arrow keys, Home, End).
- With `prefers-reduced-motion`, all decorative motion is removed.
