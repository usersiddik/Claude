"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import { StickerActions } from "@/components/library/StickerActions";
import { CloseIcon, SparkleIcon } from "@/components/ui/icons";
import { CopyIsland } from "@/components/ui/CopyIsland";
import { designSlug, renderDesign, type ReadyDesign } from "@/lib/ai/design";
import { exportDesign } from "@/lib/ai/export";
import { svgDataUri } from "@/lib/universe/paths";
import { AI_EVENT } from "./events";
import styles from "./AiStudio.module.css";

type Source = "claude" | "quick";

type Turn =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; reply: string; designs: ReadyDesign[]; source: Source; note?: string }
  | { id: number; role: "error"; text: string; retry: string };

interface Selection {
  turn: number;
  index: number;
}


export const EXAMPLES = [
  "A pink frog saying good morning",
  "Diwali sticker for my sister Riya",
  "Grumpy cat that says Monday again",
  "Purple heart that says Be mine",
  "Sleepy ghost wishing good night",
  "Giraffe saying congrats Aman!",
] as const;

const REFINES = ["Another colour", "Add a caption", "Make it cuter", "Something different"] as const;

const isPhone = () => window.matchMedia("(max-width: 1023px)").matches;

/** What we send back to the server for context: the conversation, designs as JSON. */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function historyOf(turns: readonly Turn[]): ChatMessage[] {
  return turns.flatMap((turn): ChatMessage[] => {
    if (turn.role === "user") return [{ role: "user", content: turn.text }];
    if (turn.role === "assistant") {
      // Lettering is traced on the server; JSON.stringify drops it here.
      const designs = turn.designs.map((design) => ({ ...design, lettering: undefined }));
      return [{ role: "assistant", content: JSON.stringify({ reply: turn.reply, designs }) }];
    }
    return [];
  });
}

function Preview({ design, onClose }: { design: ReadyDesign; onClose?: () => void }) {
  const svg = useMemo(() => renderDesign(design, design.lettering), [design]);
  const [pulse, setPulse] = useState(0);
  return (
    <div className={styles.preview}>
      <div className={styles.previewStage}>
        <div key={`${designSlug(design)}-${pulse}`} className={styles.previewArt} data-pulse={pulse > 0 ? "" : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG; an image keeps its ids isolated */}
          <img src={svgDataUri(svg)} alt={design.title} draggable={false} />
        </div>
        {onClose ? (
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        ) : null}
      </div>
      <div className={styles.previewInfo}>
        <h3 className={styles.previewTitle}>{design.title}</h3>
        {design.caption ? <p className={styles.previewCaption}>“{design.caption}”</p> : null}
      </div>
      <StickerActions svg={svg} title={design.title} slug={designSlug(design)} code={(format) => exportDesign(design, format)} onCopied={() => setPulse((value) => value + 1)} />
    </div>
  );
}

/** Chapter 02: describe a sticker, get three designs, refine them in conversation. */
export function AiStudio() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const thread = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const nextId = useRef(1);
  const turnsRef = useRef<Turn[]>([]);
  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);
  const busy = useRef(false);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim().slice(0, 300);
    if (!text || busy.current) return;
    busy.current = true;
    const user: Turn = { id: nextId.current++, role: "user", text };
    const history: ChatMessage[] = [...historyOf(turnsRef.current), { role: "user", content: text }];
    setTurns((previous) => [...previous, user]);
    setInput("");
    setPending(true);
    try {
      const response = await fetch("/api/sticker-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = (await response.json().catch(() => ({}))) as { reply?: string; designs?: ReadyDesign[]; source?: Source; note?: string; error?: string };
      if (!response.ok || data.error) throw new Error(data.error ?? "Something went wrong. Try again.");
      const id = nextId.current++;
      const designs = Array.isArray(data.designs) ? data.designs : [];
      setTurns((previous) => [...previous, { id, role: "assistant", reply: data.reply ?? "", designs, source: data.source ?? "quick", note: data.note }]);
      if (designs.length > 0) setSelected({ turn: id, index: 0 });
    } catch (error) {
      const message = error instanceof Error && error.message !== "Failed to fetch" ? error.message : "Couldn't reach the sticker maker. Check your connection and try again.";
      setTurns((previous) => [...previous, { id: nextId.current++, role: "error", text: message, retry: text }]);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }, []);

  // The hero prompt (and anything else) can start a conversation.
  useEffect(() => {
    const onPrompt = (event: Event) => {
      const prompt = (event as CustomEvent<string>).detail;
      if (typeof prompt === "string") void send(prompt);
    };
    window.addEventListener(AI_EVENT, onPrompt);
    return () => window.removeEventListener(AI_EVENT, onPrompt);
  }, [send]);

  // Keep the newest message in view inside the thread (not the page).
  useEffect(() => {
    const node = thread.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [turns, pending]);

  const tiles = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const turn of turns) if (turn.role === "assistant") map.set(turn.id, turn.designs.map((design) => svgDataUri(renderDesign(design, design.lettering, true))));
    return map;
  }, [turns]);

  const current = useMemo(() => {
    if (!selected) return null;
    const turn = turns.find((candidate) => candidate.id === selected.turn);
    return turn?.role === "assistant" ? (turn.designs[selected.index] ?? null) : null;
  }, [selected, turns]);
  const lastSource = [...turns].reverse().find((turn) => turn.role === "assistant");

  function pick(turn: number, index: number) {
    setSelected({ turn, index });
    if (isPhone()) {
      sheet.current?.showModal();
      setSheetOpen(true);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  function onKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  }

  return (
    <div className={styles.studio}>
      <span className={styles.aurora} aria-hidden="true" />
      <div className={styles.chat}>
        <div className={styles.chatHead}>
          <span className={styles.badge}>
            <SparkleIcon size={14} />
            Sticker AI
          </span>
          <span className={styles.mode}>{lastSource?.role === "assistant" && lastSource.source === "quick" ? "Quick mode: AI is offline, matching keywords" : "Designs with Claude"}</span>
        </div>

        <div ref={thread} className={styles.thread} role="log" aria-live="polite" aria-label="Conversation">
          {turns.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Describe a feeling, a person, a moment.</p>
              <p className={styles.emptyText}>Name a character, colours, or the exact words you want lettered. Then keep chatting to refine it.</p>
              <div className={styles.examples}>
                {EXAMPLES.map((example, index) => (
                  <button key={example} type="button" className={styles.example} style={{ "--i": index } as CSSProperties} onClick={() => void send(example)} disabled={pending}>
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {turns.map((turn) => {
            if (turn.role === "user") {
              return (
                <div key={turn.id} className={styles.user}>
                  <p>{turn.text}</p>
                </div>
              );
            }
            if (turn.role === "error") {
              return (
                <div key={turn.id} className={styles.assistant}>
                  <p className={styles.error}>{turn.text}</p>
                  <button type="button" className={styles.chip} onClick={() => void send(turn.retry)} disabled={pending}>
                    Try again
                  </button>
                </div>
              );
            }
            const images = tiles.get(turn.id) ?? [];
            return (
              <div key={turn.id} className={styles.assistant}>
                {turn.reply ? <p className={styles.reply}>{turn.reply}</p> : null}
                {turn.note ? <p className={styles.note}>{turn.note}</p> : null}
                {turn.designs.length > 0 ? (
                  <ul role="list" className={styles.designs}>
                    {turn.designs.map((design, index) => (
                      <li key={index} style={{ "--i": index } as CSSProperties} className={styles.designCell}>
                        <button
                          type="button"
                          className={styles.design}
                          aria-pressed={selected?.turn === turn.id && selected.index === index}
                          aria-label={`${design.title}${design.caption ? `, "${design.caption}"` : ""}`}
                          onClick={() => pick(turn.id, index)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG */}
                          <img src={images[index]} alt="" draggable={false} />
                          <span>{design.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {turn.designs.length > 0 && turn.id === lastSource?.id ? (
                  <div className={styles.refines} role="group" aria-label="Refine">
                    {REFINES.map((refine) => (
                      <button key={refine} type="button" className={styles.chip} onClick={() => void send(refine)} disabled={pending}>
                        {refine}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          {pending ? (
            <div className={styles.assistant} aria-label="Designing">
              <p className={styles.thinking}>
                <SparkleIcon size={14} />
                Designing your stickers
              </p>
              <ul role="list" className={styles.designs} aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <li key={index} className={styles.skeleton} style={{ "--i": index } as CSSProperties} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <form className={styles.composer} onSubmit={submit}>
          <label htmlFor="ai-prompt" className="sr-only">
            Describe your sticker
          </label>
          <textarea
            id="ai-prompt"
            className={styles.field}
            rows={1}
            maxLength={300}
            placeholder={turns.length === 0 ? "A sleepy frog saying good night to Meera…" : "Ask for changes: colours, words, mood…"}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKey}
          />
          <button type="submit" className={styles.send} disabled={pending || !input.trim()} aria-label="Create stickers">
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 16V4M5 9l5-5 5 5" />
            </svg>
          </button>
        </form>
      </div>

      <div className={styles.inspector} role="region" aria-label="Selected design">
        {current ? (
          <Preview design={current} />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderArt} aria-hidden="true">
              {["cats/hi", "love/glossy-heart", "diwali/diya-girl"].map((key, index) => (
                // eslint-disable-next-line @next/next/no-img-element -- static SVG sticker
                <img key={key} src={`/stickers/${key}.svg`} alt="" style={{ "--k": index } as CSSProperties} />
              ))}
            </div>
            <p>Your designs appear here, ready to copy, download, or export as code.</p>
          </div>
        )}
      </div>

      <dialog ref={sheet} className={styles.sheet} aria-label={current ? `${current.title} sticker` : "Sticker"} onClose={() => setSheetOpen(false)} onClick={(event) => event.target === sheet.current && sheet.current?.close()}>
        {sheetOpen && current ? (
          <>
            <Preview design={current} onClose={() => sheet.current?.close()} />
            <CopyIsland scope="dialog" />
          </>
        ) : null}
      </dialog>
    </div>
  );
}
