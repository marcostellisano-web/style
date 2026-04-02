/**
 * Generates detailed outfit + vibe descriptions for every image in
 * /style-board-photos/ and writes them to
 * web-app/assets/data/board-image-descriptions.json.
 *
 * Only processes images that don't already have a cached description,
 * so re-running is safe and cheap. Pass --force to re-describe everything.
 */

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const PHOTOS_DIR = path.join(__dirname, "../../style-board-photos");
const OUTPUT_FILE = path.join(
  __dirname,
  "../../web-app/assets/data/board-image-descriptions.json"
);
const FORCE = process.argv.includes("--force");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const DESCRIPTION_PROMPT = `You are describing a style/outfit photo for a personal stylist. Analyse the image and provide a structured description.

GARMENTS: List every visible clothing item with precise details — the exact type, cut/fit, color, and material or texture where visible. Be specific (e.g. "slim-fit black wool trousers with a clean break at the ankle", "oversized ecru linen shirt with dropped shoulders and rolled sleeves", "ribbed dark navy crewneck knit"). Name each piece on its own line.

FOOTWEAR: Shoe or boot type, color, sole style, and any distinguishing details.

ACCESSORIES: Everything visible — belt, bag, watch, sunglasses, jewellery, hat, scarf, pocket square, socks, etc. If none are visible, say "None visible".

VIBE: 2–3 sentences capturing the overall aesthetic, mood, colour palette, and style sensibility. Mention the energy the outfit communicates (e.g. relaxed European elegance, sharp off-duty tailoring, dark minimal streetwear).

Be concrete and precise. Avoid vague words like "stylish" or "fashionable" — describe exactly what you see.`;

async function main() {
  const client = new Anthropic();

  // Load existing descriptions
  let existing = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
    } catch {
      console.warn("Could not parse existing descriptions file — starting fresh.");
    }
  }

  // Find all image files
  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort();

  if (!files.length) {
    console.log("No images found in style-board-photos/");
    return;
  }

  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const key = `/style-board-photos/${file}`;

    if (!FORCE && existing[key]?.description) {
      console.log(`  skip  ${file} (already described)`);
      skipped++;
      continue;
    }

    console.log(`  →     ${file}`);

    const imagePath = path.join(PHOTOS_DIR, file);
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString("base64");
    const ext = path.extname(file).toLowerCase();
    const mediaType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: DESCRIPTION_PROMPT },
            ],
          },
        ],
      });

      const description = response.content[0]?.text?.trim() || "";
      existing[key] = {
        description,
        generated_at: new Date().toISOString(),
      };
      processed++;
    } catch (err) {
      console.error(`  ERROR ${file}: ${err.message}`);
    }

    // Small pause to avoid rate-limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  // Remove entries for images that no longer exist
  const validKeys = new Set(files.map((f) => `/style-board-photos/${f}`));
  for (const key of Object.keys(existing)) {
    if (!validKeys.has(key)) {
      console.log(`  clean ${key} (image removed)`);
      delete existing[key];
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2));
  console.log(`\nDone. ${processed} described, ${skipped} skipped.`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
