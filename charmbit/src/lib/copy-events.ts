/** Decoupled copy notifications: any component can announce, the island listens. */

export interface CopyNotice {
  title: string;
  format: string;
  /** Customised SVG for the mini preview. */
  svg: string;
  ink: string | null;
  ok: boolean;
  /** Defaults to "Copied". */
  verb?: "Copied" | "Saved";
}

const EVENT = "charmbit:copied";

export function announceCopy(notice: CopyNotice): void {
  window.dispatchEvent(new CustomEvent<CopyNotice>(EVENT, { detail: notice }));
}

export function onCopy(listener: (notice: CopyNotice) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<CopyNotice>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
