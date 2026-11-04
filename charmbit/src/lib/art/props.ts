/** Props held by or placed around characters. */
import { dropPath, n, pt, sparklePath, type Id, type Point } from "./kit.ts";
import type { FaceAnchors } from "./face.ts";

/* Props ------------------------------------------------------------------- */

export function mug(id: Id, [x, y]: Point, s = 1): string {
  const v = (value: number) => n(value * s);
  return (
    `<path d="M${n(x + v(30))} ${n(y - v(18))}c${v(26)} ${v(-4)} ${v(30)} ${v(30)} ${v(2)} ${v(32)}" stroke="#D9D6E2" stroke-width="${v(10)}" stroke-linecap="round" fill="none"/>` +
    `<rect x="${n(x - v(38))}" y="${n(y - v(34))}" width="${v(72)}" height="${v(70)}" rx="${v(16)}" fill="url(#${id("mug")})" stroke="#A7A3B5" stroke-width="${v(3)}"/>` +
    `<rect x="${n(x - v(38))}" y="${n(y + v(6))}" width="${v(72)}" height="${v(10)}" fill="#F28C38" opacity="0.9"/>` +
    `<ellipse cx="${n(x - v(2))}" cy="${n(y - v(30))}" rx="${v(30)}" ry="${v(7)}" fill="#7A4A2C"/>` +
    `<ellipse cx="${n(x - v(4))}" cy="${n(y - v(31))}" rx="${v(14)}" ry="${v(3.5)}" fill="#E8C9A0"/>` +
    `<path d="M${n(x - v(16))} ${n(y - v(48))}c${v(-8)} ${v(-10)} ${v(8)} ${v(-16)} 0 ${v(-28)}M${n(x)} ${n(y - v(50))}c${v(-8)} ${v(-10)} ${v(8)} ${v(-16)} 0 ${v(-28)}M${n(x + v(16))} ${n(y - v(48))}c${v(-8)} ${v(-10)} ${v(8)} ${v(-16)} 0 ${v(-28)}" stroke="#FFFFFF" stroke-width="${v(5)}" stroke-linecap="round" opacity="0.85" fill="none"/>`
  );
}

export function thermometer([x, y]: Point, angle = 24, s = 1): string {
  const v = (value: number) => n(value * s);
  return (
    `<g transform="rotate(${angle} ${x} ${y})">` +
    `<rect x="${x}" y="${n(y - v(5))}" width="${v(78)}" height="${v(10)}" rx="${v(5)}" fill="#F5F8FC" stroke="#8D98AC" stroke-width="${v(2.2)}"/>` +
    `<rect x="${n(x + v(2))}" y="${n(y - v(1.8))}" width="${v(48)}" height="${v(3.6)}" rx="${v(1.8)}" fill="#E5384F"/>` +
    `<path d="M${n(x + v(56))} ${n(y - v(5))}v${v(10)}M${n(x + v(63))} ${n(y - v(5))}v${v(6)}M${n(x + v(70))} ${n(y - v(5))}v${v(10)}" stroke="#8D98AC" stroke-width="${v(1.6)}"/>` +
    `</g>`
  );
}

export function icePack(id: Id, [x, y]: Point, s = 1): string {
  const v = (value: number) => n(value * s);
  return (
    `<g transform="rotate(-10 ${x} ${y})">` +
    `<rect x="${n(x - v(52))}" y="${n(y - v(22))}" width="${v(104)}" height="${v(44)}" rx="${v(20)}" fill="url(#${id("ice")})" stroke="#4F9AD4" stroke-width="${v(3)}"/>` +
    `<path d="M${n(x + v(50))} ${n(y - v(6))}l${v(14)} ${v(-8)}v${v(28)}l${v(-14)} ${v(-8)}Z" fill="#7DC2F2" stroke="#4F9AD4" stroke-width="${v(3)}" stroke-linejoin="round"/>` +
    `<path d="M${n(x - v(34))} ${n(y - v(10))}h${v(40)}" stroke="#FFFFFF" stroke-width="${v(5)}" stroke-linecap="round" opacity="0.8"/>` +
    `</g>`
  );
}

export function nightcap(id: Id, s: number, [cx, top]: Point): string {
  const v = (value: number) => n(value * s);
  const x = (value: number) => n(cx + value * s);
  const y = (value: number) => n(top + value * s);
  return (
    `<path d="M${x(-104)} ${y(44)}C${x(-86)} ${y(-14)} ${x(-28)} ${y(-48)} ${x(34)} ${y(-46)}C${x(86)} ${y(-44)} ${x(130)} ${y(-14)} ${x(150)} ${y(28)}L${x(136)} ${y(36)}C${x(112)} ${y(10)} ${x(76)} ${y(0)} ${x(44)} ${y(4)}C${x(68)} ${y(18)} ${x(90)} ${y(36)} ${x(100)} ${y(50)}Z" fill="url(#${id("cap")})" stroke="#262F8A" stroke-width="${v(3)}" stroke-linejoin="round"/>` +
    `<path d="${sparklePath([cx - 30 * s, top - 14 * s], 7 * s)} ${sparklePath([cx + 40 * s, top - 26 * s], 6 * s)} ${sparklePath([cx + 6 * s, top + 22 * s], 5 * s)}" fill="#FFE27A"/>` +
    `<rect x="${x(-112)}" y="${y(36)}" width="${v(220)}" height="${v(28)}" rx="${v(14)}" fill="#FFFFFF" stroke="#D5D2E2" stroke-width="${v(2)}"/>` +
    `<circle cx="${x(148)}" cy="${y(38)}" r="${v(19)}" fill="#FFFFFF" stroke="#D5D2E2" stroke-width="${v(2)}"/>`
  );
}

export function sunglasses(id: Id, a: FaceAnchors): string {
  const r = a.r;
  const lens = ([x, y]: Point, flip: 1 | -1) => {
    const w = r * 1.45;
    return `<path d="M${n(x - w)} ${n(y - r * 0.62)}H${n(x + w)}C${n(x + w + r * 0.12)} ${n(y - r * 0.62)} ${n(x + w + r * 0.14)} ${n(y - r * 0.4)} ${n(x + w)} ${n(y - r * 0.2)}L${n(x + w * 0.72)} ${n(y + r * 0.62)}C${n(x + w * 0.6)} ${n(y + r * 0.92)} ${n(x + w * 0.32)} ${n(y + r * 1.02)} ${x} ${n(y + r * 1.02)}C${n(x - w * 0.32)} ${n(y + r * 1.02)} ${n(x - w * 0.62)} ${n(y + r * 0.92)} ${n(x - w * 0.76)} ${n(y + r * 0.62)}L${n(x - w)} ${n(y - r * 0.2)}C${n(x - w - r * 0.14)} ${n(y - r * 0.4)} ${n(x - w - r * 0.12)} ${n(y - r * 0.62)} ${n(x - w)} ${n(y - r * 0.62)}Z" fill="url(#${id("shades")})"/><path d="M${n(x - w * 0.62 * flip)} ${n(y - r * 0.32)}L${n(x - w * 0.12 * flip)} ${n(y + r * 0.62)}" stroke="#FFFFFF" stroke-width="${n(r * 0.16)}" stroke-linecap="round" opacity="0.35"/>`;
  };
  const [l, rt] = a.eyes;
  return (
    lens(l, 1) +
    lens(rt, 1) +
    `<path d="M${n(l[0] + r * 1.45)} ${n(l[1] - r * 0.5)}Q${n((l[0] + rt[0]) / 2)} ${n(l[1] - r * 0.9)} ${n(rt[0] - r * 1.45)} ${n(rt[1] - r * 0.5)}" stroke="#16161C" stroke-width="${n(r * 0.18)}" fill="none"/>`
  );
}

export function angerMark([x, y]: Point, s: number): string {
  return `<path d="M${n(x - s)} ${n(y - s * 0.3)}Q${n(x - s * 0.3)} ${n(y - s * 0.3)} ${n(x - s * 0.3)} ${n(y - s)}M${n(x + s * 0.3)} ${n(y - s)}Q${n(x + s * 0.3)} ${n(y - s * 0.3)} ${n(x + s)} ${n(y - s * 0.3)}M${n(x + s)} ${n(y + s * 0.3)}Q${n(x + s * 0.3)} ${n(y + s * 0.3)} ${n(x + s * 0.3)} ${n(y + s)}M${n(x - s * 0.3)} ${n(y + s)}Q${n(x - s * 0.3)} ${n(y + s * 0.3)} ${n(x - s)} ${n(y + s * 0.3)}" stroke="#E5304B" stroke-width="${n(s * 0.34)}" stroke-linecap="round" fill="none"/>`;
}

export function questionMark([x, y]: Point, s: number): string {
  const d = `M${n(x - s * 0.45)} ${n(y - s * 0.45)}C${n(x - s * 0.45)} ${n(y - s * 1.15)} ${n(x + s * 0.6)} ${n(y - s * 1.2)} ${n(x + s * 0.6)} ${n(y - s * 0.5)}C${n(x + s * 0.6)} ${n(y - s * 0.05)} ${x} ${n(y + s * 0.02)} ${x} ${n(y + s * 0.42)}`;
  return (
    `<path d="${d}" stroke="#7A4A00" stroke-width="${n(s * 0.42)}" stroke-linecap="round" fill="none"/>` +
    `<path d="${d}" stroke="#FFC233" stroke-width="${n(s * 0.28)}" stroke-linecap="round" fill="none"/>` +
    `<circle cx="${x}" cy="${n(y + s * 0.88)}" r="${n(s * 0.2)}" fill="#FFC233" stroke="#7A4A00" stroke-width="${n(s * 0.07)}"/>`
  );
}

export function zz([x, y]: Point, s: number): string {
  const z = (zx: number, zy: number, k: number) => `M${n(zx)} ${n(zy)}h${n(22 * k)}l${n(-22 * k)} ${n(26 * k)}h${n(22 * k)}`;
  return `<path d="${z(x, y, s)}${z(x + 34 * s, y - 40 * s, s * 0.75)}${z(x + 62 * s, y - 72 * s, s * 0.55)}" stroke="#8FA6FF" stroke-width="${n(7 * s)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

export function sweat(id: Id, at: Point, s: number): string {
  return `<path d="${dropPath(at, s)}" fill="url(#${id("tear")})" opacity="0.9"/>`;
}

export function waveLines([x, y]: Point, s = 1): string {
  return `<path d="M${n(x)} ${n(y)}q${n(10 * s)} ${n(-10 * s)} ${n(6 * s)} ${n(-26 * s)}M${n(x + 18 * s)} ${n(y + 10 * s)}q${n(14 * s)} ${n(-10 * s)} ${n(12 * s)} ${n(-32 * s)}" stroke="#FFC24B" stroke-width="${n(6 * s)}" stroke-linecap="round" fill="none"/>`;
}

export function diya(id: Id, [x, y]: Point, s: number): string {
  const v = (value: number) => n(value * s);
  const fx = x + v(4);
  const fy = y - v(14);
  return (
    `<circle data-part="glow" cx="${n(fx)}" cy="${n(fy - v(18))}" r="${v(70)}" fill="url(#${id("warm")})"/>` +
    `<path d="M${n(x - v(46))} ${n(y - v(6))}C${n(x - v(42))} ${n(y + v(26))} ${n(x - v(20))} ${n(y + v(36))} ${x} ${n(y + v(36))}C${n(x + v(20))} ${n(y + v(36))} ${n(x + v(42))} ${n(y + v(26))} ${n(x + v(46))} ${n(y - v(6))}Z" fill="url(#${id("clay")})" stroke="#7C3410" stroke-width="${v(3)}" stroke-linejoin="round"/>` +
    `<ellipse cx="${x}" cy="${n(y - v(6))}" rx="${v(46)}" ry="${v(10)}" fill="#8E3C14"/>` +
    `<ellipse cx="${x}" cy="${n(y - v(7))}" rx="${v(38)}" ry="${v(6)}" fill="#E8A13A"/>` +
    `<path d="M${n(x - v(34))} ${n(y + v(12))}q${v(8.5)} ${v(8)} ${v(17)} 0t${v(17)} 0t${v(17)} 0t${v(17)} 0" stroke="#FFD36B" stroke-width="${v(3.2)}" fill="none" stroke-linecap="round"/>` +
    `<circle cx="${n(x - v(20))}" cy="${n(y + v(24))}" r="${v(3)}" fill="#FFD36B"/><circle cx="${x}" cy="${n(y + v(28))}" r="${v(3)}" fill="#FFD36B"/><circle cx="${n(x + v(20))}" cy="${n(y + v(24))}" r="${v(3)}" fill="#FFD36B"/>` +
    `<path d="M${n(fx)} ${n(fy - v(40))}C${n(fx + v(14))} ${n(fy - v(20))} ${n(fx + v(15))} ${n(fy - v(4))} ${n(fx)} ${n(fy)}C${n(fx - v(15))} ${n(fy - v(4))} ${n(fx - v(14))} ${n(fy - v(20))} ${n(fx)} ${n(fy - v(40))}Z" fill="url(#${id("flame")})"/>` +
    `<path d="M${n(fx)} ${n(fy - v(20))}C${n(fx + v(5))} ${n(fy - v(12))} ${n(fx + v(5))} ${n(fy - v(5))} ${n(fx)} ${n(fy - v(3))}C${n(fx - v(5))} ${n(fy - v(5))} ${n(fx - v(5))} ${n(fy - v(12))} ${n(fx)} ${n(fy - v(20))}Z" fill="#FFFFFF" opacity="0.9"/>`
  );
}

export function sparkler(id: Id, from: Point, to: Point, s: number): string {
  const [x, y] = to;
  const rays = Array.from({ length: 18 }, (_, index) => {
    const angle = (index / 18) * Math.PI * 2 + 0.2;
    const length = (index % 3 === 0 ? 46 : index % 3 === 1 ? 32 : 24) * s;
    const inner = 8 * s;
    return `M${n(x + Math.cos(angle) * inner)} ${n(y + Math.sin(angle) * inner)}L${n(x + Math.cos(angle) * length)} ${n(y + Math.sin(angle) * length)}`;
  }).join("");
  const dots = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2 + 0.5;
    const distance = (index % 2 ? 52 : 40) * s;
    return `<circle cx="${n(x + Math.cos(angle) * distance)}" cy="${n(y + Math.sin(angle) * distance)}" r="${n(2.6 * s)}" fill="#FFF3B0"/>`;
  }).join("");
  return (
    `<path d="M${pt(from)}L${pt(to)}" stroke="#8F959E" stroke-width="${n(5 * s)}" stroke-linecap="round"/>` +
    `<g data-part="decor">` +
    `<circle cx="${x}" cy="${y}" r="${n(70 * s)}" fill="url(#${id("warm")})"/>` +
    `<path d="${rays}" stroke="#FFD34D" stroke-width="${n(3.4 * s)}" stroke-linecap="round"/>` +
    `<path d="${rays}" stroke="#FFFFFF" stroke-width="${n(1.4 * s)}" stroke-linecap="round" opacity="0.9"/>` +
    dots +
    `<circle cx="${x}" cy="${y}" r="${n(9 * s)}" fill="#FFFBE6"/>` +
    `</g>`
  );
}

/** Diwali string lights across the top of the sticker. */
export function lights(): string {
  const segments: [Point, Point, Point][] = [
    [
      [-10, 30],
      [128, 92],
      [256, 40],
    ],
    [
      [256, 40],
      [384, 92],
      [522, 30],
    ],
  ];
  const colors = ["#FFD54A", "#FF9F1C", "#FF5D8F", "#FFF1B8"];
  let wire = "";
  let bulbs = "";
  let index = 0;
  for (const [a, b, c] of segments) {
    wire += `M${pt(a)}Q${pt(b)} ${pt(c)}`;
    for (const t of [0.18, 0.42, 0.66, 0.9]) {
      const x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t ** 2 * c[0];
      const y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t ** 2 * c[1];
      const color = colors[index % colors.length]!;
      bulbs +=
        `<circle cx="${n(x)}" cy="${n(y + 12)}" r="20" fill="${color}" opacity="0.35"/>` +
        `<rect x="${n(x - 3)}" y="${n(y - 2)}" width="6" height="7" rx="1.5" fill="#6B5A44"/>` +
        `<ellipse cx="${n(x)}" cy="${n(y + 12)}" rx="7" ry="10" fill="${color}"/>` +
        `<ellipse cx="${n(x - 2)}" cy="${n(y + 9)}" rx="2" ry="3.4" fill="#FFFFFF" opacity="0.8"/>`;
      index += 1;
    }
  }
  return `<g data-part="decor"><path d="${wire}" stroke="#5A4632" stroke-width="3" fill="none"/>${bulbs}</g>`;
}

export function marigold([x, y]: Point, s: number): string {
  const petals = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    return `<circle cx="${n(x + Math.cos(angle) * 9 * s)}" cy="${n(y + Math.sin(angle) * 9 * s)}" r="${n(8 * s)}" fill="${index % 2 ? "#FF9F1C" : "#FFB627"}"/>`;
  }).join("");
  return petals + `<circle cx="${x}" cy="${y}" r="${n(8 * s)}" fill="#F07C0B"/><circle cx="${x}" cy="${y}" r="${n(3.4 * s)}" fill="#C25700"/>`;
}

/** One daisy: white petals around a golden centre. */
function daisyHead([x, y]: Point, r: number, rotate: number, petals: string): string {
  const ring = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * 360 + rotate;
    return `<ellipse cx="${x}" cy="${n(y - r * 0.6)}" rx="${n(r * 0.26)}" ry="${n(r * 0.5)}" transform="rotate(${n(angle)} ${x} ${y})"/>`;
  }).join("");
  return (
    `<g fill="${petals}" stroke="#CFC8BB" stroke-width="${n(r * 0.06)}">${ring}</g>` +
    `<circle cx="${x}" cy="${y}" r="${n(r * 0.36)}" fill="#F6C232" stroke="#D18F12" stroke-width="${n(r * 0.08)}"/>` +
    `<circle cx="${n(x - r * 0.1)}" cy="${n(y - r * 0.12)}" r="${n(r * 0.12)}" fill="#FFE9A3"/>`
  );
}

/**
 * A hand-tied bunch of daisies held at `grip`: stems gathered under the paws,
 * flower heads leaning up and to the right, like a shy gift.
 */
export function daisyBouquet([gx, gy]: Point, s = 1, petals = "#FFFFFF"): string {
  const cx = gx + 70 * s;
  const cy = gy - 44 * s;
  const heads: [number, number, number, number][] = [
    [0, 0, 22, 0],
    [-36, 14, 20, 12],
    [32, -18, 21, 24],
    [4, -44, 20, 6],
    [-28, -26, 19, 30],
    [40, 20, 19, 18],
    [-10, 30, 18, 4],
  ];
  const stem = (hx: number, hy: number) => `M${n(gx + 2 * s)} ${n(gy)}Q${n((gx + hx) / 2 - 6 * s)} ${n((gy + hy) / 2 + 4 * s)} ${n(hx)} ${n(hy)}`;
  const stems = heads.map(([dx, dy]) => stem(cx + dx * s, cy + dy * s)).join("");
  const bundle = [-6, -2, 2, 6, 10].map((dx) => `M${n(gx + dx * s * 0.6)} ${n(gy - 4 * s)}L${n(gx - 28 * s + dx * s)} ${n(gy + 70 * s)}`).join("");
  const leaf = (lx: number, ly: number, rotate: number) =>
    `<path d="M0 0C10 -10 26 -10 34 -2C26 8 10 8 0 0Z" fill="#5DBB63" stroke="#2F7A3A" stroke-width="2" transform="translate(${n(lx)} ${n(ly)}) rotate(${rotate}) scale(${s})"/>`;
  return (
    `<path d="${bundle}" stroke="#2F7A3A" stroke-width="${n(5.4 * s)}" stroke-linecap="round" fill="none"/>` +
    `<path d="${bundle}" stroke="#4FA85A" stroke-width="${n(3 * s)}" stroke-linecap="round" fill="none"/>` +
    `<path d="${stems}" stroke="#2F7A3A" stroke-width="${n(4.6 * s)}" stroke-linecap="round" fill="none"/>` +
    `<path d="${stems}" stroke="#4FA85A" stroke-width="${n(2.4 * s)}" stroke-linecap="round" fill="none"/>` +
    leaf(gx + 26 * s, gy - 30 * s, -40) +
    leaf(gx - 20 * s, gy + 44 * s, 150) +
    heads
      .slice()
      .sort((a, b) => a[1] - b[1])
      .map(([dx, dy, r, rotate]) => daisyHead([n(cx + dx * s), n(cy + dy * s)], r * s, rotate, petals))
      .join("")
  );
}
