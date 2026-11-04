import { optimizeSvg } from "../assets/svg.ts";
import type { ExportFormat } from "../assets/types.ts";
import { FORMATS } from "../exports/index.ts";
import type { CharacterOptions, CoupleOptions } from "./options.ts";
import { renderCharacter, renderCouple } from "./render.ts";

export type StudioSubject = { kind: "single"; options: CharacterOptions } | { kind: "couple"; options: CoupleOptions };

const SPECIES_NAME = { cat: "Cat", ghost: "Ghost" } as const;

export function subjectTitle(subject: StudioSubject): string {
  const reaction = subject.options.reaction;
  const mood = reaction.charAt(0).toUpperCase() + reaction.slice(1);
  return subject.kind === "single" ? `${SPECIES_NAME[subject.options.species]} ${mood}` : `Cat Couple ${mood}`;
}

export function subjectSlug(subject: StudioSubject): string {
  return subject.kind === "single"
    ? `${subject.options.species}-${subject.options.reaction}`
    : `cat-couple-${subject.options.pose}-${subject.options.reaction}`;
}

/** Full-fidelity SVG (blur and texture filters included). */
export function renderSubject(subject: StudioSubject, portable = false): string {
  return subject.kind === "single"
    ? renderCharacter({ ...subject.options, portable })
    : renderCouple({ ...subject.options, portable });
}

/**
 * Code exports reuse the library exporters. Flutter gets the filter-free
 * version because flutter_svg doesn't render SVG filters.
 */
export function exportSubject(subject: StudioSubject, format: ExportFormat): string {
  const definition = FORMATS.find((candidate) => candidate.id === format) ?? FORMATS[0]!;
  const source = {
    title: subjectTitle(subject),
    slug: subjectSlug(subject),
    family: "charm" as const,
    sourceSvg: optimizeSvg(renderSubject(subject, format === "flutter")),
  };
  return definition.build(source);
}
