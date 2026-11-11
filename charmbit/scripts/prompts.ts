/**
 * Prints the image prompts for a pack as Markdown.
 *
 *   node --experimental-strip-types scripts/prompts.ts sheru > docs/sheru-prompts.md
 */
import { masterPrompt, PACKS, stickerPrompt } from "../src/lib/universe/packs/index.ts";

const pack = PACKS.find((candidate) => candidate.id === (process.argv[2] ?? PACKS[0]!.id));
if (!pack) throw new Error(`Unknown pack. Choose one of: ${PACKS.map((candidate) => candidate.id).join(", ")}`);

const fence = "```";
const lines = [
  `# ${pack.title}: image prompts`,
  "",
  "Generated from `src/lib/universe/packs/`. Edit the pack definition, then run `scripts/prompts.ts` again.",
  "",
  "## How to use these",
  "",
  `1. Run the **master prompt** once. Regenerate until you love him, then save that image. It is ${pack.title} from now on.`,
  "2. For every sticker, start a new request, **attach the master image**, and paste that sticker's prompt.",
  "3. Reject any result where his face, mane or build has drifted from the master image, and generate again.",
  "4. Send the keepers back, or add them yourself:",
  "",
  `${fence}bash`,
  `python3 scripts/add-sticker.py ~/Downloads/your-image.png ${pack.id} <sticker-id>`,
  fence,
  "",
  "## Master prompt",
  "",
  fence,
  masterPrompt(pack),
  fence,
  "",
  "## Stickers",
  "",
];
for (const [index, sticker] of pack.stickers.entries()) {
  const group = pack.groups.find((candidate) => candidate.id === sticker.group)?.name ?? sticker.group;
  lines.push(`### ${index + 1}. ${sticker.name} (\`${sticker.id}\`, ${group})`, "", fence, stickerPrompt(pack, sticker), fence, "");
}
lines.push("## Other outfits", "", "To add an outfit to a sticker, reuse its prompt with the **Outfit** line swapped for one of these, and add the file with the look's id as the last argument.", "");
for (const look of pack.looks.slice(1)) {
  lines.push(`- **${look.name}** (\`${look.id}\`): Outfit: ${look.wardrobe}.`);
}
lines.push("", `${fence}bash`, `python3 scripts/add-sticker.py ~/Downloads/coffee-black.png ${pack.id} coffee ${pack.looks[1]?.id ?? "look"}`, fence, "");
console.log(lines.join("\n"));
