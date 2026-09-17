/**
 * Copies the output of `npm run media` into src/data/games.ts — the stills list
 * and the encoded clip list for each game.
 *
 * Line-oriented on purpose: it only rewrites the `stills:` and `clips:` fields
 * inside a known game's object and leaves prose, comments and every other field
 * alone. `clips:` may already be a multi-line block from a previous run, so the
 * whole block is consumed before the replacement is written — replacing just
 * the opening line duplicates the body.
 *
 *   node scripts/apply-manifest.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GAMES = path.join(ROOT, "src", "data", "games.ts");
const MANIFEST = path.join(ROOT, "media.manifest.json");

if (!fs.existsSync(MANIFEST)) {
  console.error("No media.manifest.json — run `npm run media` first.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const lines = fs.readFileSync(GAMES, "utf8").split("\n");

const out = [];
let current = null;
let changed = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const idMatch = line.match(/^\s*id:\s*"([^"]+)",\s*$/);
  if (idMatch) {
    current = manifest[idMatch[1]] ? idMatch[1] : null;
    out.push(line);
    continue;
  }

  if (current) {
    const indent = (line.match(/^(\s*)/) || ["", ""])[1];

    if (/^\s*stills:\s*\[/.test(line)) {
      const stills = manifest[current].stills;
      out.push(`${indent}stills: [${stills.map((s) => `"${s}"`).join(", ")}],`);
      changed++;
      continue;
    }

    if (/^\s*clips:\s*\[/.test(line)) {
      // Consume an existing multi-line block, if that's what this is.
      if (!/\],\s*$/.test(line)) {
        while (i + 1 < lines.length && !new RegExp(`^${indent}\\],\\s*$`).test(lines[i + 1])) i++;
        i++; // the closing "],"
      }
      const clips = manifest[current].clips ?? [];
      if (!clips.length) {
        out.push(`${indent}clips: [],`);
      } else {
        out.push(`${indent}clips: [`);
        for (const c of clips) {
          out.push(`${indent}  { base: "${c.base}", width: ${c.width}, height: ${c.height} },`);
        }
        out.push(`${indent}],`);
      }
      changed++;
      continue;
    }
  }

  out.push(line);
}

fs.writeFileSync(GAMES, out.join("\n"));
console.log(`updated ${changed} field(s) across ${Object.keys(manifest).length} game(s)`);
