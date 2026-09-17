# barziee.github.io

Portfolio site — Astro + Tailwind, static, deployed to GitHub Pages.

## Working on it

```bash
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the built site
```

## Content

Everything on the page comes from `src/data/games.ts`. To change a game's text,
add a game, or reorder the roster, edit that file — no layout code involved.

Fields set to `null` are **genuinely unknown** and waiting on real information.
They render as loud placeholder markers rather than being filled with
plausible-sounding text.

```bash
npm run check:content    # lists every unsupplied field
RELEASE=1 npm run check:content   # exits non-zero if any remain
```

Run that before going live. It is the guard that stops invented copy shipping.

## Media

Source video, logos and screenshots live in Google Drive, reachable through the
Drive File Stream mount:

```
G:\My Drive\Barzie_Showreel\Games\<Game>\
  <clips>.mp4
  *Logo*.png
  stills\          <- drop hand-picked screenshots here
```

`media.picks.json` records which clip and which moment becomes each game's
gameplay video. Timecodes come from the "Clips to cut" docs in each Drive folder.

A pick's `src` may be a path relative to the Drive Games folder or an absolute
path anywhere on disk. `stillsDir` overrides where screenshots are read from,
so assets handed over directly can be used without filing them into Drive.

Only MP4 is produced. VP9/WebM measured consistently *larger* than H.264 on
these short, high-motion clips, and a `<source>` list is evaluated in order —
so shipping WebM first meant every capable browser fetched the bigger file.

```bash
npm run media               # encode everything, then sync games.ts
npm run media -- --only opa # just one game
npm run media -- --force    # re-encode even if outputs exist
```

This writes into `public/media/<game-id>/`:

| File | What it is |
|---|---|
| `loop.mp4` | the gameplay video shown on press |
| `poster.jpg` | first frame, shown before the video loads |
| `logo.png` | trimmed and size-capped |
| `still-N.webp` | the screenshots stepped through on hover |

If a game has no `stills/` folder yet, frames are pulled from its gameplay
footage as a stand-in. Those are real frames of the real game, but they should
be replaced with hand-picked screenshots — the summary marks them `(derived)`.

### Known asset conflict

OPA!'s supplied key art is 3:4 but its gameplay capture is 9:16. The card is set
to 3:4 to suit the stills, so attaching the video will crop it. Either re-cut
OPA's stills from the 9:16 footage, or accept the crop — the card's `ratio`
field decides.

## Card behaviour

- **At rest** — one static screenshot. Nothing moves.
- **On hover** — steps through the screenshots.
- **On press** — plays the gameplay video, if one is attached.
- **Always** — arrow buttons, dots, and left/right arrow keys step manually.

Nothing animates unprompted, so there is no ambient motion to pause. The
"Pause motion" control and `prefers-reduced-motion` both suppress the hover
auto-advance; manual stepping and pressing to play stay available, since those
are user-initiated.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages. The repository's Pages source must be set to
**GitHub Actions** (Settings → Pages) — not a branch.
