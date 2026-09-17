/**
 * Fails the build while any content is still unsupplied.
 *
 * The point is to make it impossible to quietly ship a placeholder — or, worse,
 * to be tempted to fill a gap with plausible-sounding invention just to make
 * the build pass.
 *
 * Run: node scripts/check-content.ts   (Node 22+ strips the types natively)
 */
import { games, missingContent } from "../src/data/games.ts";
import { site } from "../src/data/site.ts";

const gaps = missingContent();
const siteGaps: string[] = [];
if (!site.about) siteGaps.push("about paragraph");
if (site.employer === null) siteGaps.push("employer (null = line hidden; set a name to show it)");

const total = gaps.reduce((n, g) => n + g.fields.length, 0) + siteGaps.length;

if (total === 0) {
  console.log(`✔ all ${games.length} games and the site copy are complete`);
  process.exit(0);
}

console.error(`\n✖ ${total} unsupplied field(s):\n`);
if (siteGaps.length) {
  console.error("  site");
  for (const f of siteGaps) console.error(`    - ${f}`);
  console.error("");
}
for (const { id, fields } of gaps) {
  console.error(`  ${id.padEnd(20)} ${fields.join(", ")}`);
}
console.error(
  "\nThese are gaps, not bugs. Fill them in src/data/games.ts and src/data/site.ts\n" +
    "once Bar supplies the real content — never with placeholder prose.\n",
);

process.exit(process.env.RELEASE === "1" ? 1 : 0);
