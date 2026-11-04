"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import {
  BlushGlyph,
  CheckerIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  GlassIcon,
  MoonIcon,
  ShareIcon,
  ShuffleIcon,
  SparkleIcon,
  StickerGlyph,
  StripesIcon,
  SunIcon,
  WhiskersIcon,
} from "@/components/ui/icons";
import { Popover } from "@/components/ui/Popover";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ExportFormat } from "@/lib/assets/types";
import { silhouetteOf } from "@/lib/characters/draw";
import { exportSpec, renderSpec, stickerSlug, stickerTitle } from "@/lib/characters/export";
import {
  CATEGORIES,
  DEFAULT_SPEC,
  EYE_SWATCHES,
  findReaction,
  FUR_SWATCHES,
  OUTFIT_SWATCHES,
  REACTIONS,
  type Category,
  type Look,
  type ReactionId,
  type Species,
  type StickerSpec,
} from "@/lib/characters/options";
import { copyText } from "@/lib/clipboard";
import { announceCopy } from "@/lib/copy-events";
import { canShareFiles, copyImage, download, renderForWhatsApp, renderSticker, shareSticker } from "@/lib/sticker";
import { ColorPicker } from "./ColorPicker";
import styles from "./Studio.module.css";

type Backdrop = "aurora" | "light" | "dark" | "grid";
type Size = "s" | "m" | "l";
type Filter = "all" | Category;

const SIZE_PX: Record<Size, number> = { s: 256, m: 512, l: 1024 };
const subscribeNothing = () => () => {};
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Finish {
  glass: boolean;
  blush: boolean;
  stripes: boolean;
  whiskers: boolean;
  edge: boolean;
}

/** The Sticker Studio: pick a mood from the carousel, then make it yours. */
export function Studio() {
  const [species, setSpecies] = useState<Species>(DEFAULT_SPEC.species);
  const [reaction, setReaction] = useState<ReactionId>(DEFAULT_SPEC.reaction);
  const [filter, setFilter] = useState<Filter>("all");
  const [look, setLook] = useState<Look>(DEFAULT_SPEC.look);
  const [partner, setPartner] = useState<Look>(DEFAULT_SPEC.partner);
  const [outfit, setOutfit] = useState(DEFAULT_SPEC.outfit);
  const [finish, setFinish] = useState<Finish>({ glass: false, blush: true, stripes: true, whiskers: true, edge: true });
  const [size, setSize] = useState<Size>("m");
  const [backdrop, setBackdrop] = useState<Backdrop>("aurora");
  const shareable = useSyncExternalStore(subscribeNothing, canShareFiles, () => false);

  const current = findReaction(reaction);
  const spec: StickerSpec = useMemo(
    () => ({ species, reaction, look, partner, outfit, glass: finish.glass, blush: finish.blush, stripes: finish.stripes, whiskers: finish.whiskers }),
    [species, reaction, look, partner, outfit, finish],
  );
  const svg = useMemo(() => renderSpec(spec), [spec]);
  const title = stickerTitle(spec);
  const slug = stickerSlug(spec);

  // Reactions available for this character, filtered by category.
  const available = useMemo(() => REACTIONS.filter((item) => item.species.includes(species)), [species]);
  const visible = useMemo(() => available.filter((item) => filter === "all" || item.category === filter), [available, filter]);
  const categories = CATEGORIES.filter((category) => available.some((item) => item.category === category.id));

  // Thumbnails trail a frame behind and use the filter-free variant (cheaper to paint at 52px).
  const deferred = useDeferredValue(spec);
  const thumbnails = useMemo(
    () => new Map(visible.map((item) => [item.id, renderSpec({ ...deferred, reaction: item.id }, true)])),
    [visible, deferred],
  );

  /* Carousel ---------------------------------------------------------------- */
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const measure = useCallback(() => {
    const node = track.current;
    if (!node) return;
    setEdges({ start: node.scrollLeft <= 2, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);
  const scroll = (direction: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  function chooseFilter(next: Filter) {
    setFilter(next);
    const first = available.find((item) => next === "all" || item.category === next);
    if (first && next !== "all" && findReaction(reaction).category !== next) setReaction(first.id);
    track.current?.scrollTo({ left: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  }

  function chooseSpecies(next: Species) {
    setSpecies(next);
    if (!findReaction(reaction).species.includes(next)) setReaction("hi");
    if (!REACTIONS.some((item) => item.species.includes(next) && (filter === "all" || item.category === filter))) setFilter("all");
  }

  /* Exports ----------------------------------------------------------------- */
  const stickerOptions = { border: finish.edge, silhouette: silhouetteOf(svg) };
  const notify = (format: string, ok: boolean, verb?: "Copied" | "Saved") => announceCopy({ title, format, svg, ink: null, ok, verb });

  async function copySticker() {
    const blob = renderSticker(svg, { ...stickerOptions, size: SIZE_PX[size] });
    try {
      await copyImage(blob);
      notify("Sticker", true);
    } catch {
      try {
        download(await blob, `${slug}.png`);
        notify("PNG", true, "Saved");
      } catch {
        notify("Sticker", false);
      }
    }
  }

  async function savePng() {
    try {
      download(await renderSticker(svg, { ...stickerOptions, size: SIZE_PX[size] }), `${slug}-${SIZE_PX[size]}.png`);
      notify(`${SIZE_PX[size]}px PNG`, true, "Saved");
    } catch {
      notify("PNG", false);
    }
  }

  async function saveWhatsApp() {
    try {
      const { blob, extension } = await renderForWhatsApp(svg, stickerOptions);
      download(blob, `${slug}-sticker.${extension}`);
      notify(extension === "webp" ? "WhatsApp WebP" : "PNG", true, "Saved");
    } catch {
      notify("WebP", false);
    }
  }

  function saveSvg() {
    download(new Blob([exportSpec(spec, "svg")], { type: "image/svg+xml" }), `${slug}.svg`);
    notify("SVG", true, "Saved");
  }

  async function copyCode(format: ExportFormat, label: string) {
    try {
      await copyText(exportSpec(spec, format));
      notify(label, true);
    } catch {
      notify(label, false);
    }
  }

  async function share() {
    try {
      await shareSticker(await renderSticker(svg, { ...stickerOptions, size: SIZE_PX[size] }), `${slug}.png`, title);
    } catch {
      // Closing the share sheet rejects; nothing to report.
    }
  }

  function surprise() {
    setLook({ fur: pick(FUR_SWATCHES).hex, eyes: pick(EYE_SWATCHES).hex });
    setPartner({ fur: pick(FUR_SWATCHES).hex, eyes: pick(EYE_SWATCHES).hex });
    setOutfit(pick(OUTFIT_SWATCHES).hex);
    setReaction(pick(visible.length > 0 ? visible : available).id);
  }

  const toggle = (key: keyof Finish) => setFinish((previous) => ({ ...previous, [key]: !previous[key] }));
  const isCat = species === "cat" || Boolean(current.pair);
  const toggles: { key: keyof Finish; label: string; icon: ReactNode; show: boolean }[] = [
    { key: "glass", label: isCat ? "Glass ears" : "Glass body", icon: <GlassIcon size={16} />, show: true },
    { key: "blush", label: "Blush", icon: <BlushGlyph size={16} />, show: true },
    { key: "stripes", label: "Stripes", icon: <StripesIcon size={16} />, show: isCat },
    { key: "whiskers", label: "Whiskers", icon: <WhiskersIcon size={16} />, show: isCat },
    { key: "edge", label: "Sticker edge", icon: <StickerGlyph size={16} />, show: true },
  ];

  return (
    <div className={styles.studio} id="studio">
      <div className={styles.stage} data-backdrop={backdrop} style={{ "--glow": look.fur, "--glow-2": current.pair ? partner.fur : current.outfit ? outfit : look.eyes } as CSSProperties}>
        <div className={styles.stageTop}>
          <div className={styles.categories} role="group" aria-label="Categories">
            {[{ id: "all" as const, name: "All" }, ...categories].map((category) => (
              <button
                key={category.id}
                type="button"
                className={styles.category}
                aria-pressed={filter === category.id}
                onClick={() => chooseFilter(category.id)}
              >
                {category.id === "diwali" ? <SparkleIcon size={13} /> : null}
                {category.name}
              </button>
            ))}
          </div>
          <SegmentedControl<Backdrop>
            name="studio-backdrop"
            label="Backdrop"
            options={[
              { id: "aurora", label: "Aurora backdrop", icon: <SparkleIcon size={15} /> },
              { id: "light", label: "Light backdrop", icon: <SunIcon size={15} /> },
              { id: "dark", label: "Dark backdrop", icon: <MoonIcon size={15} /> },
              { id: "grid", label: "Transparent backdrop", icon: <CheckerIcon size={15} /> },
            ]}
            value={backdrop}
            onChange={setBackdrop}
            iconOnly
            size="sm"
          />
        </div>

        <div className={styles.viewport}>
          <span className={styles.halo} aria-hidden="true" />
          <p key={reaction} className={styles.bubble}>
            {current.caption}
          </p>
          <AssetArt key={`${reaction}-${species}`} asset={{ sourceSvg: svg }} label={title} className={styles.art} />
        </div>

        <div className={styles.carousel}>
          <button type="button" className={styles.arrow} aria-label="Previous reactions" onClick={() => scroll(-1)} disabled={edges.start}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m14.5 6-6 6 6 6" />
            </svg>
          </button>
          <div ref={track} className={styles.track} role="group" aria-label="Reactions" onScroll={measure}>
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.tile}
                aria-pressed={item.id === reaction}
                onClick={() => setReaction(item.id)}
              >
                <AssetArt asset={{ sourceSvg: thumbnails.get(item.id) ?? svg }} className={styles.tileArt} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <button type="button" className={styles.arrow} aria-label="More reactions" onClick={() => scroll(1)} disabled={edges.end}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9.5 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Make it yours</h2>
          <button type="button" className={styles.surprise} onClick={surprise}>
            <ShuffleIcon size={16} />
            Surprise me
          </button>
        </div>

        <SegmentedControl<Species>
          name="studio-species"
          label="Character"
          options={[
            { id: "cat", label: "Cat" },
            { id: "ghost", label: "Ghost" },
          ]}
          value={species}
          onChange={chooseSpecies}
        />

        <div className={styles.colors}>
          <ColorPicker
            name="studio-fur"
            label={current.pair ? "Left cat" : species === "cat" ? "Fur" : "Body"}
            swatches={FUR_SWATCHES}
            value={look.fur}
            onChange={(fur) => setLook((value) => ({ ...value, fur }))}
          />
          <ColorPicker name="studio-eyes" label={current.pair ? "Left eyes" : "Eyes"} swatches={EYE_SWATCHES} value={look.eyes} onChange={(eyes) => setLook((value) => ({ ...value, eyes }))} />
          {current.pair ? (
            <>
              <ColorPicker name="studio-partner" label="Right cat" swatches={FUR_SWATCHES} value={partner.fur} onChange={(fur) => setPartner((value) => ({ ...value, fur }))} />
              <ColorPicker name="studio-partner-eyes" label="Right eyes" swatches={EYE_SWATCHES} value={partner.eyes} onChange={(eyes) => setPartner((value) => ({ ...value, eyes }))} custom={false} />
            </>
          ) : null}
          {current.outfit && (species === "cat" || current.pair) ? (
            <ColorPicker name="studio-outfit" label={current.pair ? "Matching outfits" : "Outfit"} swatches={OUTFIT_SWATCHES} value={outfit} onChange={setOutfit} />
          ) : null}
        </div>

        <div className={styles.toggles} role="group" aria-label="Finish">
          {toggles
            .filter((item) => item.show)
            .map((item) => (
              <button key={item.key} type="button" className={styles.toggle} aria-pressed={finish[item.key]} onClick={() => toggle(item.key)}>
                {item.icon}
                {item.label}
              </button>
            ))}
        </div>

        <div className={styles.sizeRow}>
          <span className={styles.rowLabel}>Size</span>
          <SegmentedControl<Size>
            name="studio-size"
            label="Export size"
            options={[
              { id: "s", label: "S · 256" },
              { id: "m", label: "M · 512" },
              { id: "l", label: "L · 1024" },
            ]}
            value={size}
            onChange={setSize}
            size="sm"
          />
        </div>

        <div className={styles.exports}>
          <button type="button" className={styles.primary} onClick={copySticker}>
            <CopyIcon size={17} />
            Copy sticker
          </button>
          <Popover label="Download options" align="end" trigger={<><DownloadIcon size={16} /> Download</>}>
            <div className={styles.menu}>
              <button type="button" data-dismiss onClick={savePng}>
                PNG <span>{SIZE_PX[size]} px · transparent</span>
              </button>
              <button type="button" data-dismiss onClick={saveWhatsApp}>
                WhatsApp sticker <span>512 px WebP</span>
              </button>
              <button type="button" data-dismiss onClick={saveSvg}>
                SVG <span>vector, scales to any size</span>
              </button>
            </div>
          </Popover>
          <Popover label="Copy code" align="end" trigger={<><CodeIcon size={16} /> Code</>}>
            <div className={styles.menu}>
              <button type="button" data-dismiss onClick={() => copyCode("svg", "SVG code")}>
                SVG <span>inline markup</span>
              </button>
              <button type="button" data-dismiss onClick={() => copyCode("react", "React")}>
                React <span>typed TSX component</span>
              </button>
              <button type="button" data-dismiss onClick={() => copyCode("flutter", "Flutter")}>
                Flutter <span>flutter_svg widget, filter-free</span>
              </button>
            </div>
          </Popover>
          {shareable ? (
            <button type="button" className={styles.secondary} onClick={share}>
              <ShareIcon size={16} />
              Share
            </button>
          ) : null}
        </div>
        <p className={styles.hint}>Paste stickers straight into WhatsApp, iMessage, Telegram, or Slack.</p>
      </div>
    </div>
  );
}
