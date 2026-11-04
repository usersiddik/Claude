"use client";

import { useState } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import { CodeView } from "@/components/ui/CodeView";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ExportFormat } from "@/lib/assets/types";
import { copyText } from "@/lib/clipboard";
import { announceCopy } from "@/lib/copy-events";
import { FORMAT_OPTIONS } from "@/components/library/options";
import styles from "./HeroDock.module.css";

export interface DockItem {
  id: string;
  title: string;
  svg: string;
  files: Record<ExportFormat, { name: string; language: "xml" | "tsx" | "dart"; code: string }>;
  formats: { id: ExportFormat; label: string }[];
}

/** A small "app window": pick a charm from the dock, switch formats, see real code. */
export function HeroDock({ items }: { items: readonly DockItem[] }) {
  const [index, setIndex] = useState(0);
  const [format, setFormat] = useState<ExportFormat>("react");
  const [copied, setCopied] = useState(false);
  const item = items[index] ?? items[0];
  if (!item) return null;
  const file = item.files[format];
  const label = item.formats.find((candidate) => candidate.id === format)?.label ?? format;

  async function copy() {
    if (!item) return;
    let ok = true;
    try {
      await copyText(file.code);
    } catch {
      ok = false;
    }
    announceCopy({ title: item.title, format: label, svg: item.svg, ink: null, ok });
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className={styles.window}>
      <div className={styles.titlebar}>
        <span className={styles.lights} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.file}>{file.name}</span>
      </div>

      <div className={styles.panes}>
        <div className={styles.stage}>
          <div className={styles.spotlight}>
            <AssetArt key={item.id} asset={{ sourceSvg: item.svg }} label={item.title} className={styles.hero} />
          </div>
          <div className={styles.dock} role="group" aria-label="Choose a charm">
            {items.map((candidate, position) => (
              <button
                key={candidate.id}
                type="button"
                className={styles.dockItem}
                aria-pressed={position === index}
                aria-label={`Show ${candidate.title}`}
                title={candidate.title}
                onClick={() => setIndex(position)}
              >
                <AssetArt asset={{ sourceSvg: candidate.svg }} className={styles.dockArt} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.codePane}>
          <div className={styles.codeHead}>
            <SegmentedControl<ExportFormat>
              name="hero-format"
              label="Code format"
              options={FORMAT_OPTIONS}
              value={format}
              onChange={setFormat}
              size="sm"
              className={styles.formats}
            />
            <button type="button" className={styles.copy} onClick={copy} aria-label={`Copy ${item.title} as ${label}`}>
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <CodeView
            code={file.code}
            language={file.language}
            label={`${label} code for ${item.title}`}
            swapKey={`${item.id}-${format}`}
            className={styles.code}
          />
        </div>
      </div>
    </div>
  );
}
