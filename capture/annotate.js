/**
 * Draw numbered callouts on a live page, anchored to real elements.
 *
 * Positions come from `getBoundingClientRect`, never from coordinates typed
 * into a static image. A hand-placed marker is correct until the layout moves,
 * and then it is confidently wrong and nobody notices — which for a manual is
 * worse than no marker, because the reader trusts it.
 *
 * The brief asks for callouts "applied outside the interface — an arrow or a
 * box in the margin, never drawn over a control". So a marker sits *beside* the
 * control with a hairline leader to it, and the ring is a thin outline that
 * frames rather than covers.
 *
 * Caller sets `window.__CALLOUTS = [{ sel, note, side }]` and evaluates this.
 * Returns `ok: n` or `MISSING: <selector>` — a selector that no longer matches
 * is a failure, not a silently unmarked screenshot.
 */
(() => {
  const spec = window.__CALLOUTS || [];
  document.querySelectorAll("[data-callout]").forEach((n) => n.remove());
  if (!spec.length) return "ok: 0 callouts";

  const ACCENT = "#0C5E1D"; // Otesha green-deep. One accent colour, per the brief.
  const missing = [];

  spec.forEach(({ sel, note, side = "right" }, i) => {
    const el = document.querySelector(sel);
    if (!el) {
      missing.push(sel);
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 5;

    const frame = document.createElement("div");
    frame.setAttribute("data-callout", "");
    Object.assign(frame.style, {
      position: "fixed",
      left: `${r.left - pad}px`,
      top: `${r.top - pad}px`,
      width: `${r.width + pad * 2}px`,
      height: `${r.height + pad * 2}px`,
      border: `2px solid ${ACCENT}`,
      borderRadius: "8px",
      // A wash of white behind the outline so it reads on any background
      // without tinting the control it frames.
      boxShadow: "0 0 0 3px rgba(255,255,255,.85)",
      zIndex: 2147483000,
      pointerEvents: "none",
    });
    document.body.appendChild(frame);

    // The badge goes in the margin, outside the frame, so nothing the reader
    // needs to see is underneath it.
    //
    // **Except on a phone, where there is no margin.** The brief asks for
    // callouts outside the interface, which assumes a 1440px console frame
    // with whitespace either side. A 390px phone has none: a badge in the
    // margin is a badge half off the image. So when it will not fit, it moves
    // to whichever side has room, and if neither does it sits just inside the
    // frame's edge — still never over the control it points at.
    const badge = document.createElement("div");
    badge.setAttribute("data-callout", "");
    badge.textContent = String(i + 1);
    const BADGE = 24;
    const room = { left: r.left - pad - 12 >= BADGE, right: window.innerWidth - (r.right + pad + 12) >= BADGE };
    let placement = side;
    if (!room[placement]) placement = room.left ? "left" : room.right ? "right" : "inside";
    const bx =
      placement === "left"
        ? r.left - pad - BADGE - 8
        : placement === "right"
          ? r.right + pad + 12
          : Math.max(4, r.right - BADGE - 6);
    Object.assign(badge.style, {
      position: "fixed",
      left: `${bx}px`,
      top: `${r.top + r.height / 2 - 12}px`,
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      background: ACCENT,
      color: "#fff",
      font: "700 13px/24px -apple-system,Helvetica,Arial,sans-serif",
      textAlign: "center",
      zIndex: 2147483001,
      pointerEvents: "none",
      boxShadow: "0 1px 3px rgba(0,0,0,.25)",
    });
    document.body.appendChild(badge);

    // Hairline leader from badge to frame, so a numbered marker in the margin
    // is unambiguous about which control it belongs to.
    const leader = document.createElement("div");
    leader.setAttribute("data-callout", "");
    // No leader when the badge sits inside the frame — it would be a line from
    // a thing to itself.
    if (placement === "inside") leader.style.display = "none";
    const lx = placement === "left" ? r.left - pad - 8 : r.right + pad;
    Object.assign(leader.style, {
      position: "fixed",
      left: `${lx}px`,
      top: `${r.top + r.height / 2 - 1}px`,
      width: "12px",
      height: "2px",
      background: ACCENT,
      zIndex: 2147483000,
      pointerEvents: "none",
    });
    document.body.appendChild(leader);
  });

  // The legend travels inside the image. A screenshot pasted into a chat or
  // printed into a PDF still explains its own numbers.
  const withNotes = spec.filter((s) => s.note);
  if (withNotes.length) {
    const key = document.createElement("div");
    key.setAttribute("data-callout", "");
    key.innerHTML = withNotes
      .map(
        (s, i) =>
          `<div style="display:flex;gap:7px;align-items:flex-start;margin:0 0 5px">
             <span style="flex:none;width:17px;height:17px;border-radius:50%;background:${ACCENT};color:#fff;font:700 10px/17px inherit;text-align:center">${i + 1}</span>
             <span>${s.note}</span>
           </div>`,
      )
      .join("");
    Object.assign(key.style, {
      position: "fixed",
      right: "14px",
      bottom: "14px",
      maxWidth: "300px",
      background: "rgba(255,255,255,.97)",
      border: "1px solid #e2e0d8",
      borderRadius: "10px",
      padding: "10px 12px",
      font: "12px/1.4 -apple-system,Helvetica,Arial,sans-serif",
      color: "#14231a",
      zIndex: 2147483002,
      boxShadow: "0 3px 14px rgba(0,0,0,.12)",
    });
    document.body.appendChild(key);
  }

  return missing.length ? `MISSING: ${missing.join(", ")}` : `ok: ${spec.length} callouts`;
})();
