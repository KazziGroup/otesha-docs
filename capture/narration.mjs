/**
 * Render the walkthrough's narration to audio, one file per line.
 *
 * Same approach as `otesha/e2e/demo/voice.ts` and the same local Kokoro model,
 * so this machine bills nothing and works offline. It is a separate file rather
 * than an import because that one is wired to the demo's scene list.
 *
 * **One file per line, not one long take.** The recorder has to hold each beat
 * for exactly as long as its sentence lasts, and a single track gives no seams
 * to measure. It also means editing one line re-renders one file.
 *
 * Cached on a hash of the voice, speed and text, so an unchanged line is not
 * re-rendered. Prints a manifest of `{ id, text, path, seconds }`.
 *
 *   node capture/narration.mjs [out.json]
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
/**
 * Which walkthrough to render, and where its audio lives.
 *
 * One directory per walkthrough. They shared one before, which meant recording
 * module 1 silently overwrote phase 0's narration — and the video with it,
 * since both wrote to the same file. A phase you cannot show again is a phase
 * nobody can review.
 */
const NAME = process.argv[2] ?? "phase-0";
const AUDIO_DIR = resolve(HERE, "audio", NAME);
const KOKORO = join(homedir(), ".kokoro");
const PYTHON = join(KOKORO, "venv", "bin", "python");

/**
 * `af_heart` — the highest-graded voice in the pack, and a plain one.
 *
 * Not `af_nicole`, which the customer walkthrough uses and which is Kokoro's
 * breathy, near-ASMR voice: fine over a product tour, actively distracting over
 * instructions somebody is trying to follow.
 *
 * Kokoro takes a voice and a speed and nothing else — there is no delivery
 * brief, so the voice is the whole of the read. Audition alternatives with
 * `node capture/audition.mjs` rather than guessing from the names; `bf_emma` is
 * the measured British option and `am_fenrir` the warmest male one.
 *
 * Slightly under normal speed because every line lands over something changing
 * on screen and the eye needs to arrive first.
 */
const VOICE = process.env.OTESHA_DOCS_VOICE ?? "af_heart";
const SPEED = Number(process.env.OTESHA_DOCS_SPEED ?? 0.95);

const walkthrough = await import(`./walkthroughs/${NAME}.mjs`);
export const LINES = walkthrough.lines;

const audioPath = (id) => join(AUDIO_DIR, `${id}.wav`);
const keyPath = (id) => join(AUDIO_DIR, `${id}.key`);
const keyFor = (text) => createHash("sha256").update(`kokoro ${VOICE} ${SPEED} ${text}`).digest("hex");

mkdirSync(AUDIO_DIR, { recursive: true });

if (!existsSync(PYTHON)) {
  console.error(
    `No Kokoro environment at ${PYTHON}.\n` +
      `  python3.12 -m venv ~/.kokoro/venv && ~/.kokoro/venv/bin/pip install kokoro-onnx soundfile\n` +
      `  The model itself (kokoro-v1.0.onnx, voices-v1.0.bin) belongs in ~/.kokoro.`,
  );
  process.exit(2);
}

const { readFileSync } = await import("node:fs");
const pending = LINES.filter(([id, text]) => {
  const key = keyFor(text);
  if (!existsSync(audioPath(id)) || !existsSync(keyPath(id))) return true;
  return readFileSync(keyPath(id), "utf8").trim() !== key;
}).map(([id, text]) => ({ id, text, path: audioPath(id) }));

if (pending.length) {
  console.log(`  rendering ${pending.length}/${LINES.length} lines · ${VOICE} · ${SPEED}×`);
  // Generated rather than committed, because the only thing that varies is a
  // list of strings and a checked-in script plus an argv convention is two
  // things to keep in step instead of one.
  const script = `
import json, sys
import soundfile as sf
from kokoro_onnx import Kokoro

kokoro = Kokoro(${JSON.stringify(join(KOKORO, "kokoro-v1.0.onnx"))}, ${JSON.stringify(join(KOKORO, "voices-v1.0.bin"))})
for item in json.loads(sys.stdin.read()):
    samples, rate = kokoro.create(item["text"], voice=${JSON.stringify(VOICE)}, speed=${SPEED}, lang="en-us")
    sf.write(item["path"], samples, rate)
    print(item["id"], flush=True)
`;
  const scriptPath = join(AUDIO_DIR, ".render.py");
  writeFileSync(scriptPath, script);
  execFileSync(PYTHON, [scriptPath], { input: JSON.stringify(pending), stdio: ["pipe", "inherit", "inherit"] });
  for (const { id, text } of pending) writeFileSync(keyPath(id), keyFor(text));
} else {
  console.log(`  all ${LINES.length} lines cached`);
}

/** ffprobe rather than arithmetic on the sample count — one source of truth. */
const seconds = (p) =>
  Number(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", p,
    ], { encoding: "utf8" }).trim(),
  );

const manifest = LINES.map(([id, text]) => ({
  id,
  text,
  path: audioPath(id),
  seconds: seconds(audioPath(id)),
}));

// Always beside its audio. This used to be overridable on argv, which became a
// collision the moment argv[2] started naming the walkthrough — the manifest
// was written to a file called "module-1" and the recorder could not find it.
const out = join(AUDIO_DIR, "manifest.json");
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `  ${manifest.length} lines · ${manifest.reduce((a, l) => a + l.seconds, 0).toFixed(1)}s of speech → ${out}`,
);
