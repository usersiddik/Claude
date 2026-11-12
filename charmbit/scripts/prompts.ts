/**
 * Prints the image prompts for a pack as Markdown.
 *
 *   node --experimental-strip-types scripts/prompts.ts sheru > docs/sheru-prompts.md
 */
import { PACKS, promptStyle, stickerPrompt } from "../src/lib/universe/packs/index.ts";

const pack = PACKS.find((candidate) => candidate.id === (process.argv[2] ?? PACKS[0]!.id));
if (!pack) throw new Error(`Unknown pack. Choose one of: ${PACKS.map((candidate) => candidate.id).join(", ")}`);

const style = promptStyle(pack);
const fence = "```";
const lines = [
  `# ${pack.title}: image prompts`,
  "",
  "Generated from `src/lib/universe/packs/`. Edit the pack definition, then run `scripts/prompts.ts` again.",
  "",
  "## How to use these",
  "",
  "1. For every sticker, start a new request, **attach the reference image of the character**, and paste that sticker's prompt.",
  `2. Reject any result where ${style.drift} has drifted from the reference, and generate again.`,
  "3. Send the keepers back, or add them yourself:",
  "",
  `${fence}bash`,
  `python3 scripts/add-sticker.py ~/Downloads/your-image.png ${pack.id} <sticker-id>`,
  fence,
  "",
  "The prompts ask for no white sticker border, because the site adds the outline (none, thin or thick) itself. If a result has one anyway, add `--border 24` to shave it off.",
  "",
  "## Stickers",
  "",
];
for (const [index, sticker] of pack.stickers.entries()) {
  const group = pack.groups.find((candidate) => candidate.id === sticker.group)?.name ?? sticker.group;
  lines.push(`### ${index + 1}. ${sticker.name} (\`${sticker.id}\`, ${group}${sticker.premium ? ", premium" : ""})`, "", fence, stickerPrompt(pack, sticker), fence, "");
}
if (pack.looks.length > 1) {
  lines.push("## Other outfits", "", "To add an outfit to a sticker, reuse its prompt with the **Outfit** line swapped for one of these, and add the file with the look's id as the last argument.", "");
  for (const look of pack.looks.slice(1)) {
    lines.push(`- **${look.name}** (\`${look.id}\`): Outfit: ${look.wardrobe}.`);
  }
  lines.push("", `${fence}bash`, `python3 scripts/add-sticker.py ~/Downloads/coffee-black.png ${pack.id} coffee ${pack.looks[1]?.id ?? "look"}`, fence, "");
}
console.log(lines.join("\n"));
