/**
 * The portfolio roster.
 *
 * Every description below is Bar's own wording — the three mobile titles from
 * the copy he wrote, the three older ones carried over verbatim from his
 * previous site. Nothing here is paraphrased or generated.
 *
 * Fields that are `null` are GENUINELY UNKNOWN and must be supplied by Bar.
 * `npm run check:content` reports every one that remains.
 *
 * Roles are deliberately absent per game: Bar's role is the same across every
 * title and is stated once in the intro.
 */

/** Intrinsic shape of the source capture. Informational — every card renders
 *  in a uniform box and the media is fitted inside it, never cropped. */
export type Ratio = string;

export interface GameClip {
  /** Path under /media, no extension — e.g. "opa/clip-1" */
  base: string;
  width: number;
  height: number;
}

export interface Game {
  id: string;
  title: string;
  /** Bar's own words about THE GAME. Not about Bar. */
  description: string | null;
  /** Small quiet marker, e.g. "Mobile · Commercial". */
  context: string | null;
  /** Accent pulled from the game's own art. */
  accent: string | null;
  /** Wordmark/logo path under /media. null = needs a type-set treatment. */
  logo: string | null;
  /** Stills stepped through on hover, in display order. */
  stills: string[];
  /** Short gameplay clips, played back to back with a crossfade. */
  clips: GameClip[];
  ratio: Ratio;
  link?: { label: string; href: string };
}

export const games: Game[] = [
  {
    id: "lord-of-the-board",
    title: "Lord of the Board",
    description:
      "A competitive mobile take on classic Backgammon, featuring real-time multiplayer matches against players around the world. The game expands the traditional experience with tournaments, leaderboards, collectibles, social features, progression systems, and a variety of side activities and mini-games.",
    context: "Mobile · Commercial",
    accent: "#B77533",
    logo: null,
    stills: ["lord-of-the-board/still-1.webp", "lord-of-the-board/still-2.webp", "lord-of-the-board/still-3.webp", "lord-of-the-board/still-4.webp"],
    clips: [
      { base: "lord-of-the-board/clip-1", width: 900, height: 506 },
      { base: "lord-of-the-board/clip-2", width: 900, height: 506 },
      { base: "lord-of-the-board/clip-3", width: 900, height: 506 },
      { base: "lord-of-the-board/clip-4", width: 900, height: 506 },
    ],
    ratio: "16 / 9",
  },
  {
    id: "opa",
    title: "OPA!",
    description:
      "A colorful multiplayer card game inspired by Crazy Eights, built around fast-paced matches where players compete to empty their hand by matching colors, numbers, and power cards. Beyond the core PvP gameplay, OPA! features progression systems, themed worlds, daily missions, special events, and competitive leaderboards.",
    context: "Mobile · Commercial",
    accent: "#DCA048",
    logo: null,
    stills: ["opa/still-1.webp", "opa/still-2.webp", "opa/still-3.webp", "opa/still-4.webp"],
    clips: [
      { base: "opa/clip-1", width: 416, height: 900 },
      { base: "opa/clip-2", width: 416, height: 900 },
      { base: "opa/clip-3", width: 416, height: 900 },
      { base: "opa/clip-4", width: 416, height: 900 },
      { base: "opa/clip-5", width: 416, height: 900 },
      { base: "opa/clip-6", width: 416, height: 900 },
      { base: "opa/clip-7", width: 416, height: 900 },
      { base: "opa/clip-8", width: 416, height: 900 },
      { base: "opa/clip-9", width: 416, height: 900 },
      { base: "opa/clip-10", width: 416, height: 900 },
      { base: "opa/clip-11", width: 416, height: 900 },
      { base: "opa/clip-12", width: 416, height: 900 },
      { base: "opa/clip-13", width: 416, height: 900 },
      { base: "opa/clip-14", width: 416, height: 900 },
      { base: "opa/clip-15", width: 416, height: 900 },
      { base: "opa/clip-16", width: 416, height: 900 },
    ],
    ratio: "9 / 16",
  },
  {
    id: "hexa-coin",
    title: "Hexa Coin",
    description:
      "A casual puzzle game centered around sorting and stacking colorful coins through simple, intuitive interactions. Its relaxing visual style and accessible mechanics gradually evolve into more strategic and challenging puzzles as players progress through increasingly complex levels.",
    context: "Mobile · Commercial",
    accent: "#FFC612",
    logo: "hexa-coin/logo.png",
    stills: ["hexa-coin/still-1.webp", "hexa-coin/still-2.webp", "hexa-coin/still-3.webp", "hexa-coin/still-4.webp", "hexa-coin/still-5.webp"],
    clips: [
      { base: "hexa-coin/clip-1", width: 404, height: 900 },
      { base: "hexa-coin/clip-2", width: 404, height: 900 },
      { base: "hexa-coin/clip-3", width: 404, height: 900 },
      { base: "hexa-coin/clip-4", width: 416, height: 900 },
      { base: "hexa-coin/clip-5", width: 416, height: 900 },
    ],
    ratio: "9 / 16",
  },
  {
    id: "kindred",
    title: "Kindred",
    description:
      "A 2D Metroidvania for the PC, following a young hero in a quest for survival. Weapons are armed with unique traversal abilities. Kindred is all about fast-paced action and will require players to master their abilities.",
    context: "PC · Commercial",
    accent: "#1DBC70",
    logo: "kindred/logo.png",
    stills: ["kindred/still-1.webp", "kindred/still-2.webp", "kindred/still-3.webp", "kindred/still-4.webp"],
    clips: [
      { base: "kindred/clip-1", width: 900, height: 506 },
      { base: "kindred/clip-2", width: 900, height: 506 },
      { base: "kindred/clip-3", width: 900, height: 506 },
      { base: "kindred/clip-4", width: 900, height: 506 },
    ],
    ratio: "16 / 9",
    link: {
      label: "R2G Accelerator",
      href: "https://www.road2.co.il/portfolio/?_industry=games",
    },
  },
  {
    id: "spades-royale",
    title: "Spades Royale",
    description: null,
    context: null,
    accent: "#F5B337",
    logo: "spades-royale/logo.png",
    stills: ["spades-royale/still-1.webp", "spades-royale/still-2.webp", "spades-royale/still-3.webp", "spades-royale/still-4.webp", "spades-royale/still-5.webp"],
    clips: [
      { base: "spades-royale/clip-1", width: 900, height: 676 },
      { base: "spades-royale/clip-2", width: 900, height: 676 },
      { base: "spades-royale/clip-3", width: 900, height: 676 },
      { base: "spades-royale/clip-4", width: 900, height: 676 },
      { base: "spades-royale/clip-5", width: 900, height: 676 },
    ],
    ratio: "4 / 3",
  },
  {
    id: "acolyte",
    title: "Acolyte",
    description:
      "A 2D Bullet-Hell PC game. You're a powerful acolyte, tasked with banishing creatures using your divine magic. Unique obtainable power ups will spawn during your encounters, each with its pros and cons, choose them wisely.",
    context: "PC · Student project",
    accent: "#D8B827",
    logo: "acolyte/logo.png",
    stills: ["acolyte/still-1.webp", "acolyte/still-2.webp", "acolyte/still-3.webp", "acolyte/still-4.webp"],
    clips: [
      { base: "acolyte/clip-1", width: 900, height: 506 },
      { base: "acolyte/clip-2", width: 900, height: 506 },
      { base: "acolyte/clip-3", width: 900, height: 506 },
      { base: "acolyte/clip-4", width: 900, height: 506 },
    ],
    ratio: "16 / 9",
  },
  {
    id: "dust-till-gone",
    title: "Dust 'till Gone",
    description:
      "A 2D Platformer for PC made in 48 hours. You're a lost soul, wandering around an unknown spirit world. Swing around and collect memories in the form of butterflies, recover your past and unveil your purpose.",
    context: "PC · Game jam, 48h",
    accent: "#5A79AC",
    logo: "dust-till-gone/logo.png",
    stills: ["dust-till-gone/still-1.webp", "dust-till-gone/still-2.webp", "dust-till-gone/still-3.webp"],
    clips: [
      { base: "dust-till-gone/clip-1", width: 900, height: 506 },
      { base: "dust-till-gone/clip-2", width: 900, height: 506 },
      { base: "dust-till-gone/clip-3", width: 900, height: 506 },
    ],
    ratio: "16 / 9",
  },
];

/** Every field that must be supplied before this site can go live. */
export function missingContent(): { id: string; fields: string[] }[] {
  return games
    .map((g) => {
      const fields: string[] = [];
      if (!g.description) fields.push("description");
      if (!g.context) fields.push("context");
      if (!g.accent) fields.push("accent");
      if (!g.logo) fields.push("logo");
      if (g.stills.length === 0) fields.push("stills");
      if (g.clips.length === 0) fields.push("clips");
      return { id: g.id, fields };
    })
    .filter((r) => r.fields.length > 0);
}
