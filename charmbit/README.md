# Charmbit

**Tiny charms. Serious code.**
Original SVG characters, icons, and Duos for products people remember.

Charmbit is a single-page library of original SVG assets with a developer-first workspace:

- **Hero dock**: pick a featured charm and switch between real SVG, React, and Flutter output.
- **Workspace**: a sticky control bar (search with ⌘K / Ctrl K, an SVG · React · Flutter switcher,
  Fill and Ink popovers, and a Light / Dark / Grid preview canvas), two-tier categories (collections and
  use cases), and a card grid with one-click copy pills.
- **Inspector**: click a card to preview it at 24, 48, 64, and 128px, tweak colors, and read or copy the
  syntax-highlighted code with its customizable props.
- **Copy island**: a floating confirmation pill shows what was copied and in which format.
- **Bento**: four cards covering outputs, the Fill + Ink model, upcoming Duos, and the essentials.

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
    copy-events.ts          Copy notifications (any component announces, the island listens)
  components/
    ui/                     SegmentedControl, SwatchPicker, Popover, CodeView + highlight,
                            CopyIsland, ThemeToggle, AssetArt, Wordmark, icons
    library/                Workspace (state + URL sync), ControlBar, CategoryNav, AssetCard,
                            Inspector (dialog), copy action, URL state
    sections/               Header, Hero + HeroDock, LibrarySection, Bento + FillInkDemo, Footer
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

- **Collections:** All Assets, Charms, Marks, Duos
- **Use cases:** Characters & Mascots, Objects & Rewards, UI & Status Marks, Reactions & Celebrations

Each filter is a predicate over asset data, and counts are always derived. Assets with
`status: "comingSoon"` appear only under **Duos**, with a Preview badge, so every other view is fully
copyable.

## URL state

| Param    | Example         | Effect                     |
| -------- | --------------- | -------------------------- |
| `q`      | `?q=happy`      | Search query               |
| `filter` | `?filter=marks` | `charms`, `marks`, `duos`, `characters`, `objects`, `ui`, `reactions` |
| `color`  | `?color=sky`    | Main fill (a `FILL_OPTIONS` id) |
| `ink`    | `?ink=indigo`   | Linework (an `INK_OPTIONS` id)  |
| `as`     | `?as=react`     | Copy format: `svg`, `react`, `flutter` |
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
