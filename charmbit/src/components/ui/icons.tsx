import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Icon>
);
export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
    <path d="M15.5 5.5v-.3a1.7 1.7 0 0 0-1.7-1.7H6.2a1.7 1.7 0 0 0-1.7 1.7v7.6c0 .9.8 1.7 1.7 1.7h.3" />
  </Icon>
);
export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 7l10 10M17 7 7 17" />
  </Icon>
);
export const ArrowIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const ChevronIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m7 10 5 5 5-5" />
  </Icon>
);
export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h16M4 16h16" />
  </Icon>
);
export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Icon>
);
export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </Icon>
);
export const AutoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
  </Icon>
);
export const CheckerIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M4 12h16M12 4v16" strokeOpacity="0.4" />
    <path d="M4.8 4.8h7.2v7.2H4.8zM12 12h7.2v7.2H12z" fill="currentColor" stroke="none" opacity="0.5" />
  </Icon>
);

/* Format glyphs: generic marks, not third-party logos. */
export const SvgGlyph = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 18c3-9 11-3 14-12" />
    <rect x="3.5" y="16.5" width="3" height="3" rx=".6" fill="currentColor" stroke="none" />
    <rect x="17.5" y="4.5" width="3" height="3" rx=".6" fill="currentColor" stroke="none" />
  </Icon>
);
export const ReactGlyph = (p: IconProps) => (
  <Icon {...p}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />
  </Icon>
);
export const FlutterGlyph = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.6" />
    <rect x="13" y="4" width="7" height="7" rx="1.6" />
    <rect x="4" y="13" width="16" height="7" rx="1.6" />
  </Icon>
);

export const StickerGlyph = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 13.5V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h6.5" />
    <path d="M13.5 20c0-3.6 2.9-6.5 6.5-6.5L13.5 20Z" />
  </Icon>
);
export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
  </Icon>
);
export const ShareIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 15V4M8 7.5 12 3.5l4 4M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" />
  </Icon>
);
export const HeartGlyph = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19.5s-7.5-4.5-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.5-7.5 10-7.5 10Z" />
  </Icon>
);
export const SmileGlyph = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M8.8 13.5c1.8 2 4.6 2 6.4 0M9.5 10v.01M14.5 10v.01" />
  </Icon>
);
export const DropGlyph = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4c-3 4.2-5 7-5 9.5a5 5 0 0 0 10 0C17 11 15 8.2 12 4Z" />
  </Icon>
);
export const BlushGlyph = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M8 10.5c.8-1 2.2-1 3 0M13 10.5c.8-1 2.2-1 3 0M10 15c1.2 1 2.8 1 4 0" />
    <path d="M6.8 13.2h1.6M15.6 13.2h1.6" />
  </Icon>
);

export const SparkleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5c.6 4.2 2.3 6 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.5 5.9-2.3 6.5-6.5ZM18.5 15.5c.3 1.7 1 2.4 2.5 2.7-1.5.3-2.2 1-2.5 2.6-.3-1.6-1-2.3-2.5-2.6 1.5-.3 2.2-1 2.5-2.7Z" />
  </Icon>
);
export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" fill="currentColor" stroke="none" />
    <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
  </Icon>
);
export const ShuffleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h3.5c4.5 0 4.5 10 9 10H20M17.5 14.5 20 17l-2.5 2.5M4 17h3.5c1.4 0 2.3-.9 3-2.2M13.5 9.2c.7-1.3 1.6-2.2 3-2.2H20M17.5 4.5 20 7l-2.5 2.5" />
  </Icon>
);
export const CodeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5" />
  </Icon>
);
export const GlassIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3.5h12l3 5.5-9 11.5L3 9Z" />
    <path d="M3 9h18M9 3.5 12 9l3-5.5M12 9v11" opacity="0.6" />
  </Icon>
);
export const StripesIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 4c1 3 1 6 0 9M12 3v11M16 4c-1 3-1 6 0 9M6 20h12" />
  </Icon>
);
export const WhiskersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 11 3 9.5M10 13.5H3M10 16l-6 2.5M14 11l7-1.5M14 13.5h7M14 16l6 2.5" />
  </Icon>
);
export const SingleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 19c0-4 3-7 7-7s7 3 7 7M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
  </Icon>
);
export const CoupleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 19c0-3.3 2.2-5.5 5.5-5.5s5.5 2.2 5.5 5.5M8 13.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM14.5 13.6c.5-.1 1-.1 1.5-.1 3.3 0 5.5 2.2 5.5 5.5M16 13.5a3.2 3.2 0 1 0 0-6.4" />
    <path d="M12 5.2c.5-1.2 2.4-1.2 2.4.3 0 1-2.4 2.3-2.4 2.3s-2.4-1.3-2.4-2.3c0-1.5 1.9-1.5 2.4-.3Z" />
  </Icon>
);

/* Category glyphs */
export const CategoryIcons = {
  all: (p: IconProps) => (
    <Icon {...p}>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </Icon>
  ),
  charm: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 15.5C4 10 7.6 6 12 6s8 4 8 9.5c0 2.2-1.6 3.5-3.8 3.5H7.8C5.6 19 4 17.7 4 15.5Z" />
      <path d="M10 13v.01M14 13v.01" strokeWidth={2.4} />
    </Icon>
  ),
  mark: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4.5 4.5" />
    </Icon>
  ),
  character: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 10v.01M15 10v.01" strokeWidth={2.4} />
      <path d="M9 14.5c1.6 1.6 4.4 1.6 6 0" />
    </Icon>
  ),
  object: (p: IconProps) => (
    <Icon {...p}>
      <path d="m12 3.8 2.4 5 5.4.6-4 3.7 1.1 5.3L12 15.8l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6L12 3.8Z" />
    </Icon>
  ),
  ui: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <path d="M3.5 9h17M7 7v.01M9.5 7v.01" />
    </Icon>
  ),
  reaction: (p: IconProps) => (
    <Icon {...p}>
      <path d="M5 19 9 6l9 9-13 4Z" />
      <path d="M14 4.5 15 3M18.5 7.5 21 6.5M17 3.5l.5 2" />
    </Icon>
  ),
} as const;
