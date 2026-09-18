/**
 * The vocabulary a shot list may use.
 *
 * Shared so the runner and the checker cannot drift. When they were two
 * separate lists, a typo'd verb passed the check and then failed halfway
 * through a capture session — which is the expensive place to find out.
 */

export const WEB_STEPS = ["goto", "wait", "fill", "click", "press", "pause", "park", "hide", "hideText", "eval"];
export const IOS_STEPS = ["tap", "tapIfPresent", "waitFor", "scroll", "pause"];

/** A callout must say which element it points at, and what it means. */
export function calloutProblems(callout) {
  const problems = [];
  if (!callout.sel && !callout.text && !callout.match) {
    problems.push("has no `sel`, `text` or `match` to locate it by");
  }
  if (!callout.note || !callout.note.trim()) {
    problems.push("has no `note` — the legend and the alt text both come from it");
  }
  return problems;
}
