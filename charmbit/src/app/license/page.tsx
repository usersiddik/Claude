import type { Metadata } from "next";
import { DocPage, docStyles as styles } from "@/components/docs/DocPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Licence",
  description: `How you can use ${SITE.name} stickers: in chats, in your own designs and products, and what needs permission first.`,
  alternates: { canonical: "/license" },
};

const UPDATED = "11 November 2026";

/**
 * OWNER TO CONFIRM: these terms are a conservative starting point written for
 * launch. They have not had legal review. Change the wording here only.
 */
export default function LicensePage() {
  return (
    <DocPage label="Licence" note={`Updated ${UPDATED}`} title="Using the stickers">
      <p className={styles.lede}>
        Every sticker on {SITE.name} is original artwork, and {SITE.name} keeps the copyright. You don&rsquo;t need to pay or credit us for the uses below.
      </p>

      <h2>You can</h2>
      <ul>
        <li>Send stickers in chats, messages, email and social posts.</li>
        <li>Change the colours and details with the tools on this site, and use the result the same way.</li>
        <li>Use stickers and the exported SVG, React and Flutter code inside your own websites, apps, presentations and designs, including commercial ones, where the stickers are part of something larger.</li>
      </ul>

      <h2>Please ask first</h2>
      <ul>
        <li>Printing stickers on products for sale, such as physical sticker sheets, clothing or stationery.</li>
        <li>Using a character as a logo, mascot or trademark.</li>
        <li>Using the artwork in advertising for a brand.</li>
      </ul>

      <h2>You can&rsquo;t</h2>
      <ul>
        <li>Sell or give away the stickers on their own, or as a sticker pack, icon set, template or stock asset, whether changed or not.</li>
        <li>Publish them to sticker stores or marketplaces as your own work.</li>
        <li>Claim that you made the artwork, or register it as your own.</li>
        <li>Use the artwork to train or fine-tune image-generation models.</li>
        <li>Use the stickers in ways that are unlawful, hateful or misleading.</li>
      </ul>

      <h2>No warranty</h2>
      <p>The stickers and code are provided as they are, without any guarantee. Check that they suit your project before you ship.</p>

      <h2>Questions and permissions</h2>
      <p>
        If your use isn&rsquo;t covered here, or you would like permission for something in the &ldquo;ask first&rdquo; list, write to <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>.
      </p>
    </DocPage>
  );
}
