/**
 * Festival props and decor: Diwali today, with room for more festivals.
 * Everything that glows or sparks is marked as decor so it never shapes a
 * sticker's die-cut outline.
 */
import { darken, lighten, mix } from "./color.ts";
import { n, sparkle, sparklePath, type Id, type Point } from "./kit.ts";
import { diya } from "./props.ts";

const v = (value: number, s: number) => n(value * s);

/** Warm glow behind a scene. */
export function glow(id: Id, [x, y]: Point, r: number): string {
  return `<circle data-part="glow" cx="${x}" cy="${y}" r="${r}" fill="url(#${id("warm")})"/>`;
}

/** A rangoli seen from above (flat = 1) or on the floor in perspective (flat ≈ 0.42). */
export function rangoli([x, y]: Point, s: number, flat = 1, colors: readonly string[] = ["#E8175D", "#FF9F1C", "#FFD23F", "#2EBF7A", "#3E8FDE"]): string {
  const ring = (count: number, radius: number, size: number, color: string, offset = 0) =>
    Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + offset;
      const px = Math.cos(angle) * radius * s;
      const py = Math.sin(angle) * radius * s;
      const rotate = (angle * 180) / Math.PI + 90;
      return `<path d="M0 ${v(-size, s)}C${v(size * 0.62, s)} ${v(-size * 0.4, s)} ${v(size * 0.5, s)} ${v(size * 0.5, s)} 0 ${v(size * 0.72, s)}C${v(-size * 0.5, s)} ${v(size * 0.5, s)} ${v(-size * 0.62, s)} ${v(-size * 0.4, s)} 0 ${v(-size, s)}Z" fill="${color}" transform="translate(${n(px)} ${n(py)}) rotate(${n(rotate)})"/>`;
    }).join("");
  const dots = (count: number, radius: number, r: number, color: string) =>
    Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      return `<circle cx="${n(Math.cos(angle) * radius * s)}" cy="${n(Math.sin(angle) * radius * s)}" r="${v(r, s)}" fill="${color}"/>`;
    }).join("");
  const [c1, c2, c3, c4, c5] = colors as [string, string, string, string, string];
  return (
    `<g transform="translate(${x} ${y}) scale(1 ${flat})">` +
    `<circle r="${v(150, s)}" fill="#FFF4E0" stroke="#E8C9A0" stroke-width="${v(4, s)}"/>` +
    ring(16, 124, 22, c5, Math.PI / 16) +
    ring(16, 124, 14, "#FFFFFF", Math.PI / 16) +
    dots(32, 146, 4, c3) +
    ring(12, 92, 26, c1) +
    ring(12, 92, 15, c3) +
    ring(8, 54, 24, c4, Math.PI / 8) +
    ring(8, 54, 12, "#FFFFFF", Math.PI / 8) +
    `<circle r="${v(32, s)}" fill="${c2}"/><circle r="${v(20, s)}" fill="${c3}"/><circle r="${v(9, s)}" fill="${c1}"/>` +
    dots(12, 72, 3.5, "#FFFFFF") +
    `</g>`
  );
}

/** Akash kandil: a paper star lantern with tassels. */
export function kandil(id: Id, [x, y]: Point, s: number, color = "#E8175D"): string {
  const light = lighten(color, 0.35);
  const dark = darken(color, 0.3);
  const tassels = [-30, -15, 0, 15, 30]
    .map((dx, index) => `<path d="M${n(x + v(dx, s))} ${n(y + v(56, s))}q${v(index % 2 ? 4 : -4, s)} ${v(40, s)} 0 ${v(76, s)}" stroke="${index % 2 ? "#FFD23F" : color}" stroke-width="${v(6, s)}" stroke-linecap="round" fill="none"/>`)
    .join("");
  return (
    `<circle data-part="glow" cx="${x}" cy="${y}" r="${v(110, s)}" fill="url(#${id("warm")})"/>` +
    `<path d="M${x} ${n(y - v(118, s))}V${n(y - v(70, s))}" stroke="#6B5A44" stroke-width="${v(4, s)}"/>` +
    tassels +
    `<path d="M${x} ${n(y - v(74, s))}L${n(x + v(70, s))} ${y}L${x} ${n(y + v(62, s))}L${n(x - v(70, s))} ${y}Z" fill="${color}" stroke="${dark}" stroke-width="${v(4, s)}" stroke-linejoin="round"/>` +
    `<path d="M${x} ${n(y - v(74, s))}L${n(x + v(28, s))} ${y}L${x} ${n(y + v(62, s))}L${n(x - v(28, s))} ${y}Z" fill="${light}" opacity="0.85"/>` +
    `<path d="M${n(x - v(70, s))} ${y}H${n(x + v(70, s))}" stroke="#FFD23F" stroke-width="${v(8, s)}"/>` +
    `<path d="M${n(x - v(52, s))} ${n(y - v(17, s))}L${n(x + v(52, s))} ${n(y - v(17, s))}M${n(x - v(48, s))} ${n(y + v(16, s))}L${n(x + v(48, s))} ${n(y + v(16, s))}" stroke="#FFFFFF" stroke-width="${v(3, s)}" opacity="0.6" stroke-dasharray="${v(6, s)} ${v(6, s)}"/>` +
    `<circle cx="${x}" cy="${y}" r="${v(14, s)}" fill="#FFF3C4"/>` +
    `<path d="${sparklePath([x, y], 9 * s)}" fill="#FFFFFF"/>`
  );
}

/** Anar: a cone fountain on the ground throwing sparks up. */
export function anar(id: Id, [x, y]: Point, s: number): string {
  const sparks = Array.from({ length: 22 }, (_, index) => {
    const spread = (index / 21 - 0.5) * 1.5;
    const height = (140 + (index % 4) * 30) * s;
    const ex = x + Math.sin(spread) * 120 * s;
    const ey = y - v(60, s) - Math.cos(spread) * height;
    const color = ["#FFE27A", "#FFFFFF", "#FFB627", "#FF7AA2"][index % 4]!;
    return `<path d="M${x} ${n(y - v(64, s))}Q${n(x + Math.sin(spread) * 60 * s)} ${n(ey - 30 * s)} ${n(ex)} ${n(ey + 20 * s)}" stroke="${color}" stroke-width="${v(index % 3 ? 2.6 : 3.6, s)}" stroke-linecap="round" fill="none" opacity="0.9"/><circle cx="${n(ex)}" cy="${n(ey + 22 * s)}" r="${v(3.4, s)}" fill="${color}"/>`;
  }).join("");
  return (
    `<g data-part="decor"><circle cx="${x}" cy="${n(y - v(150, s))}" r="${v(130, s)}" fill="url(#${id("warm")})"/>${sparks}</g>` +
    `<path d="M${n(x - v(36, s))} ${y}L${n(x - v(12, s))} ${n(y - v(66, s))}H${n(x + v(12, s))}L${n(x + v(36, s))} ${y}Z" fill="#E8175D" stroke="#8E0F3A" stroke-width="${v(4, s)}" stroke-linejoin="round"/>` +
    `<path d="M${n(x - v(28, s))} ${n(y - v(20, s))}H${n(x + v(28, s))}M${n(x - v(20, s))} ${n(y - v(44, s))}H${n(x + v(20, s))}" stroke="#FFD23F" stroke-width="${v(7, s)}"/>` +
    `<ellipse cx="${x}" cy="${n(y - v(66, s))}" rx="${v(13, s)}" ry="${v(5, s)}" fill="#FFF3C4"/>`
  );
}

/** A firework burst. */
export function burst([x, y]: Point, s: number, color: string, accent = "#FFFFFF"): string {
  const rays = Array.from({ length: 14 }, (_, index) => {
    const angle = (index / 14) * Math.PI * 2;
    const inner = 18 * s;
    const outer = (index % 2 ? 62 : 80) * s;
    return `M${n(x + Math.cos(angle) * inner)} ${n(y + Math.sin(angle) * inner)}L${n(x + Math.cos(angle) * outer)} ${n(y + Math.sin(angle) * outer)}`;
  }).join("");
  const tips = Array.from({ length: 14 }, (_, index) => {
    const angle = (index / 14) * Math.PI * 2;
    const r = (index % 2 ? 72 : 92) * s;
    return `<circle cx="${n(x + Math.cos(angle) * r)}" cy="${n(y + Math.sin(angle) * r)}" r="${v(index % 2 ? 4 : 5.5, s)}" fill="${index % 2 ? accent : color}"/>`;
  }).join("");
  return `<path d="${rays}" stroke="${color}" stroke-width="${v(6, s)}" stroke-linecap="round"/><path d="${rays}" stroke="${accent}" stroke-width="${v(2, s)}" stroke-linecap="round" opacity="0.8"/>${tips}<circle cx="${x}" cy="${y}" r="${v(10, s)}" fill="${accent}"/>`;
}

/** A gift box with a bow. */
export function giftBox([x, y]: Point, s: number, color: string, ribbon = "#FFD23F"): string {
  const dark = darken(color, 0.28);
  return (
    `<rect x="${n(x - v(58, s))}" y="${n(y - v(30, s))}" width="${v(116, s)}" height="${v(82, s)}" rx="${v(8, s)}" fill="${color}" stroke="${dark}" stroke-width="${v(4, s)}"/>` +
    `<rect x="${n(x - v(66, s))}" y="${n(y - v(50, s))}" width="${v(132, s)}" height="${v(28, s)}" rx="${v(8, s)}" fill="${lighten(color, 0.12)}" stroke="${dark}" stroke-width="${v(4, s)}"/>` +
    `<path d="M${x} ${n(y - v(50, s))}V${n(y + v(52, s))}" stroke="${ribbon}" stroke-width="${v(16, s)}"/>` +
    `<path d="M${x} ${n(y - v(52, s))}C${n(x - v(20, s))} ${n(y - v(92, s))} ${n(x - v(62, s))} ${n(y - v(80, s))} ${n(x - v(46, s))} ${n(y - v(56, s))}C${n(x - v(36, s))} ${n(y - v(46, s))} ${n(x - v(14, s))} ${n(y - v(48, s))} ${x} ${n(y - v(52, s))}C${n(x + v(14, s))} ${n(y - v(48, s))} ${n(x + v(36, s))} ${n(y - v(46, s))} ${n(x + v(46, s))} ${n(y - v(56, s))}C${n(x + v(62, s))} ${n(y - v(80, s))} ${n(x + v(20, s))} ${n(y - v(92, s))} ${x} ${n(y - v(52, s))}Z" fill="${ribbon}" stroke="${darken(ribbon, 0.3)}" stroke-width="${v(3.5, s)}" stroke-linejoin="round"/>` +
    `<circle cx="${x}" cy="${n(y - v(52, s))}" r="${v(9, s)}" fill="${darken(ribbon, 0.12)}"/>` +
    `<path d="M${n(x - v(48, s))} ${n(y - v(16, s))}v${v(54, s)}" stroke="#FFFFFF" stroke-width="${v(5, s)}" stroke-linecap="round" opacity="0.35"/>`
  );
}

/** Laddoos piled on a brass plate. */
export function laddooPlate([x, y]: Point, s: number): string {
  const laddoo = (lx: number, ly: number, r = 17) =>
    `<circle cx="${n(x + v(lx, s))}" cy="${n(y + v(ly, s))}" r="${v(r, s)}" fill="#FFA62B" stroke="#C26A12" stroke-width="${v(3, s)}"/>` +
    `<circle cx="${n(x + v(lx - 5, s))}" cy="${n(y + v(ly - 6, s))}" r="${v(4, s)}" fill="#FFE0A3"/>` +
    `<circle cx="${n(x + v(lx + 6, s))}" cy="${n(y + v(ly + 3, s))}" r="${v(1.8, s)}" fill="#C26A12"/><circle cx="${n(x + v(lx - 4, s))}" cy="${n(y + v(ly + 6, s))}" r="${v(1.8, s)}" fill="#C26A12"/>`;
  return (
    `<ellipse cx="${x}" cy="${n(y + v(14, s))}" rx="${v(78, s)}" ry="${v(20, s)}" fill="#D9A228" stroke="#9A6A12" stroke-width="${v(4, s)}"/>` +
    `<ellipse cx="${x}" cy="${n(y + v(10, s))}" rx="${v(62, s)}" ry="${v(12, s)}" fill="#F5CF6A"/>` +
    laddoo(-34, 0) +
    laddoo(0, 0) +
    laddoo(34, 0) +
    laddoo(-17, -26) +
    laddoo(17, -26) +
    laddoo(0, -52) +
    `<path d="${sparklePath([x + 40 * s, y - 62 * s], 8 * s)}" fill="#FFFFFF"/>`
  );
}

/** Aarti thali: brass plate with a diya, flowers, and kumkum. */
export function thali(id: Id, [x, y]: Point, s: number): string {
  const petals = (px: number, py: number, color: string) =>
    Array.from({ length: 6 }, (_, index) => {
      const angle = (index / 6) * Math.PI * 2;
      return `<circle cx="${n(x + v(px, s) + Math.cos(angle) * 6 * s)}" cy="${n(y + v(py, s) + Math.sin(angle) * 3.4 * s)}" r="${v(5, s)}" fill="${color}"/>`;
    }).join("");
  return (
    `<ellipse cx="${x}" cy="${y}" rx="${v(92, s)}" ry="${v(26, s)}" fill="#D9A228" stroke="#9A6A12" stroke-width="${v(4, s)}"/>` +
    `<ellipse cx="${x}" cy="${n(y - v(3, s))}" rx="${v(76, s)}" ry="${v(17, s)}" fill="#F5CF6A"/>` +
    `<path d="M${n(x - v(70, s))} ${n(y + v(2, s))}q${v(10, s)} ${v(8, s)} ${v(20, s)} 0t${v(20, s)} 0t${v(20, s)} 0t${v(20, s)} 0t${v(20, s)} 0t${v(20, s)} 0t${v(20, s)} 0" stroke="#C98A1A" stroke-width="${v(2.4, s)}" fill="none" opacity="0.6"/>` +
    petals(-50, -4, "#FF9F1C") +
    petals(52, -4, "#E8175D") +
    `<ellipse cx="${n(x - v(28, s))}" cy="${n(y + v(4, s))}" rx="${v(9, s)}" ry="${v(4, s)}" fill="#D61F3A"/><ellipse cx="${n(x + v(28, s))}" cy="${n(y + v(4, s))}" rx="${v(9, s)}" ry="${v(4, s)}" fill="#FFC233"/>` +
    diya(id, [x, y - 16 * s], 0.62 * s)
  );
}

/** Marigold and mango-leaf toran across the top. */
export function toran(): string {
  const leaves = Array.from({ length: 9 }, (_, index) => {
    const x = 40 + index * 54;
    const sag = 28 * Math.sin((index / 8) * Math.PI);
    const y = 60 + sag;
    return `<path d="M${x} ${n(y)}C${x - 16} ${n(y + 24)} ${x - 10} ${n(y + 54)} ${x} ${n(y + 66)}C${x + 10} ${n(y + 54)} ${x + 16} ${n(y + 24)} ${x} ${n(y)}Z" fill="${index % 2 ? "#2E9E5A" : "#3DB86A"}" stroke="#1E6E3E" stroke-width="3"/><path d="M${x} ${n(y + 6)}V${n(y + 60)}" stroke="#1E6E3E" stroke-width="2" opacity="0.6"/>`;
  }).join("");
  const flowers = Array.from({ length: 10 }, (_, index) => {
    const x = 13 + index * 54;
    const sag = 28 * Math.sin((index / 9) * Math.PI);
    return marigoldBall([x, 52 + sag], index % 2 ? "#FF9F1C" : "#FFC21A");
  }).join("");
  const strands = [94, 202, 310, 418]
    .map((x) => {
      const top = 60 + 28 * Math.sin(((x - 13) / 486) * Math.PI);
      return `<path d="M${x} ${n(top)}V${n(top + 120)}" stroke="#6B5A44" stroke-width="2"/>${[0, 1, 2, 3].map((k) => marigoldBall([x, top + 28 + k * 26], k % 2 ? "#FFC21A" : "#FF7A1C", 0.62)).join("")}`;
    })
    .join("");
  return `<path d="M0 50Q256 106 512 50" stroke="#6B5A44" stroke-width="3" fill="none"/>${strands}${leaves}${flowers}`;
}

export function marigoldBall([x, y]: Point, color: string, s = 1): string {
  const petals = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2;
    return `<circle cx="${n(x + Math.cos(angle) * 10 * s)}" cy="${n(y + Math.sin(angle) * 10 * s)}" r="${v(8, s)}" fill="${index % 2 ? color : mix(color, "#FF5E00", 0.3)}"/>`;
  }).join("");
  return petals + `<circle cx="${x}" cy="${y}" r="${v(9, s)}" fill="${mix(color, "#FFE27A", 0.4)}"/><circle cx="${n(x - 3 * s)}" cy="${n(y - 3 * s)}" r="${v(3, s)}" fill="#FFFFFF" opacity="0.5"/>`;
}

/** A firework rocket streaking up. */
export function rocket([x, y]: Point, s: number, angle = -20): string {
  return (
    `<g transform="rotate(${angle} ${x} ${y})">` +
    `<g data-part="decor"><path d="M${x} ${n(y + v(40, s))}Q${n(x - v(10, s))} ${n(y + v(90, s))} ${x} ${n(y + v(150, s))}" stroke="#FFD23F" stroke-width="${v(6, s)}" stroke-linecap="round" stroke-dasharray="${v(2, s)} ${v(12, s)}" fill="none"/></g>` +
    `<path d="M${x} ${n(y - v(44, s))}C${n(x + v(16, s))} ${n(y - v(30, s))} ${n(x + v(16, s))} ${n(y)} ${n(x + v(14, s))} ${n(y + v(30, s))}H${n(x - v(14, s))}C${n(x - v(16, s))} ${n(y)} ${n(x - v(16, s))} ${n(y - v(30, s))} ${x} ${n(y - v(44, s))}Z" fill="#3E8FDE" stroke="#1F4E8A" stroke-width="${v(4, s)}"/>` +
    `<path d="M${n(x - v(14, s))} ${n(y + v(10, s))}L${n(x - v(28, s))} ${n(y + v(36, s))}H${n(x - v(12, s))}M${n(x + v(14, s))} ${n(y + v(10, s))}L${n(x + v(28, s))} ${n(y + v(36, s))}H${n(x + v(12, s))}" fill="#E8175D" stroke="#8E0F3A" stroke-width="${v(4, s)}" stroke-linejoin="round"/>` +
    `<circle cx="${x}" cy="${n(y - v(10, s))}" r="${v(7, s)}" fill="#FFFFFF" stroke="#1F4E8A" stroke-width="${v(3, s)}"/>` +
    `<path d="M${x} ${n(y + v(32, s))}C${n(x + v(12, s))} ${n(y + v(48, s))} ${n(x + v(8, s))} ${n(y + v(62, s))} ${x} ${n(y + v(72, s))}C${n(x - v(8, s))} ${n(y + v(62, s))} ${n(x - v(12, s))} ${n(y + v(48, s))} ${x} ${n(y + v(32, s))}Z" fill="#FFB627"/>` +
    `</g>`
  );
}

/** A lit taper for lighting diyas. */
export function taper(from: Point, to: Point): string {
  const [x, y] = to;
  return (
    `<path d="M${n(from[0])} ${n(from[1])}L${x} ${y}" stroke="#F5E6C8" stroke-width="8" stroke-linecap="round"/>` +
    `<path d="M${x} ${n(y - 26)}C${x + 9} ${n(y - 14)} ${x + 9} ${n(y - 4)} ${x} ${y}C${x - 9} ${n(y - 4)} ${x - 9} ${n(y - 14)} ${x} ${n(y - 26)}Z" fill="#FFC21A"/>` +
    `<path d="M${x} ${n(y - 14)}C${x + 3} ${n(y - 8)} ${x + 3} ${n(y - 3)} ${x} ${n(y - 2)}C${x - 3} ${n(y - 3)} ${x - 3} ${n(y - 8)} ${x} ${n(y - 14)}Z" fill="#FFFFFF"/>`
  );
}

/** Small diya-row footer. */
export function diyaRow(id: Id, y: number, xs: readonly number[], s: number): string {
  return xs.map((x) => diya(id, [x, y], s)).join("");
}

export { sparkle };
