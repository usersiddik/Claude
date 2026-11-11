import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { SESSION_COOKIE, SESSION_TTL, STATE_COOKIE } from "@/lib/auth/config";
import { SITE } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `What ${SITE.name} receives when you sign in with Google, where it's kept, and how to remove it.`,
  alternates: { canonical: "/privacy" },
};

const UPDATED = "4 November 2026";
const CONTACT = "namesiddik@gmail.com";
const SESSION_DAYS = SESSION_TTL / (60 * 60 * 24);

/** Plain-language privacy policy. Keep it in step with src/lib/auth and the browser storage it lists. */
export default function PrivacyPage() {
  return (
    <AuthProvider>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <article className={`container ${styles.article}`}>
          <p className="eyebrow">
            <span>Privacy</span>
            <span>Updated {UPDATED}</span>
          </p>
          <h1 className={`display ${styles.title}`}>Privacy policy</h1>
          <p className={styles.lede}>
            {SITE.name} is a sticker library. Browsing and customising stickers needs no account. Copying, downloading and exporting ask you to sign in with Google. This page explains what that sign-in shares with us and what happens to it.
          </p>

          <h2>What we receive from Google</h2>
          <p>When you choose &ldquo;Continue with Google&rdquo;, we ask Google only for the basic sign-in scopes (openid, email and profile). Google then sends us:</p>
          <ul>
            <li>your Google account ID</li>
            <li>your email address (only accounts with a verified email can sign in)</li>
            <li>your name</li>
            <li>the address of your profile photo</li>
          </ul>
          <p>We don&rsquo;t ask for access to your Gmail, Drive, contacts, calendar or any other Google data, and we never see your Google password.</p>

          <h2>How we use it</h2>
          <p>Only to keep you signed in, show your name and photo in the site header, and let you copy, download and export stickers. We don&rsquo;t send you email, don&rsquo;t build profiles, and don&rsquo;t use it for advertising.</p>

          <h2>Where it&rsquo;s kept</h2>
          <p>
            {SITE.name} has no user database. Your sign-in details are kept in a signed cookie on your own device, so we can check it hasn&rsquo;t been tampered with. Page scripts can&rsquo;t read it, and it expires after {SESSION_DAYS} days or when you sign out. We don&rsquo;t keep a copy on our servers.
          </p>

          <h2>Cookies and browser storage</h2>
          <ul>
            <li>
              <strong>{SESSION_COOKIE}</strong>: your signed-in session, for up to {SESSION_DAYS} days.
            </li>
            <li>
              <strong>{STATE_COOKIE}</strong>: a short-lived cookie that protects the sign-in itself, deleted when you return from Google (at most 10 minutes).
            </li>
            <li>
              <strong>Theme</strong>: your light or dark choice, saved in your browser&rsquo;s local storage.
            </li>
            <li>
              <strong>Unsaved edits</strong>: the colours and outline you picked, held in session storage while you sign in so you come back to the same sticker. It&rsquo;s cleared when you return.
            </li>
          </ul>
          <p>There are no advertising or analytics cookies.</p>

          <h2>Sharing</h2>
          <p>We don&rsquo;t sell, rent or share your information with anyone. The site is hosted on Vercel, which handles each request and keeps standard server logs (such as IP address and browser type) to run and secure the service.</p>

          <h2>Google user data</h2>
          <p>
            {SITE.name}&rsquo;s use of information received from Google APIs follows the{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noreferrer">
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>Sign out from the account menu in the header. This deletes the session cookie straight away.</li>
            <li>
              Remove {SITE.name}&rsquo;s access to your Google account at any time from{" "}
              <a href="https://myaccount.google.com/connections" rel="noreferrer">
                your Google account settings
              </a>
              .
            </li>
            <li>Clearing this site&rsquo;s cookies and storage in your browser removes everything listed above.</li>
          </ul>

          <h2>Children</h2>
          <p>{SITE.name} isn&rsquo;t directed at children under 13, and sign-in is subject to Google&rsquo;s own age requirements.</p>

          <h2>Changes</h2>
          <p>If this policy changes, we&rsquo;ll update this page and the date at the top.</p>

          <h2>Contact</h2>
          <p>
            Questions about privacy: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </p>

          <p className={styles.back}>
            <Link href="/">Back to {SITE.name}</Link>
          </p>
        </article>
      </main>
    </AuthProvider>
  );
}
