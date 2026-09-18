/**
 * Build the annotation canvas for a phone capture.
 *
 * Pass two of two. Takes the clean 390-wide frame from pass one plus the
 * measured target rects, and writes an HTML page that lays the frame on a
 * wider paper canvas with the numbered markers in the space either side. That
 * page is then screenshotted, and the result is the figure that ships.
 *
 * Doing it as HTML rather than with an image library is deliberate: the
 * markers are the same handful of divs the console captures already use, so
 * phone and desktop figures come out of one visual vocabulary instead of two
 * that drift. It also means no native image dependency to install.
 *
 *   node compose.mjs <clean.png> <targets.json> <out.html> [title]
 *
 * The caller screenshots the emitted page at CANVAS x frame height.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const [, , cleanPath, targetsPath, outPath, title = ""] = process.argv;

if (!cleanPath || !targetsPath || !outPath) {
  console.error("usage: compose.mjs <clean.png> <targets.json> <out.html> [title]");
  process.exit(2);
}

const measured = JSON.parse(readFileSync(targetsPath, "utf8"));
if (!measured.ok) {
  // A missing selector means the page moved under the shot list. Failing here
  // is the point: the alternative is a figure that quietly stopped pointing at
  // anything, which a reader trusts exactly as much as a correct one.
  console.error(`MISSING: ${(measured.missing || []).join(", ")}`);
  process.exit(1);
}

const ACCENT = "#0C5E1D"; // Otesha green-deep. One accent colour, per the brief.
const PAPER = "#F6F3EB";

/**
 * The region of the frame that survives into the figure.
 *
 * Defaults to the whole thing; `measured.crop` narrows it. Rects are measured
 * against the full frame, so the crop is subtracted once here and the markers
 * need no further awareness of it.
 */
const CROP = {
  x: 0,
  y: 0,
  w: measured.viewport.w,
  h: measured.viewport.h,
  ...(measured.crop ?? {}),
};

const FRAME_W = CROP.w; // 390 for the phone, a cropped region for a console
const GUTTER = 96; // room for a 24px badge, its leader, and breathing space
const CANVAS_W = FRAME_W + GUTTER * 2;

/** The clean frame is inlined so the page has no external asset to resolve. */
const png = readFileSync(resolve(cleanPath)).toString("base64");

const BADGE = 24;

/**
 * Which gutter each badge sits in.
 *
 * Decided here from where the box actually is, rather than taken from the shot
 * list. Hand-set sides were wrong often enough to be a bug of their own: on the
 * caretaker review queue a box around the *Approve* button of the first card
 * had its badge in the right-hand gutter, where the leader came to rest beside
 * the *Reject* button of the second card. Nothing in the image said otherwise,
 * so the figure read as "Reject records you as the approver" — the precise
 * opposite of the note.
 *
 * Nearest gutter wins, so the leader emerges on the same side as the thing it
 * belongs to and has the shortest possible distance to be misread over. Two
 * badges at the same height on the same side would overlap, so the later one is
 * sent across — which is what the two sides were for in the first place.
 */
function assignSides(targets) {
  const frameMid = CROP.x + CROP.w / 2;
  const placed = [];
  for (const t of targets) {
    const mid = t.y - CROP.y + t.h / 2;
    let side = t.x + t.w / 2 < frameMid ? "left" : "right";
    if (placed.some((p) => p.side === side && Math.abs(p.mid - mid) < BADGE + 8)) {
      side = side === "left" ? "right" : "left";
    }
    placed.push({ ...t, side, mid });
  }
  return placed;
}

/**
 * The badge goes in the gutter, not beside the control.
 *
 * Beside works for a control at the edge of the frame and fails for one in the
 * middle, where "just to the left" is another button — on the corporate reports
 * page a marker landed squarely on the neighbouring tab, which is the one thing
 * the brief rules out. Putting every badge in the added margin and running a
 * leader out to it means the rule holds wherever the control happens to sit,
 * and the numbers line up in a column instead of scattering.
 */
const marker = (t) => {
  const pad = 3;
  const left = GUTTER + t.x - CROP.x - pad;
  const top = t.y - CROP.y - pad;
  const w = t.w + pad * 2;
  const h = t.h + pad * 2;
  const mid = t.y - CROP.y + t.h / 2;
  const onLeft = t.side === "left";

  // The badge sits against its own box, on a stub.
  //
  // Two arrangements were tried before this one and both misinform. Parking
  // every badge in the gutter with the leader stopping at the frame edge means
  // the number comes to rest beside whatever occupies that row at the edge: on
  // the review queue, a box around the first card's *Approve* put its badge
  // next to the second card's *Reject*, so the figure read as the opposite of
  // its note. Running the leader the whole way to the box fixes which box is
  // meant and draws a horizontal rule through everything in between — across
  // the cluster board it struck through a caretaker's name, and across the rota
  // it struck through a column heading and a date.
  //
  // Anchoring the badge to the box removes the span that caused both. There is
  // no distance to misread and nothing to cross. The badges no longer line up
  // in a column, which is a real loss in tidiness and a small price for a
  // figure that cannot point at the wrong thing.
  const STUB = 10;
  const boxLeft = left;
  const boxRight = left + w;

  let badgeX = onLeft ? boxLeft - STUB - BADGE : boxRight + STUB;
  // Never off the canvas: a target hard against the frame edge would otherwise
  // put its number outside the image.
  badgeX = Math.max(4, Math.min(badgeX, CANVAS_W - BADGE - 4));

  const leadFrom = onLeft ? badgeX + BADGE : boxRight;
  const leadTo = onLeft ? boxLeft : badgeX;

  return `
    <div class="frame" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px"></div>
    <div class="lead"  style="left:${leadFrom}px;top:${mid - 1}px;width:${Math.max(0, leadTo - leadFrom)}px"></div>
    <div class="badge" style="left:${badgeX}px;top:${mid - 12}px">${t.n}</div>`;
};

const MARKERS = assignSides(measured.targets);

const legend = measured.targets
  .filter((t) => t.note)
  .map((t) => `<li><span class="b">${t.n}</span><span>${t.note}</span></li>`)
  .join("");

const html = `<!doctype html>
<meta charset="utf-8">
<title>${title || basename(cleanPath)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:${CANVAS_W}px;background:${PAPER};
       font:13px/1.45 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#14231A}
  .stage{position:relative;width:${CANVAS_W}px}
  /* The frame sits flush at the gutter offset, so measured rects need only
     one translation to land on their controls. The window clips the frame to
     the crop; the image inside it is shifted up rather than resized, so the
     screenshot's own pixels are never rescaled. */
  .window{position:absolute;left:${GUTTER}px;top:0;width:${FRAME_W}px;height:${CROP.h}px;
          overflow:hidden;border-radius:10px;box-shadow:0 1px 10px rgba(20,35,26,.13)}
  .shot{position:absolute;left:${-CROP.x}px;top:${-CROP.y}px;width:${measured.viewport.w}px;display:block}
  .frame{position:absolute;border:2px solid ${ACCENT};border-radius:8px;
         box-shadow:0 0 0 2px rgba(255,255,255,.85)}
  /* The halo is what lets the leader cross the screenshot without reading as
     a strikethrough through whatever it passes over. */
  .lead{position:absolute;height:2px;background:${ACCENT};
        box-shadow:0 0 0 2px rgba(255,255,255,.85)}
  .badge{position:absolute;width:24px;height:24px;border-radius:50%;
         background:${ACCENT};color:#fff;font-weight:700;font-size:13px;
         line-height:24px;text-align:center;
         box-shadow:0 0 0 2px rgba(255,255,255,.9),0 1px 3px rgba(0,0,0,.25)}
  /* The legend travels inside the image, so a figure pasted into a chat or
     printed to PDF still explains its own numbers. */
  .key{position:absolute;left:14px;width:${CANVAS_W - 28}px;
       background:#fff;border:1px solid #E2E0D8;border-radius:10px;padding:10px 12px}
  .key li{display:flex;gap:8px;align-items:flex-start;list-style:none;margin-bottom:5px}
  .key li:last-child{margin-bottom:0}
  .b{flex:none;width:17px;height:17px;border-radius:50%;background:${ACCENT};
     color:#fff;font:700 10px/17px inherit;text-align:center}
</style>
<div class="stage" id="stage">
  <div class="window"><img class="shot" src="data:image/png;base64,${png}" alt=""></div>
  ${MARKERS.map(marker).join("")}
  ${legend ? `<ul class="key" id="key">${legend}</ul>` : ""}
</div>
<script>
  // The canvas is as tall as the cropped frame, plus the legend if there is
  // one. The legend's height depends on how its text wraps, which is known
  // only after layout — hence setting this here rather than in the stylesheet.
  // The title carries the finished size back out, so the caller knows what
  // viewport to screenshot at instead of guessing and padding.
  const img = document.querySelector(".shot");
  const done = () => {
    const key = document.getElementById("key");
    let h = ${CROP.h};
    if (key) { key.style.top = (h + 14) + "px"; h += key.offsetHeight + 28; }
    document.getElementById("stage").style.height = h + "px";
    document.body.style.height = h + "px";
    document.title = "ready:" + ${CANVAS_W} + "x" + Math.ceil(h);
  };
  img.complete ? done() : img.addEventListener("load", done);
</script>`;

writeFileSync(outPath, html);

/**
 * The same notes, as words.
 *
 * The legend is drawn into the PNG, which makes a screenshot self-explaining
 * when it travels on its own — and completely invisible to everything that
 * reads text. Search cannot match it, a screen reader cannot announce it, and
 * the AI assistant is never given the image at all, only the alt text and
 * caption. So the most instructive sentences on the figure would be the ones
 * nothing but an eye can reach.
 *
 * Writing them beside the image keeps one source — the shot list — behind both
 * outputs, so the drawn legend and the alt text cannot drift into disagreeing
 * about what the numbers mean. `scripts/check-alt-text.mjs` enforces that the
 * markdown actually carries them.
 */
/**
 * Which build this figure is of.
 *
 * Not bookkeeping. A screenshot is only true relative to a commit, and during
 * this trial a figure was captured from a dev server left running on an
 * unmerged feature branch — producing a perfectly sharp, perfectly annotated
 * picture of a sign-in screen that does not exist in the product, which was
 * then written up as fact. Nothing about the image showed it.
 *
 * So the capture records what it shot. The real pipeline should go further and
 * start its own server from a named commit rather than attaching to whatever
 * happens to be answering on a port.
 */
const provenance = measured.provenance ?? {};
if (provenance.url || provenance.commit) {
  writeFileSync(
    outPath.replace(/\.html$/, ".provenance.json"),
    JSON.stringify(provenance, null, 2) + "\n",
  );
}

const notes = measured.targets.filter((t) => t.note);
if (notes.length) {
  const sentences = notes
    .map((t) => (/[.!?]$/.test(t.note) ? t.note : `${t.note}.`))
    .join(" ");
  writeFileSync(outPath.replace(/\.html$/, ".alt.txt"), `Marked on the screenshot: ${sentences}\n`);
}

console.log(`${CANVAS_W} ${outPath}`);
