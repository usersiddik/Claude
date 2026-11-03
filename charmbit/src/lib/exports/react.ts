import { formatMarkup, parseSvg, readViewBox } from "../assets/svg.ts";
import { componentName } from "./naming.ts";
import type { ExportSource } from "./types.ts";

const SPECIAL_ATTRIBUTES: Record<string, string> = {
  class: "className",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
};

/** `stroke-width` → `strokeWidth`; keeps `aria-*` and `data-*` as-is. */
export function toJsxAttributeName(name: string): string {
  if (SPECIAL_ATTRIBUTES[name]) return SPECIAL_ATTRIBUTES[name];
  if (name.startsWith("aria-") || name.startsWith("data-")) return name;
  return name.replace(/[-:]([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function svgToJsx(markup: string): string {
  return markup
    .replace(/<([a-zA-Z]+)([^>]*?)(\/?)>/g, (_match, tag: string, attributes: string, slash: string) => {
      const converted = attributes.replace(/([:\w-]+)=/g, (_attr, name: string) => `${toJsxAttributeName(name)}=`);
      return slash ? `<${tag}${converted} />` : `<${tag}${converted}>`;
    });
}

function quote(value: string): string {
  return JSON.stringify(value);
}

/** A typed, dependency-free React component (works in Server Components). */
export function toReact(asset: ExportSource): string {
  const { attributes, inner } = parseSvg(asset.sourceSvg);
  const viewBox = attributes.viewBox ?? "0 0 24 24";
  const { width } = readViewBox(viewBox);
  const name = componentName(asset.slug, asset.family);
  const body = formatMarkup(svgToJsx(inner), "  ", 3);

  return `import type { SVGProps } from "react";

export type ${name}Props = Omit<SVGProps<SVGSVGElement>, "color"> & {
  /** Width and height: a number (px) or any CSS length. */
  size?: number | string;
  /** Ink colour (the SVG's currentColor). Inherits text colour by default. */
  color?: string;
  /** Accessible name. Pass "" when the graphic is purely decorative. */
  title?: string;
};

export function ${name}({
  size = ${width},
  color = "currentColor",
  title = ${quote(asset.title)},
  className,
  style,
  ...props
}: ${name}Props) {
  const decorative = title === "";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox=${quote(viewBox)}
      width={size}
      height={size}
      fill=${quote(attributes.fill ?? "none")}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
      className={className}
      style={{ color, ...style }}
      {...props}
    >
      {decorative ? null : <title>{title}</title>}
${body}
    </svg>
  );
}

export default ${name};
`;
}
