/**
 * Audition narration voices, back to back, in one file.
 *
 * Kokoro takes a voice and a speed and nothing else — there is no delivery
 * brief, no instruction that turns a brisk read warm. The voice *is* the
 * performance, so choosing one is a listening job, and reading a table of
 * names tells you nothing.
 *
 * This speaks the same real sentence in each candidate, announcing itself
 * first, so the choice is made by ear in one pass instead of by rendering the
 * whole script over and over.
 *
 *   node capture/audition.mjs [out.mp3] [voice ...]
 *
 * Then set the winner: `OTESHA_DOCS_VOICE=<id> node capture/narration.mjs`.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const KOKORO = join(homedir(), ".kokoro");
const PYTHON = join(KOKORO, "venv", "bin", "python");
const WORK = join(tmpdir(), "otesha-audition");

/**
 * The shortlist.
 *
 * Kokoro's own quality grades are uneven and the top of the range is narrow, so
 * these are the ones worth hearing rather than all 54. Both English accents are
 * here on purpose: these manuals are read in Tanzania, largely by people
 * reading English as a second language, where an unhurried, clearly articulated
 * read matters more than a warm one.
 */
const DEFAULT_VOICES = [
  "af_heart",   // the highest-graded voice in the pack; warm, unhurried
  "af_bella",   // fuller and more expressive than heart
  "af_sarah",   // plainer, closer to a newsreader
  "bf_emma",    // British, measured — the most "instructional" of the set
  "am_michael", // American male, neutral; the admin walkthrough's default
  "am_fenrir",  // American male, warmer and slower than michael
  "bm_george",  // British male, dry
];

/** A real line from the walkthrough, not a pangram — it has to survive proper nouns. */
const SAMPLE =
  "One repository holds all four: the customer app, the admin console, " +
  "the corporate portal, and the caretaker's phone. Every manual is a folder " +
  "of markdown, and the screenshots are generated, not taken by hand.";

const out = process.argv[2] ?? join(homedir(), "Downloads", "otesha-e2e-videos", "voice-audition.mp3");
const voices = process.argv.slice(3).length ? process.argv.slice(3) : DEFAULT_VOICES;

mkdirSync(WORK, { recursive: true });
mkdirSync(join(out, ".."), { recursive: true });

/**
 * Each candidate says its own name before the sample.
 *
 * Spoken rather than written down beside the file, because by the fourth voice
 * nobody remembers which order they were in — and the name has to be said in
 * the voice being judged, or you cannot tell them apart at all.
 */
const work = voices.flatMap((voice, i) => [
  { path: join(WORK, `${i}a.wav`), voice, text: `Voice ${i + 1}. ${voice.replace(/^[a-z]{2}_/, "")}.`, speed: 1.0 },
  { path: join(WORK, `${i}b.wav`), voice, text: SAMPLE, speed: 0.95 },
]);

const script = `
import json, sys
import soundfile as sf
from kokoro_onnx import Kokoro

kokoro = Kokoro(${JSON.stringify(join(KOKORO, "kokoro-v1.0.onnx"))}, ${JSON.stringify(join(KOKORO, "voices-v1.0.bin"))})
for item in json.loads(sys.stdin.read()):
    samples, rate = kokoro.create(item["text"], voice=item["voice"], speed=item["speed"], lang="en-us")
    sf.write(item["path"], samples, rate)
    print(item["voice"], flush=True)
`;

const scriptPath = join(WORK, "render.py");
writeFileSync(scriptPath, script);
console.log(`  auditioning ${voices.length} voices`);
execFileSync(PYTHON, [scriptPath], { input: JSON.stringify(work), stdio: ["pipe", "ignore", "inherit"] });

// A beat of silence between candidates, so they do not blur into each other.
const GAP = join(WORK, "gap.wav");
execFileSync("ffmpeg", ["-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", "0.7", GAP], {
  stdio: "ignore",
});

const list = join(WORK, "list.txt");
writeFileSync(
  list,
  voices.flatMap((_, i) => [join(WORK, `${i}a.wav`), GAP, join(WORK, `${i}b.wav`), GAP])
    .map((p) => `file '${p}'`)
    .join("\n") + "\n",
);

execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c:a", "libmp3lame", "-b:a", "128k", out], {
  stdio: "ignore",
});

console.log(`  → ${out}`);
voices.forEach((v, i) => console.log(`     ${i + 1}. ${v}`));
