import Anthropic from "@anthropic-ai/sdk";
import { REPLY_SCHEMA, sanitizeDesign, sanitizeReply, type Design, type DesignReply, type ReadyDesign } from "@/lib/ai/design";
import { composeLocally } from "@/lib/ai/local";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { traceText } from "@/lib/ai/trace";

/**
 * The AI sticker designer. Claude reads the conversation and returns designs
 * as structured output; the server checks them against the catalogue and
 * traces any custom lettering. Without ANTHROPIC_API_KEY (or if Claude is
 * unavailable) a keyword designer answers instead, so the page always works.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.CHARMBIT_AI_MODEL || "claude-opus-5-5";
/** Models that accept the server-side refusal fallback. */
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"]);
const MAX_MESSAGES = 14;
const MAX_USER_CHARS = 500;
const MAX_ASSISTANT_CHARS = 6000;

type Source = "claude" | "quick";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* Best-effort per-IP limit. Serverless instances don't share memory, so this
   only blunts bursts; put a real limiter in front for heavy traffic. */
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000;
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < window);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 30;
}

function readMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages.slice(-MAX_MESSAGES);
  const messages: ChatMessage[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const { role, content } = entry as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const limit = role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    const text = content.trim().slice(0, limit);
    if (text) messages.push({ role, content: text });
  }
  // The API needs a user turn first and last.
  while (messages[0]?.role === "assistant") messages.shift();
  if (messages.length === 0 || messages.at(-1)?.role !== "user") return null;
  return messages;
}

/** Earlier designs, read back from the assistant turns the client sends. */
function previousDesigns(messages: readonly ChatMessage[]): Design[] {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]!;
    if (message.role !== "assistant") continue;
    try {
      const parsed = JSON.parse(message.content) as { designs?: unknown[] };
      return (parsed.designs ?? []).map(sanitizeDesign).filter((design): design is Design => design !== null);
    } catch {
      return [];
    }
  }
  return [];
}

let client: Anthropic | undefined;

async function askClaude(messages: readonly ChatMessage[]): Promise<DesignReply | "refused" | null> {
  client ??= new Anthropic({ maxRetries: 1, timeout: 45_000 });
  const fallback = FALLBACK_MODELS.has(MODEL);
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    ...(fallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    // The brief is identical on every request, so it is cached.
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    // Mapping a request to a design is quick work: low effort keeps it fast.
    output_config: { effort: "low", format: { type: "json_schema", schema: REPLY_SCHEMA } },
    messages: messages.map((message) => ({ role: message.role, content: message.content })),
  });
  if (response.stop_reason === "refusal") return "refused";
  if (response.stop_reason === "max_tokens") return null;
  const text = response.content.map((block) => (block.type === "text" ? block.text : "")).join("");
  try {
    return sanitizeReply(JSON.parse(text));
  } catch {
    return null;
  }
}

function ready(designs: readonly Design[]): ReadyDesign[] {
  return designs.map((design) => ({ ...design, lettering: design.caption ? traceText(design.caption) : null }));
}

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return json({ error: "You're making stickers faster than we can draw them. Try again in a few minutes." }, 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "That message didn't come through. Try again." }, 400);
  }
  const messages = readMessages(body);
  if (!messages) return json({ error: "Describe the sticker you want." }, 400);
  const prompt = messages.at(-1)!.content;
  const quick = (note?: string): Response => {
    const result = composeLocally(prompt, previousDesigns(messages));
    return json({ reply: result.reply, designs: ready(result.designs), source: "quick" satisfies Source, note });
  };

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return quick();

  try {
    const result = await askClaude(messages);
    if (result === "refused") {
      return json({ reply: "I can't make that one. How about something sweet, like a hug, a heart, or a happy dance?", designs: [], source: "claude" satisfies Source });
    }
    if (!result || result.designs.length === 0) {
      if (result?.reply) return json({ reply: result.reply, designs: [], source: "claude" satisfies Source });
      return quick("Claude's answer didn't fit the sticker kit, so quick mode stepped in.");
    }
    return json({ reply: result.reply, designs: ready(result.designs), source: "claude" satisfies Source });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: "Lots of people are making stickers right now. Try again in a moment." }, 429);
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error("sticker-chat: Claude credentials were rejected");
      return quick("AI is offline right now, so quick mode answered.");
    }
    // Connection errors are APIErrors too, so they're checked first.
    if (error instanceof Anthropic.APIConnectionError) {
      console.error("sticker-chat: couldn't reach Claude");
      return quick("AI is unreachable right now, so quick mode answered.");
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`sticker-chat: Claude API error ${error.status}`);
      return quick("AI is busy right now, so quick mode answered.");
    }
    throw error;
  }
}
