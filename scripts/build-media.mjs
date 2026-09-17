/**
 * Builds every media asset the site needs, from the originals in Google Drive.
 *
 *   node scripts/build-media.mjs [--only <game-id>] [--force]
 *
 * Reads media.picks.json — each game lists several short segments, cut from the
 * timecodes in its "Clips to cut" doc. They are encoded as separate clips and
 * the page plays them back to back with a crossfade, rather than shipping one
 * long video per game.
 *
 * Writes into public/media/<game-id>/:
 *   clip-1.mp4, clip-2.mp4, ...   gameplay clips, played in order
 *   poster.jpg                    first frame, shown before the first clip loads
 *   logo.png                      trimmed and size-capped
 *   still-N.webp                  screenshots stepped through on hover
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_ROOT = "G:/My Drive/Barzie_Showreel/Games";
const OUT_ROOT = path.join(ROOT, "public", "media");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const force = args.includes("--force");

/** Long edge of an encoded clip. Several clips per game, so keep each modest. */
const CLIP_EDGE = 900;
const STILL_EDGE = 1440;

const findBin = (bin) => {
  const w = path.join(
    process.env.LOCALAPPDATA ?? "",
    "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin",
    bin + ".exe",
  );
  return fs.existsSync(w) ? w : bin;
};
const FFMPEG = process.env.FFMPEG ?? findBin("ffmpeg");
const FFPROBE = process.env.FFPROBE ?? findBin("ffprobe");

const run = (cmd, a) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "pipe"] });
const ensure = (d) => fs.mkdirSync(d, { recursive: true });
const kb = (f) => Math.round(fs.statSync(f).size / 1024);
const resolveSrc = (p) => (/^([A-Za-z]:|[\\/])/.test(p) ? p : path.join(SRC_ROOT, p));

const scaleFilter = (edge) =>
  `scale='if(gt(iw,ih),min(${edge},iw),-2)':'if(gt(iw,ih),-2,min(${edge},ih))',` +
  `scale=trunc(iw/2)*2:trunc(ih/2)*2`;

function probeSize(file) {
  const out = execFileSync(
    FFPROBE,
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  ).trim();
  const [width, height] = out.split(",").map(Number);
  return { width, height };
}

function buildClips(id, pick) {
  const segments = pick?.segments ?? [];
  if (!segments.length) {
    console.log("  - no segments yet");
    return [];
  }

  const outDir = path.join(OUT_ROOT, id);
  ensure(outDir);

  // Clip count can shrink between runs; drop stale clips and the old single-loop
  // outputs from the previous pipeline.
  for (const f of fs.readdirSync(outDir)) {
    const m = f.match(/^clip-(\d+)\.mp4$/);
    if (m && Number(m[1]) > segments.length) fs.rmSync(path.join(outDir, f));
  }
  for (const f of ["loop.mp4", "loop.webm"]) {
    const stale = path.join(outDir, f);
    if (fs.existsSync(stale)) fs.rmSync(stale);
  }

  const made = [];
  segments.forEach((seg, i) => {
    const input = resolveSrc(seg.src ?? pick.src);
    const out = path.join(outDir, `clip-${i + 1}.mp4`);
    if (!fs.existsSync(input)) {
      console.log(`  ! source missing: ${seg.src ?? pick.src}`);
      return;
    }
    if (force || !fs.existsSync(out)) {
      run(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-ss", seg.start, "-i", input,
        "-t", String(seg.duration), "-an", "-vf", scaleFilter(CLIP_EDGE),
        "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-profile:v", "high",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
    }
    const size = probeSize(out);
    made.push({ base: `${id}/clip-${i + 1}`, ...size });
    console.log(`  ok clip-${i + 1}.mp4  ${kb(out)} KB  ${size.width}x${size.height}`);
  });

  // Poster from the first segment, so the card has a frame before any fetch.
  const poster = path.join(outDir, "poster.jpg");
  const first = segments[0];
  const firstIn = resolveSrc(first.src ?? pick.src);
  if ((force || !fs.existsSync(poster)) && fs.existsSync(firstIn)) {
    run(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-ss", first.start, "-i", firstIn,
      "-frames:v", "1", "-vf", scaleFilter(CLIP_EDGE), "-q:v", "4", poster]);
  }

  return made;
}

function buildLogo(id, srcDir) {
  if (!fs.existsSync(srcDir)) return false;
  const logo = fs.readdirSync(srcDir).find((f) => /logo.*\.png$/i.test(f));
  if (!logo) return false;
  const outDir = path.join(OUT_ROOT, id);
  const out = path.join(outDir, "logo.png");
  if (!force && fs.existsSync(out)) return true;
  ensure(outDir);
  run(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-i", path.join(srcDir, logo),
    "-vf", "scale='if(gt(iw,ih),min(480,iw),-1)':'if(gt(iw,ih),-1,min(200,ih))'", out]);
  console.log(`  ok logo.png   ${kb(out)} KB`);
  return true;
}

function buildStills(id, srcDir, override, pick) {
  const dir = override ? resolveSrc(override) : path.join(srcDir, "stills");
  const outDir = path.join(OUT_ROOT, id);

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
    if (files.length) {
      ensure(outDir);
      const written = files.map((f, i) => {
        const out = path.join(outDir, `still-${i + 1}.webp`);
        if (force || !fs.existsSync(out)) {
          run(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-i", path.join(dir, f),
            "-vf", scaleFilter(STILL_EDGE), "-quality", "82", out]);
        }
        return `${id}/still-${i + 1}.webp`;
      });
      console.log(`  ok ${written.length} still(s)`);
      return { stills: written, derived: false };
    }
  }

  // No screenshots supplied: pull one frame from each segment instead. Real
  // frames of the real game, but arbitrary moments - replace when possible.
  const segs = pick?.segments ?? [];
  if (!segs.length) return { stills: [], derived: false };
  ensure(outDir);
  const written = [];
  segs.forEach((seg, i) => {
    const input = resolveSrc(seg.src ?? pick.src);
    if (!fs.existsSync(input)) return;
    const out = path.join(outDir, `still-${i + 1}.webp`);
    if (force || !fs.existsSync(out)) {
      run(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-ss", seg.start, "-i", input,
        "-frames:v", "1", "-vf", scaleFilter(STILL_EDGE), "-quality", "82", out]);
    }
    written.push(`${id}/still-${i + 1}.webp`);
  });
  console.log(`  ok ${written.length} still(s) derived from footage`);
  return { stills: written, derived: true };
}

// --- main --------------------------------------------------------------------

const picks = JSON.parse(fs.readFileSync(path.join(ROOT, "media.picks.json"), "utf8"));
const DIRS = {
  "lord-of-the-board": "Lord of the Board",
  opa: "OPA",
  "hexa-coin": "Hexa Coin",
  kindred: "Kindred",
  "spades-royale": "Spades Royale",
  acolyte: "Acolyte",
  "dust-till-gone": "Dust till' Gone",
};

if (!fs.existsSync(SRC_ROOT)) {
  console.error(`Source root not found: ${SRC_ROOT}`);
  console.error("Is Google Drive File Stream mounted?");
  process.exit(1);
}

const summary = [];
const manifest = {};
for (const [id, dirName] of Object.entries(DIRS)) {
  if (only && only !== id) continue;
  console.log("\n" + id);
  const srcDir = path.join(SRC_ROOT, dirName);
  const pick = picks[id];

  const clips = buildClips(id, pick);
  const logo = buildLogo(id, srcDir);
  const { stills, derived } = buildStills(id, srcDir, pick?.stillsDir, pick);

  summary.push({
    id,
    clips: clips.length || "-",
    logo: logo ? "yes" : "-",
    stills: stills.length ? stills.length + (derived ? " (derived)" : "") : "-",
  });
  manifest[id] = { stills, clips };
}

fs.writeFileSync(path.join(ROOT, "media.manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("\n--- summary ---");
console.table(summary);
console.log("\nWrote media.manifest.json. Entries marked (derived) are frames pulled");
console.log("from gameplay footage; replace them once real screenshots arrive.");
