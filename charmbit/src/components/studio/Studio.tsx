"use client";

import { useDeferredValue, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import {
  BlushGlyph,
  CheckerIcon,
  CodeIcon,
  CopyIcon,
  CoupleIcon,
  DownloadIcon,
  GlassIcon,
  HeartGlyph,
  MoonIcon,
  ShareIcon,
  ShuffleIcon,
  SingleIcon,
  SparkleIcon,
  StickerGlyph,
  StripesIcon,
  SunIcon,
  WhiskersIcon,
} from "@/components/ui/icons";
import { Popover } from "@/components/ui/Popover";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ExportFormat } from "@/lib/assets/types";
import { exportSubject, renderSubject, subjectSlug, subjectTitle, type StudioSubject } from "@/lib/characters/export";
import {
  DEFAULT_CHARACTER,
  EYE_SWATCHES,
  FUR_SWATCHES,
  REACTIONS,
  type Look,
  type Pose,
  type ReactionId,
  type Species,
} from "@/lib/characters/options";
import { silhouetteOf } from "@/lib/characters/render";
import { copyText } from "@/lib/clipboard";
import { announceCopy } from "@/lib/copy-events";
import { canShareFiles, copyImage, download, renderForWhatsApp, renderSticker, shareSticker } from "@/lib/sticker";
import { ColorPicker } from "./ColorPicker";
import styles from "./Studio.module.css";

type Mode = "single" | "couple";
type Backdrop = "aurora" | "light" | "dark" | "grid";
type Size = "s" | "m" | "l";

const SIZE_PX: Record<Size, number> = { s: 256, m: 512, l: 1024 };
const subscribeNothing = () => () => {};
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;

interface Finish {
  glass: boolean;
  blush: boolean;
  stripes: boolean;
  whiskers: boolean;
  heart: boolean;
  edge: boolean;
}

/** The Sticker Studio: one character, any colour, six moods, solo or as a couple. */
export function Studio() {
  const [mode, setMode] = useState<Mode>("single");
  const [species, setSpecies] = useState<Species>("cat");
  const [reaction, setReaction] = useState<ReactionId>(DEFAULT_CHARACTER.reaction);
  const [look, setLook] = useState<Look>({ fur: DEFAULT_CHARACTER.fur, eyes: DEFAULT_CHARACTER.eyes });
  const [partner, setPartner] = useState<Look>({ fur: "#55555F", eyes: "#2F9A68" });
  const [pose, setPose] = useState<Pose>("snuggle");
  const [finish, setFinish] = useState<Finish>({ glass: true, blush: true, stripes: true, whiskers: true, heart: true, edge: true });
  const [size, setSize] = useState<Size>("m");
  const [backdrop, setBackdrop] = useState<Backdrop>("aurora");
  const shareable = useSyncExternalStore(subscribeNothing, canShareFiles, () => false);

  const subject: StudioSubject = useMemo(
    () =>
      mode === "single"
        ? { kind: "single", options: { species, reaction, ...look, glass: finish.glass, blush: finish.blush, stripes: finish.stripes, whiskers: finish.whiskers } }
        : { kind: "couple", options: { a: look, b: partner, pose, reaction, glass: finish.glass, blush: finish.blush, stripes: finish.stripes, whiskers: finish.whiskers, heart: finish.heart } },
    [mode, species, reaction, look, partner, pose, finish],
  );
  const svg = useMemo(() => renderSubject(subject), [subject]);
  const title = subjectTitle(subject);
  const slug = subjectSlug(subject);
  const caption = REACTIONS.find((item) => item.id === reaction)?.caption ?? "";

  // Thumbnails can trail a frame behind while colours are being dragged, and use the
  // filter-free variant: blur and fur texture are invisible at 46px but cost paint time.
  const deferred = useDeferredValue(subject);
  const thumbnails = useMemo(
    () =>
      REACTIONS.map((item) =>
        renderSubject(
          deferred.kind === "single"
            ? { kind: "single", options: { ...deferred.options, reaction: item.id } }
            : { kind: "couple", options: { ...deferred.options, reaction: item.id } },
          true,
        ),
      ),
    [deferred],
  );

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
    download(new Blob([exportSubject(subject, "svg")], { type: "image/svg+xml" }), `${slug}.svg`);
    notify("SVG", true, "Saved");
  }

  async function copyCode(format: ExportFormat, label: string) {
    try {
      await copyText(exportSubject(subject, format));
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
    setReaction(pick(REACTIONS).id);
  }

  const toggle = (key: keyof Finish) => setFinish((previous) => ({ ...previous, [key]: !previous[key] }));
  const isCat = mode === "couple" || species === "cat";
  const toggles: { key: keyof Finish; label: string; icon: ReactNode; show: boolean }[] = [
    { key: "glass", label: isCat ? "Glass ears" : "Glass body", icon: <GlassIcon size={16} />, show: true },
    { key: "blush", label: "Blush", icon: <BlushGlyph size={16} />, show: true },
    { key: "stripes", label: "Stripes", icon: <StripesIcon size={16} />, show: isCat },
    { key: "whiskers", label: "Whiskers", icon: <WhiskersIcon size={16} />, show: isCat },
    { key: "heart", label: "Heart", icon: <HeartGlyph size={16} />, show: mode === "couple" },
    { key: "edge", label: "Sticker edge", icon: <StickerGlyph size={16} />, show: true },
  ];

  return (
    <div className={styles.studio} id="studio">
      <div
        className={styles.stage}
        data-backdrop={backdrop}
        style={{ "--glow": look.fur, "--glow-2": mode === "couple" ? partner.fur : look.eyes } as CSSProperties}
      >
        <div className={styles.stageTop}>
          <SegmentedControl<Mode>
            name="studio-mode"
            label="Mode"
            options={[
              { id: "single", label: "Single", icon: <SingleIcon size={15} /> },
              { id: "couple", label: "Couple", icon: <CoupleIcon size={15} /> },
            ]}
            value={mode}
            onChange={setMode}
            size="sm"
          />
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
          <p key={`${reaction}-${mode}`} className={styles.bubble}>
            {caption}
          </p>
          <AssetArt asset={{ sourceSvg: svg }} label={title} className={styles.art} />
          <span className={styles.floor} aria-hidden="true" />
        </div>

        <div className={styles.dock} role="group" aria-label="Mood">
          {REACTIONS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={styles.dockItem}
              aria-pressed={item.id === reaction}
              onClick={() => setReaction(item.id)}
            >
              <AssetArt asset={{ sourceSvg: thumbnails[index] ?? svg }} className={styles.dockArt} />
              <span>{item.name}</span>
            </button>
          ))}
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

        {mode === "single" ? (
          <SegmentedControl<Species>
            name="studio-species"
            label="Character"
            options={[
              { id: "cat", label: "Cat" },
              { id: "ghost", label: "Ghost" },
            ]}
            value={species}
            onChange={setSpecies}
          />
        ) : (
          <SegmentedControl<Pose>
            name="studio-pose"
            label="Pose"
            options={[
              { id: "snuggle", label: "Head on shoulder" },
              { id: "cheek", label: "Cheek to cheek" },
            ]}
            value={pose}
            onChange={setPose}
          />
        )}

        {mode === "single" ? (
          <div className={styles.colors}>
            <ColorPicker name="studio-fur" label={species === "cat" ? "Fur" : "Body"} swatches={FUR_SWATCHES} value={look.fur} onChange={(fur) => setLook((value) => ({ ...value, fur }))} />
            <ColorPicker name="studio-eyes" label="Eyes" swatches={EYE_SWATCHES} value={look.eyes} onChange={(eyes) => setLook((value) => ({ ...value, eyes }))} />
          </div>
        ) : (
          <div className={styles.colors}>
            <ColorPicker name="studio-fur-a" label="Left cat" swatches={FUR_SWATCHES} value={look.fur} onChange={(fur) => setLook((value) => ({ ...value, fur }))} />
            <ColorPicker name="studio-eyes-a" label="Left eyes" swatches={EYE_SWATCHES} value={look.eyes} onChange={(eyes) => setLook((value) => ({ ...value, eyes }))} custom={false} />
            <ColorPicker name="studio-fur-b" label="Right cat" swatches={FUR_SWATCHES} value={partner.fur} onChange={(fur) => setPartner((value) => ({ ...value, fur }))} />
            <ColorPicker name="studio-eyes-b" label="Right eyes" swatches={EYE_SWATCHES} value={partner.eyes} onChange={(eyes) => setPartner((value) => ({ ...value, eyes }))} custom={false} />
          </div>
        )}

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
          <span className={styles.rowLabel} id="studio-size-label">
            Size
          </span>
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
                SVG <span>vector, glass and all</span>
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
