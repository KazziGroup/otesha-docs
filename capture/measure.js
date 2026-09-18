/**
 * Record where the callout targets are, without drawing anything.
 *
 * The first half of a two-pass capture. Pass one measures and shoots a clean
 * frame; pass two draws the markers onto a wider canvas. They are separate
 * because of a constraint the phone imposes and the consoles do not:
 *
 * The brief wants callouts "applied outside the interface — an arrow or a box
 * in the margin, never drawn over a control". A 1440x900 console frame has
 * margin to spare. A 390x844 phone has none, so a badge outside the control is
 * a badge off the edge of the image, and the only place left is on top of the
 * button — which is the one thing the brief rules out.
 *
 * Capturing at a wider viewport to manufacture the margin does not work: the
 * customer app lays out its species grid one card per row at 390 and two at
 * 640, so a wider shot documents a screen the phone reader never sees. The
 * frame has to stay 390 and the margin has to be added afterwards.
 *
 * Caller sets `window.__CALLOUTS = [{ sel, note, side }]` and evaluates this.
 * Returns JSON: `{ ok: true, viewport, targets: [...] }`, or `{ ok: false,
 * missing: [...] }` — a selector that no longer matches is a failure, not a
 * silently unmarked screenshot.
 */
(() => {
  const spec = window.__CALLOUTS || [];
  const missing = [];
  const targets = [];

  /**
   * Find one element, by CSS selector or by the words on it.
   *
   * `text` exists because the alternative for a button in a row of buttons is
   * `button:nth-of-type(5)`, which is correct until somebody adds a button and
   * then silently points at the wrong control — the exact failure the anchoring
   * is meant to prevent. The smallest match wins, since a label usually appears
   * on both the control and the card around it.
   */
  function find({ sel, text, nth }) {
    if (sel) return document.querySelector(sel);
    if (!text) return null;
    const wanted = text.toLowerCase();

    // Anything that can carry words a reader would recognise. The narrow list
    // this replaced — buttons, links and table cells — missed labels, help
    // text and paragraphs, which is where most of what a manual points at
    // actually lives.
    //
    // Placeholders are matched too, because "Search name or phone…" is visible
    // on screen and absent from `textContent`; a shot list naming what it can
    // see should not have to know that.
    const candidates = [
      ...document.querySelectorAll(
        "button, a, input, select, textarea, label, p, li, span, div, td, th, h1, h2, h3, [role=tab]",
      ),
    ].filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;
      // Case-insensitive, because `text-transform: uppercase` is common and
      // what a shot list names is what somebody read off the screen. A column
      // header showing SURVEYED holds the text "Surveyed", and a recipe that
      // has to know that is a recipe written from the DOM rather than from the
      // page.
      return (
        (el.textContent || "").toLowerCase().includes(wanted) ||
        (el.getAttribute && (el.getAttribute("placeholder") || "").toLowerCase().includes(wanted))
      );
    });

    // `nth` picks by position among the matches, in document order, for a
    // control that legitimately repeats — a row of Approve buttons, one per
    // caretaker. Without it the smallest match wins, which for repeated
    // controls is whichever happens to be a pixel narrower.
    //
    // It counts innermost matches only. Every wrapper up to the page container
    // also "contains" the word, and they come first in document order, so
    // `nth: 0` over the raw list framed a box the height of the screen.
    if (Number.isInteger(nth)) {
      const innermost = candidates.filter(
        (el) => ![...el.children].some((child) => (child.textContent || "").toLowerCase().includes(wanted)),
      );
      return innermost[nth] ?? null;
    }

    // Smallest wins: the words appear on the control and on every box around
    // it, and the control is what is being pointed at.
    return candidates.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return ra.width * ra.height - rb.width * rb.height;
    })[0] ?? null;
  }

  spec.forEach((item, i) => {
    const { sel, text, note, side = "right" } = item;
    const el = find(item);
    if (!el) {
      missing.push(sel || `text:${text}`);
      return;
    }
    const r = el.getBoundingClientRect();
    targets.push({
      n: i + 1,
      note: note || "",
      side,
      // Rounded to whole pixels. These become CSS offsets in the composite, and
      // a fractional left on a 2px outline renders as a 3px blur.
      x: Math.round(r.left),
      y: Math.round(r.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
    });
  });

  if (missing.length) return JSON.stringify({ ok: false, missing });

  /**
   * How much of the frame is worth keeping.
   *
   * The apps centre their content, so a phone screen is often a card in the
   * middle with a third of the height empty above and below. Shipping that
   * whole frame is not neutral: the figure is height-capped in the page, so
   * every empty pixel shrinks the interface text the reader is trying to read.
   * On the sign-in screen the dead space alone takes the button caption down to
   * about seven pixels.
   *
   * So the crop is taken around the callout targets with enough padding either
   * side to keep the screen recognisable — the reader still has to match this
   * against the phone in their hand. `window.__CROP` overrides it: pass a
   * selector to crop to some element, or `false` for the untouched frame.
   */
  const PAD_ABOVE = 170;
  const PAD_BELOW = 150;
  let crop = null;

  if (window.__CROP === false || !targets.length) {
    crop = { y: 0, h: window.innerHeight };
  } else if (typeof window.__CROP === "string") {
    const el = document.querySelector(window.__CROP);
    if (!el) return JSON.stringify({ ok: false, missing: [window.__CROP] });
    const r = el.getBoundingClientRect();
    crop = { y: Math.round(r.top) - 24, h: Math.round(r.height) + 48 };
  } else {
    const top = Math.min(...targets.map((t) => t.y));
    const bottom = Math.max(...targets.map((t) => t.y + t.h));
    crop = { y: Math.round(top) - PAD_ABOVE, h: Math.round(bottom - top) + PAD_ABOVE + PAD_BELOW };
  }

  /**
   * Consoles need cropping sideways as well.
   *
   * A phone frame is 390 wide and the whole width is the subject. A 1440px
   * console is mostly navigation chrome and empty table, and shipping all of it
   * means the figure lands in a 664px column at under half size, where the
   * labels a reader is trying to match against their own screen are four pixels
   * tall. Set `window.__CROP_X = true` to keep only the region the callouts are
   * in, with enough either side to stay recognisable.
   */
  if (window.__CROP_X && targets.length) {
    const PAD_SIDE = 90;
    const left = Math.min(...targets.map((t) => t.x));
    const right = Math.max(...targets.map((t) => t.x + t.w));
    crop.x = Math.max(0, Math.round(left) - PAD_SIDE);
    crop.w = Math.min(window.innerWidth - crop.x, Math.round(right - left) + PAD_SIDE * 2);
  }

  // Clamped, so a target near an edge cannot ask for pixels outside the frame
  // and leave a strip of blank canvas where the screenshot should be.
  crop.y = Math.max(0, Math.min(crop.y, window.innerHeight - 1));
  crop.h = Math.min(crop.h, window.innerHeight - crop.y);

  /**
   * Move a crop edge so it does not pass through anything.
   *
   * A cut at an arbitrary offset lands halfway through whatever happens to be
   * there — on the sign-in screen, the Otesha logo, leaving a green sliver at
   * the top edge that a reader reads as a broken image rather than as a
   * deliberate crop. Widening the padding only relocates the problem to a
   * different screen.
   *
   * So the edge is pushed outward to clear any box it intersects. Only things
   * that would visibly bleed are considered: elements small enough to be
   * content rather than layout, since the page wrappers straddle every offset
   * and would drag the crop back to the full frame every time.
   */
  const candidates = [...document.querySelectorAll("body *")].filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.height <= 0 || r.width <= 0) return false;
    if (r.height > window.innerHeight * 0.5) return false;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.opacity === "0") return false;
    const paints =
      el.tagName === "IMG" ||
      el.tagName === "SVG" ||
      s.backgroundImage !== "none" ||
      !/^rgba\(0, 0, 0, 0\)$|^transparent$/.test(s.backgroundColor) ||
      parseFloat(s.borderTopWidth) > 0 ||
      // A text node of its own, rather than text inherited from a child.
      [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    return paints;
  });

  /**
   * `axis` is "y" or "x"; `direction` is -1 for the near edge, +1 for the far.
   *
   * The move is capped. Without a limit one wide element — a banner, a table
   * header spanning the page — drags the edge to the frame boundary and the
   * crop silently becomes no crop at all, which is how a console shot ends up
   * 900px tall and unreadable at the size it renders. Past the cap it is better
   * to accept a clean straight cut than to give up cropping entirely.
   */
  const LIMIT = 110;
  const clear = (edge, direction, axis) => {
    const near = axis === "y" ? "top" : "left";
    const far = axis === "y" ? "bottom" : "right";
    const original = edge;
    // Two passes: clearing one box can bring the edge into another.
    for (let pass = 0; pass < 2; pass++) {
      for (const el of candidates) {
        const r = el.getBoundingClientRect();
        if (r[near] < edge && r[far] > edge) {
          const moved = direction < 0 ? Math.floor(r[near]) - 8 : Math.ceil(r[far]) + 8;
          if (Math.abs(moved - original) <= LIMIT) edge = moved;
        }
      }
    }
    return edge;
  };

  if (window.__CROP !== false) {
    const top = Math.max(0, clear(crop.y, -1, "y"));
    const bottom = Math.min(window.innerHeight, clear(crop.y + crop.h, 1, "y"));
    crop.y = top;
    crop.h = bottom - top;

    if (crop.x !== undefined) {
      // Same treatment sideways, so a console crop does not cut through the
      // middle of a column heading.
      const left = Math.max(0, clear(crop.x, -1, "x"));
      const right = Math.min(window.innerWidth, clear(crop.x + crop.w, 1, "x"));
      crop.x = left;
      crop.w = right - left;
    }
  }

  return JSON.stringify({
    ok: true,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    // What was on screen, so the figure can say which build it is of. The
    // caller fills in the commit; the page only knows its own address.
    provenance: { url: location.href, capturedFrom: location.origin },
    crop,
    targets,
  });
})();
