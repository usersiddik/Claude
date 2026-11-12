import type { PackDefinition } from "./types.ts";

/** Lumi's partner in the "Together" stickers: the same bunny, told apart by a bow. */
const MIMI =
  "Mimi, a second baby white bunny who looks just like Lumi (same fluffy white fur, peach-pink inner ears, glossy dark brown eyes and rosy cheeks) and is told apart only by a small pastel pink satin bow at the base of her left ear";

/**
 * Lumi: a baby white bunny, all blush and big eyes. One fixed identity and
 * 34 reactions: the sweet and shy ones first, then big feelings, everyday
 * moments, and a set with her partner Mimi.
 */
export const lumi: PackDefinition = {
  id: "lumi",
  kind: "image",
  title: "Lumi",
  noun: "Lumi",
  tagline: "Soft, shy, and a little dramatic.",
  description: "A baby white bunny with rosy cheeks and a feeling for every message.",
  families: ["characters"],
  accent: "#F7C9CF",
  identity:
    "Lumi, an adorable 3D Pixar-style baby white bunny with ultra-fluffy pure white fur, tall expressive white ears with soft pastel peach-pink inner ears, oversized glossy dark brown eyes with long eyelashes, chubby white cheeks with soft rosy-pink blush, a tiny pink triangular nose, and stubby white front paws.",
  prompt: {
    framing: "Close-up chibi bust sticker portrait of",
    pronoun: "She",
    keep: "Keep her face, fur, ears, eye colour, blush and proportions exactly the same as the attached reference image.",
    style: "High-end 3D animation render, soft warm studio rim lighting, centered chest-up framing with a little empty space on every side, clean outer edges for an easy cutout. Her body ends in a soft, rounded, fluffy lower edge well inside the picture, never cropped by a straight horizontal line or by the edge of the image.",
    drift: "her face, ears, fur or blush",
  },
  looks: [{ id: "classic", name: "Classic", swatch: "#FFFFFF", wardrobe: "" }],
  groups: [
    { id: "sweet", name: "Sweet & shy" },
    { id: "feels", name: "Big feelings" },
    { id: "life", name: "Everyday" },
    { id: "duo", name: "Together" },
  ],
  cover: ["pleading-eyes", "heart-hug", "happy-smile"],
  stickers: [
    // Sweet & shy
    { id: "pleading-eyes", name: "Pleading eyes", caption: "Pleeease?", group: "sweet", tags: "lumi bunny please sorry begging puppy eyes pookie", scene: "paws clasped together under her chin, ears folded slightly back, looking up with giant watery glossy brown eyes and a tiny pout" },
    { id: "happy-smile", name: "Happy smile", caption: "Hii!", group: "sweet", tags: "lumi bunny happy smile cute hello yay", scene: "smiling brightly with her mouth open showing a tiny pink tongue, ears perked straight up, paws neatly together" },
    { id: "heart-hug", name: "Heart hug", caption: "For you.", group: "sweet", tags: "lumi bunny love heart hug thank you sweet care", scene: "hugging a glossy 3D bright red heart plush against her chest with both paws, eyes closed in a blissful smile" },
    { id: "shy-blush", name: "Shy blush", caption: "Hehe.", group: "sweet", tags: "lumi bunny shy blush cute awkward crushing hehe", scene: "covering her smiling mouth with both fluffy paws, bright pink glowing cheeks, one long ear flopping shyly over her forehead" },
    { id: "love-eyes", name: "Love eyes", caption: "I love it.", group: "sweet", tags: "lumi bunny love heart eyes crush adore obsessed", scene: "glossy pink heart-shaped highlights filling both eyes, both paws pressed to her blushing cheeks, a dreamy open-mouthed smile, two tiny red hearts floating beside her ears" },
    { id: "happy-eyes", name: "Happy eyes", caption: "Yay!", group: "sweet", tags: "lumi bunny happy joy smile glad excited yay", scene: "eyes squeezed shut into two happy upward arcs, a wide joyful smile, both paws raised to shoulder height, ears bouncing upright" },
    { id: "blush-melt", name: "Melting", caption: "Aww, stop it.", group: "sweet", tags: "lumi bunny aww melt blush flattered soft touched", scene: "head tilted to one side, both paws cupping her own cheeks, very deep rosy blush spreading across her face, eyes soft and half closed, a tiny bashful smile" },
    { id: "flying-kiss", name: "Flying kiss", caption: "Mwah.", group: "sweet", tags: "lumi bunny kiss flying kiss mwah love", scene: "blowing a kiss from one open paw, eyes closed, lips puckered, a small glossy red heart floating away from her paw" },
    { id: "flower-gift", name: "A flower", caption: "I picked this for you.", group: "sweet", tags: "lumi bunny flower daisy gift sorry sweet for you", scene: "shyly holding out a single white daisy toward the camera with both paws, looking up from under her lashes, blushing, one ear tipped forward" },
    { id: "thank-you", name: "Thank you", caption: "Thank you!", group: "sweet", tags: "lumi bunny thank you thanks grateful shukriya bow", scene: "both paws pressed together at her chest, head bowed slightly, eyes closed in a warm grateful smile, ears gently lowered" },
    { id: "sparkle-eyes", name: "Sparkle eyes", caption: "Wow!", group: "sweet", tags: "lumi bunny wow amazing sparkle stars impressed want", scene: "eyes extra wide and filled with bright star-shaped sparkles, mouth open in a small amazed smile, paws clasped together in front of her chest, ears straight up" },
    { id: "wave-hi", name: "Wave", caption: "Hi hi!", group: "sweet", tags: "lumi bunny hi hello hey wave bye greeting", scene: "waving one raised paw at the camera with a cheerful closed-mouth smile, head tilted slightly, the other paw resting on her chest" },

    // Big feelings
    { id: "crying-river", name: "Crying river", caption: "I'm not okay.", group: "feels", tags: "lumi bunny crying sad tears hurt emotional upset", scene: "ears drooped completely flat down her sides, mouth wide open crying, dramatic glossy blue waterfall tears gushing from both eyes" },
    { id: "angry-pout", name: "Angry pout", caption: "Hmph.", group: "feels", tags: "lumi bunny angry pout mad hmph naraaz attitude", scene: "arms crossed tightly over her chest, chubby cheeks puffed out like a marshmallow, furrowed brows, ears pinned sharply back" },
    { id: "shocked-gasp", name: "Shocked", caption: "OMG.", group: "feels", tags: "lumi bunny shocked omg gasp surprised what", scene: "both paws pressed to her chubby cheeks in shock, eyes wide open, mouth in an O shape, ears standing bolt upright" },
    { id: "scared-peek", name: "Scared peek", caption: "Is it gone?", group: "feels", tags: "lumi bunny scared hiding nervous oops peek", scene: "pulling her own two long fluffy ears down in front of her face like a curtain, peeking nervously through the gap with one eye" },
    { id: "no-cross", name: "Nope", caption: "No.", group: "feels", tags: "lumi bunny no nope cancel stop wrong reject", scene: "crossing her two white furry forearms in an X shape in front of her chest with a firm, serious expression" },
    { id: "question-tilt", name: "Confused", caption: "Huh?", group: "feels", tags: "lumi bunny confused huh what question thinking", scene: "tilting her head to the side, one ear up and one ear flopped down, a puzzled little frown, two glossy 3D question marks floating above her head" },
    { id: "giggle", name: "Giggles", caption: "Hahaha.", group: "feels", tags: "lumi bunny laugh giggle lol haha funny", scene: "laughing out loud with her eyes squeezed shut, one paw on her tummy and the other wiping a tiny tear of laughter, ears thrown back" },
    { id: "sulking", name: "Sulking", caption: "Don't talk to me.", group: "feels", tags: "lumi bunny sulk upset ignore katti hurt silent", scene: "turned three-quarters away from the camera with her arms folded, glancing back over her shoulder with a small wounded pout, ears drooping, one tiny tear in the corner of her eye" },
    { id: "miss-you", name: "Miss you", caption: "Come back soon.", group: "feels", tags: "lumi bunny miss you lonely far away waiting", scene: "hugging a small pastel pink heart-shaped pillow tightly, cheek resting on it, eyes glossy and wistful, looking off to one side, ears lowered" },

    // Everyday
    { id: "thumbs-up", name: "Thumbs up", caption: "Okay!", group: "life", tags: "lumi bunny ok okay thumbs up done yes good", scene: "winking one big brown eye and giving a cheerful double thumbs-up with her fluffy white paws" },
    { id: "laptop-stress", name: "Deadline", caption: "So. Much. Work.", group: "life", tags: "lumi bunny work busy coding laptop stress deadline", scene: "wearing cute oversized round glasses, typing furiously on a small silver laptop, a tiny sweat drop on her forehead, mouth pressed in a worried line" },
    { id: "boba-sip", name: "Boba sip", caption: "Go on, tell me.", group: "life", tags: "lumi bunny boba tea sipping gossip drama chill", scene: "holding a brown-sugar boba cup with both paws, sipping through a wide straw while glancing sideways" },
    { id: "hungry-carrot", name: "Carrot time", caption: "Snack first.", group: "life", tags: "lumi bunny hungry food eating snack carrot", scene: "holding a bright orange leafy carrot in both paws, taking an enthusiastic bite with happy closed eyes and full cheeks" },
    { id: "sleepy-yawn", name: "Sleepy", caption: "So sleepy.", group: "life", tags: "lumi bunny sleepy tired yawn nap", scene: "wearing a pastel blue nightcap, rubbing one sleepy eye with a paw while yawning widely, ears drooping" },
    { id: "good-night", name: "Good night", caption: "Sweet dreams.", group: "life", tags: "lumi bunny good night gn sleep dreams bedtime", scene: "fast asleep with a peaceful smile, cheek resting on her folded paws on a small cream pillow, a soft lilac blanket around her shoulders, ears relaxed down" },
    { id: "good-morning", name: "Good morning", caption: "Morning!", group: "life", tags: "lumi bunny good morning gm wake up fresh", scene: "holding a small pastel pink mug of warm milk in both paws with a little steam rising, eyes bright, a fresh sunny smile, fur slightly tousled between her ears" },
    { id: "party-celebrate", name: "Party", caption: "Congrats!", group: "life", tags: "lumi bunny party celebrate birthday congrats yay", scene: "wearing a tiny gold-and-pink party hat between her ears, blowing a striped party horn, paws raised high, pastel confetti falling around her" },

    // Together, with Mimi
    { id: "couple-hug", name: "Big hug", caption: "Never letting go.", group: "duo", tags: "lumi mimi bunny couple hug together love bestie cuddle", scene: `Lumi and ${MIMI}, hugging each other tightly cheek to cheek, both with eyes closed and blissful smiles, both blushing` },
    { id: "couple-kiss", name: "Cheek kiss", caption: "Mwah!", group: "duo", tags: "lumi mimi bunny couple kiss cheek love cute", scene: `${MIMI}, giving Lumi a gentle kiss on the cheek while Lumi blushes deep pink with wide surprised happy eyes, a small red heart floating between their ears` },
    { id: "couple-heart", name: "Our heart", caption: "You and me.", group: "duo", tags: "lumi mimi bunny couple heart love together anniversary", scene: `Lumi and ${MIMI}, side by side, holding one large glossy red heart together between them with their paws, both smiling at the camera` },
    { id: "couple-nap", name: "Nap together", caption: "Five more minutes.", group: "duo", tags: "lumi mimi bunny couple sleep nap cosy cuddle night", scene: `Lumi and ${MIMI}, asleep leaning against each other with their heads touching, sharing one soft pastel pink blanket, peaceful smiles` },
    { id: "couple-cheer", name: "High five", caption: "We did it!", group: "duo", tags: "lumi mimi bunny couple high five team win bestie yay", scene: `Lumi and ${MIMI}, giving each other a high five with one paw each, both laughing with happy closed eyes, ears bouncing` },
  ],
};
