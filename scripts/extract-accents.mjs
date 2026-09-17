/**
 * Derives each game's accent colour from its own artwork, then guarantees the
 * result is actually legible.
 *
 * Sampling: the logo if there is one (it carries the brand colour), otherwise
 * the first screenshot. Pixels are bucketed by hue and weighted by saturation,
 * so a large dull background loses to a smaller vivid mark. Transparent,
 * near-white and near-black pixels are ignored.
 *
 * Legibility: the accent is used as text on the dark card surface, so the
 * chosen hue is lightened until it clears WCAG AA (4.5:1). This is why the
 * accents are computed rather than eyeballed — several of the source logos are
 * mid-tone colours that fail contrast at their native lightness.
 *
 *   node scripts/extract-accents.mjs [--write]
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = path.join(ROOT, "public", "media");
const GAMES_TS = path.join(ROOT, "src", "data", "games.ts");

/** Must match --color-surface in global.css. */
const SURFACE = [0x1c, 0x1c, 0x20];
const MIN_CONTRAST = 4.5;

const FFMPEG =
  process.env.FFMPEG ??
  (() => {
    const w = path.join(
      process.env.LOCALAPPDATA ?? "",
      "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe",
    );
    return fs.existsSync(w) ? w : "ffmpeg";
  })();

const SIZE = 32;

function samplePixels(file) {
  const raw = execFileSync(
    FFMPEG,
    ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", `scale=${SIZE}:${SIZE}`,
      "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "pipe:1"],
    { maxBuffer: 1 << 24 },
  );
  const px = [];
  for (let i = 0; i < raw.length; i += 4) {
    const [r, g, b, a] = [raw[i], raw[i + 1], raw[i + 2], raw[i + 3]];
    if (a < 200) continue; // transparent
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max < 28) continue;       // near-black
    if (min > 232) continue;      // near-white
    if (max - min < 24) continue; // grey
    px.push([r, g, b]);
  }
  return px;
}

const rgbToHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
};

const hslToRgb = ([h, s, l]) => {
  if (!s) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
};

const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

function accentFrom(file) {
  const px = samplePixels(file);
  if (px.length < 8) return null;

  // Bucket by hue, weighted by saturation, so a vivid mark beats a dull field.
  const BUCKETS = 18;
  const weight = new Array(BUCKETS).fill(0);
  const members = Array.from({ length: BUCKETS }, () => []);
  for (const p of px) {
    const [h, s, l] = rgbToHsl(p);
    if (l < 0.12 || l > 0.92) continue;
    const b = Math.min(BUCKETS - 1, Math.floor(h * BUCKETS));
    weight[b] += s * s;
    members[b].push([h, s, l]);
  }
  const best = weight.indexOf(Math.max(...weight));
  if (!members[best]?.length) return null;

  const pick = members[best].sort((a, b) => b[1] - a[1])[Math.floor(members[best].length * 0.15)];
  let [h, s, l] = pick;
  s = Math.min(1, Math.max(s, 0.55));

  // Lighten until it is legible on the card surface.
  let rgb = hslToRgb([h, s, l]);
  let guard = 0;
  while (contrast(rgb, SURFACE) < MIN_CONTRAST && l < 0.95 && guard++ < 60) {
    l += 0.02;
    rgb = hslToRgb([h, s, l]);
  }
  return { hex: hex(rgb), contrast: +contrast(rgb, SURFACE).toFixed(2) };
}

// --- main --------------------------------------------------------------------

const ids = fs.existsSync(MEDIA)
  ? fs.readdirSync(MEDIA).filter((d) => fs.statSync(path.join(MEDIA, d)).isDirectory())
  : [];

const results = {};
for (const id of ids) {
  const dir = path.join(MEDIA, id);
  const source = ["logo.png", "still-1.webp", "poster.jpg"]
    .map((f) => path.join(dir, f))
    .find((f) => fs.existsSync(f));
  if (!source) continue;

  try {
    const r = accentFrom(source);
    if (r) {
      results[id] = r.hex;
      console.log(`  ${id.padEnd(20)} ${r.hex}  contrast ${r.contrast}:1  (from ${path.basename(source)})`);
    } else {
      console.log(`  ${id.padEnd(20)} — no usable colour found`);
    }
  } catch (e) {
    console.log(`  ${id.padEnd(20)} — failed: ${e.message.split("\n")[0]}`);
  }
}

if (process.argv.includes("--write")) {
  const lines = fs.readFileSync(GAMES_TS, "utf8").split("\n");
  let current = null;
  let n = 0;
  const out = lines.map((line) => {
    const m = line.match(/^\s*id:\s*"([^"]+)",\s*$/);
    if (m) { current = results[m[1]] ? m[1] : null; return line; }
    if (current && /^\s*accent:\s*null,\s*$/.test(line)) {
      n++;
      const indent = line.match(/^(\s*)/)[1];
      const id = current;
      current = null;
      return `${indent}accent: "${results[id]}",`;
    }
    return line;
  });
  fs.writeFileSync(GAMES_TS, out.join("\n"));
  console.log(`\n✔ wrote ${n} accent(s) into games.ts (existing ones left alone)`);
} else {
  console.log("\n(dry run — pass --write to apply)");
}
