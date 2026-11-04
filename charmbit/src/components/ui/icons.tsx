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
  duo: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="8.5" cy="13" r="4.5" />
      <circle cx="15.5" cy="13" r="4.5" />
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
