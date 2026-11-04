"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "@/lib/auth/token";
import { SignInDialog } from "./SignInDialog";
import styles from "./Auth.module.css";

type Status = "loading" | "disabled" | "anonymous" | "signed-in";

interface AuthValue {
  status: Status;
  user: User | null;
  /** Copying and exporting need a sign-in first. */
  locked: boolean;
  /** Opens the sign-in prompt. */
  requireSignIn: () => void;
  signIn: () => void;
  signOut: () => Promise<void>;
}

/** Fired just before leaving for Google, so the library can save the visitor's work. */
export const BEFORE_SIGN_IN = "charmbit:before-sign-in";
const PENDING = "charmbit:signing-in";

const AuthContext = createContext<AuthValue>({
  status: "disabled",
  user: null,
  locked: false,
  requireSignIn: () => {},
  signIn: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function returnPath(): string {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash || "#library"}`;
}

/** Session state for the page, the sign-in prompt, and a welcome-back note. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ status: Status; user: User | null }>({ status: "loading", user: null });
  const [prompt, setPrompt] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const say = useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    let live = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("session"))))
      .then((data: { enabled: boolean; user: User | null }) => {
        if (!live) return;
        setSession({ status: !data.enabled ? "disabled" : data.user ? "signed-in" : "anonymous", user: data.user });
        // Back from Google: say hello, or say what went wrong, and tidy the URL.
        const params = new URLSearchParams(window.location.search);
        const flag = params.get("auth");
        if (flag) {
          params.delete("auth");
          const query = params.toString();
          window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
          say(flag === "unavailable" ? "Sign-in isn't set up yet." : "Sign-in didn't finish. Please try again.");
        } else if (data.user && sessionStorage.getItem(PENDING)) {
          say(`Signed in as ${data.user.name}. Tap Copy to grab your sticker.`);
        }
        sessionStorage.removeItem(PENDING);
      })
      // If we can't tell, keep the gate closed: sign-in will sort it out.
      .catch(() => live && setSession({ status: "anonymous", user: null }));
    return () => {
      live = false;
    };
  }, [say]);

  const signIn = useCallback(() => {
    try {
      sessionStorage.setItem(PENDING, "1");
    } catch {
      // Private mode: the welcome note just won't show.
    }
    window.dispatchEvent(new Event(BEFORE_SIGN_IN));
    // A full page navigation on purpose: the route hands the browser over to Google.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/api/auth/google?returnTo=${encodeURIComponent(returnPath())}`);
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setSession({ status: "anonymous", user: null });
    say("Signed out.");
  }, [say]);

  const value = useMemo<AuthValue>(
    () => ({
      status: session.status,
      user: session.user,
      locked: session.status === "anonymous" || session.status === "loading",
      requireSignIn: () => setPrompt(true),
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInDialog open={prompt && value.locked} onClose={() => setPrompt(false)} onSignIn={signIn} />
      <div className={styles.toastRegion} role="status" aria-live="polite">
        {toast ? (
          <p key={toast} className={styles.toast}>
            {toast}
          </p>
        ) : null}
      </div>
    </AuthContext.Provider>
  );
}
