"use client";

import { useEffect, useState, type FormEvent } from "react";
import { askStudio } from "@/components/ai/events";
import { SparkleIcon } from "@/components/ui/icons";
import styles from "./Hero.module.css";

const IDEAS = ["a pink frog saying good morning", "Diwali sticker for my sister Riya", "grumpy cat that says Monday again", "two cats hugging under a heart", "a sleepy ghost wishing good night"] as const;

/** The hero's main action: describe a sticker and the AI studio takes it from there. */
export function HeroPrompt() {
  const [value, setValue] = useState("");
  const [idea, setIdea] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIdea((current) => (current + 1) % IDEAS.length), 3200);
    return () => window.clearInterval(timer);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const prompt = value.trim() || IDEAS[idea]!;
    document.getElementById("make")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    askStudio(prompt);
    setValue("");
  }

  return (
    <form className={styles.prompt} onSubmit={submit} action="#make">
      <SparkleIcon size={18} className={styles.promptIcon} />
      <label htmlFor="hero-prompt" className="sr-only">
        Describe a sticker for the AI to make
      </label>
      <input
        id="hero-prompt"
        className={styles.promptField}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={`Try “${IDEAS[idea]}”`}
        maxLength={300}
        autoComplete="off"
      />
      <button type="submit" className={styles.promptButton}>
        Create
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10h11M11 5l5 5-5 5" />
        </svg>
      </button>
    </form>
  );
}
