/** Sent to the AI studio to start (or continue) a conversation. Detail: the prompt text. */
export const AI_EVENT = "charmbit:ai-prompt";

export function askStudio(prompt: string): void {
  window.dispatchEvent(new CustomEvent<string>(AI_EVENT, { detail: prompt }));
}
