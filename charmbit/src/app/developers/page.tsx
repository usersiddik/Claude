import type { Metadata } from "next";
import Link from "next/link";
import { DocPage, docStyles as styles } from "@/components/docs/DocPage";
import { componentName, FORMATS } from "@/lib/exports";
import { SITE } from "@/lib/site";
import { defaultValues, exportItem, findItem, GENERATED, stickerSlug, stickerTitle } from "@/lib/universe";
import { libraryHref, stickerPath } from "@/lib/universe/paths";
import { WHATSAPP_MAX_BYTES } from "@/lib/sticker";

export const metadata: Metadata = {
  title: "Developers",
  description: `Use ${SITE.name} stickers in your product: SVG, a typed React component, or a Flutter widget, generated from the same artwork you see on the site.`,
  alternates: { canonical: "/developers" },
};

const LINES = 26;

/** The first lines of real exporter output, so the page can never drift from the product. */
function excerpt(code: string) {
  const lines = code.trimEnd().split("\n");
  return { text: lines.slice(0, LINES).join("\n"), more: Math.max(0, lines.length - LINES) };
}

export default function DevelopersPage() {
  // One real sticker, run through the same exporters the Code menu uses.
  const collection = GENERATED.find((candidate) => candidate.id === "love") ?? GENERATED[0]!;
  const item = findItem(collection, "glossy-heart");
  const values = defaultValues(collection);
  const title = stickerTitle(collection, item);
  const slug = stickerSlug(collection, item);
  const component = componentName(slug, "sticker");
  const svg = excerpt(exportItem(collection, item, values, "svg"));
  const react = excerpt(exportItem(collection, item, values, "react"));
  const flutter = excerpt(exportItem(collection, item, values, "flutter"));
  const file = (id: string) => FORMATS.find((format) => format.id === id)!.fileName({ slug, family: "sticker" });
  const props = (id: string) => FORMATS.find((format) => format.id === id)!.props;

  return (
    <DocPage label="Developers" note="SVG · React · Flutter" title="Use it in your product">
      <p className={styles.lede}>
        Every sticker is drawn as SVG. The Code menu in the <Link href="/#library">library</Link> turns the sticker you are looking at, with your colours, into markup, a React component or a Flutter widget. Nothing to install from us.
      </p>

      <div className={styles.sample}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sticker */}
        <img src={stickerPath(collection.id, item.id)} alt={title} width={88} height={88} />
        <p>
          The examples below are the real output for <strong>{title}</strong> in its default colours. <Link href={libraryHref(collection.id, item.id)}>Open it in the library</Link> to change it and copy the full code.
        </p>
      </div>

      <h2 id="how">How to get the code</h2>
      <ol>
        <li>Open a sticker in the library and set its colours, details and outline.</li>
        <li>
          Choose <strong>Code</strong>, then SVG, React or Flutter. The code is copied to your clipboard.
        </li>
        <li>Paste it into a file in your project. The suggested file names are shown below.</li>
      </ol>
      <p>The copied code always matches the preview, including any colour you picked.</p>

      <h2 id="svg">SVG</h2>
      <p>
        Clean, optimised markup with a <code>viewBox</code> and an accessible <code>&lt;title&gt;</code>. Save it as <code>{file("svg")}</code>, inline it in HTML, or use it as an image source.
      </p>
      <pre className={styles.code} tabIndex={0}>
        <code>{svg.text}</code>
      </pre>
      {svg.more > 0 ? <p className={styles.codeNote}>First {LINES} lines of {LINES + svg.more}. Copy the full markup from the library.</p> : null}
      <p>
        You can change: {props("svg").map((prop, index) => (
          <span key={prop}>
            {index > 0 ? ", " : ""}
            <code>{prop}</code>
          </span>
        ))}
        .
      </p>

      <h2 id="react">React</h2>
      <p>
        A typed TSX component with no dependencies beyond React. It works in Server Components. Save it as <code>{file("react")}</code>.
      </p>
      <pre className={styles.code} tabIndex={0}>
        <code>{react.text}</code>
      </pre>
      {react.more > 0 ? <p className={styles.codeNote}>First {LINES} lines of {LINES + react.more}.</p> : null}
      <h3>Using it</h3>
      <pre className={styles.code} tabIndex={0}>
        <code>{`import { ${component} } from "./${component}";

export function Welcome() {
  return (
    <>
      <${component} size={96} />
      {/* Decorative: hide it from screen readers */}
      <${component} size="4rem" title="" />
    </>
  );
}`}</code>
      </pre>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>size</code></td>
              <td>Width and height. A number in pixels or any CSS length.</td>
            </tr>
            <tr>
              <td><code>color</code></td>
              <td>Ink colour for artwork drawn with <code>currentColor</code> (the flat icons). Full-colour stickers keep the colours you chose on the site.</td>
            </tr>
            <tr>
              <td><code>title</code></td>
              <td>Accessible name. Pass an empty string when the sticker is decorative.</td>
            </tr>
            <tr>
              <td><code>className</code>, other SVG props</td>
              <td>Passed through to the <code>&lt;svg&gt;</code> element.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="flutter">Flutter</h2>
      <p>
        A <code>StatelessWidget</code> built on the <code>flutter_svg</code> package. The drawing is exported without SVG filters, which flutter_svg does not render. Add the package first:
      </p>
      <pre className={styles.code} tabIndex={0}>
        <code>flutter pub add flutter_svg</code>
      </pre>
      <p>
        Then save the widget as <code>{file("flutter")}</code>:
      </p>
      <pre className={styles.code} tabIndex={0}>
        <code>{flutter.text}</code>
      </pre>
      {flutter.more > 0 ? <p className={styles.codeNote}>First {LINES} lines of {LINES + flutter.more}.</p> : null}
      <p>
        You can change: {props("flutter").map((prop, index) => (
          <span key={prop}>
            {index > 0 ? ", " : ""}
            <code>{prop}</code>
          </span>
        ))}
        .
      </p>

      <h2 id="formats">Image formats</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Format</th>
              <th scope="col">Sizes</th>
              <th scope="col">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PNG</td>
              <td>256, 512, 1024 px</td>
              <td>Transparent background, optional white outline.</td>
            </tr>
            <tr>
              <td>WebP</td>
              <td>256, 512, 1024 px</td>
              <td>Transparent. Needs a browser that can encode WebP; if yours cannot, the site says so and saves nothing.</td>
            </tr>
            <tr>
              <td>SVG</td>
              <td>Any</td>
              <td>The vector source. The outline option applies to images only.</td>
            </tr>
            <tr>
              <td>WhatsApp sticker</td>
              <td>512 × 512 px</td>
              <td>Transparent WebP kept under {WHATSAPP_MAX_BYTES / 1024} KB.</td>
            </tr>
            <tr>
              <td>Telegram sticker</td>
              <td>512 × 512 px</td>
              <td>Transparent PNG.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="messaging">Stickers in WhatsApp and Telegram</h2>
      <p>
        <strong>The quick way:</strong> choose Copy sticker, then paste into the chat. It is sent as an image.
      </p>
      <p>
        <strong>As a real sticker in WhatsApp:</strong> download the WhatsApp sticker file. It meets WhatsApp&rsquo;s rules for a static sticker (512 × 512, transparent WebP, under {WHATSAPP_MAX_BYTES / 1024} KB). WhatsApp only adds sticker packs through a sticker-maker app on your phone, or its own &ldquo;Create sticker&rdquo; option, so import the file there. {SITE.name} cannot install a pack into WhatsApp for you, and a downloaded file is not a pack on its own.
      </p>
      <p>
        <strong>In Telegram:</strong> download the Telegram sticker file and send it to the official @Stickers bot to add it to a pack you own.
      </p>

      <h2 id="licence">Licence</h2>
      <p>
        Read the <Link href="/license">licence</Link> before you ship. Questions: <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>.
      </p>
    </DocPage>
  );
}
