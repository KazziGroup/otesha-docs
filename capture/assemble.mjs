/**
 * Lay the narration and a music bed onto the silent recording.
 *
 * Each line is delayed to the offset the recorder wrote down, rather than
 * concatenated end to end — the gaps between beats are part of the timing, and
 * a concatenated track would slide out of step with the picture from the first
 * pause onwards.
 *
 * **The bed ducks under the voice rather than sitting at a fixed level.** A
 * constant quiet bed is either audible under the narration or inaudible in the
 * gaps and cannot be both; `sidechaincompress` keyed on the voice pulls it down
 * while somebody is speaking and lets it back up between beats, which is what
 * makes the gaps sound deliberate instead of empty.
 *
 *   node capture/assemble.mjs [out.mp4]
 *
 * Music is optional and off unless a track is found. Tracks come from the demo
 * project's `assets/music`, which `otesha/e2e/demo/setup-music.sh` downloads;
 * they are CC BY 4.0 (Kevin MacLeod, incompetech.com), so **anything published
 * with the bed has to carry that attribution**.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const NAME = process.argv[3] ?? process.env.WALKTHROUGH ?? "phase-0";
const RAW_DIR = `/tmp/otesha-walkthrough-${NAME}`;
const SILENT = join(RAW_DIR, "silent.webm");
const OUT = process.argv[2] ?? join(homedir(), "Downloads", "otesha-e2e-videos", `otesha-docs-${NAME}.mp4`);

const MUSIC_DIR = resolve(HERE, "..", "..", "otesha", "e2e", "demo", "assets", "music");
/** Quiet enough to sit under a voice before the compressor even acts on it. */
const MUSIC_GAIN = 0.16;

for (const p of [SILENT, join(RAW_DIR, "timings.json"), resolve(HERE, "audio", NAME, "manifest.json")]) {
  if (!existsSync(p)) {
    console.error(`missing ${p} — run narration.mjs then walkthrough.mjs first`);
    process.exit(2);
  }
}

const { timings } = JSON.parse(readFileSync(join(RAW_DIR, "timings.json"), "utf8"));
const manifest = JSON.parse(readFileSync(resolve(HERE, "audio", NAME, "manifest.json"), "utf8"));
const pathById = new Map(manifest.map((l) => [l.id, l.path]));

const track = (id) => {
  const p = pathById.get(id);
  if (!p) throw new Error(`no audio for "${id}"`);
  return p;
};

const music = existsSync(MUSIC_DIR)
  ? readdirSync(MUSIC_DIR).filter((f) => /\.(mp3|m4a|wav)$/i.test(f)).sort()[0]
  : null;

const inputs = ["-i", SILENT, ...timings.flatMap((t) => ["-i", track(t.id)])];
if (music) inputs.push("-stream_loop", "-1", "-i", join(MUSIC_DIR, music));

// Input 0 is the video; 1..n are the lines; the last is the bed if present.
const voiceParts = timings.map(
  (t, i) => `[${i + 1}:a]adelay=${Math.round(t.at * 1000)}:all=1[v${i}]`,
);
const voiceMix =
  `${timings.map((_, i) => `[v${i}]`).join("")}amix=inputs=${timings.length}:normalize=0[voice]`;

const filters = [...voiceParts, voiceMix];
let outMap = "[voice]";

if (music) {
  const musicIdx = timings.length + 1;
  filters.push(
    `[${musicIdx}:a]volume=${MUSIC_GAIN},aformat=channel_layouts=mono[bed]`,
    // The voice is split: one copy is the key the compressor listens to, the
    // other is the copy you actually hear.
    `[voice]asplit=2[vkey][vout]`,
    `[bed][vkey]sidechaincompress=threshold=0.02:ratio=9:attack=8:release=420[ducked]`,
    `[vout][ducked]amix=inputs=2:normalize=0,alimiter=limit=0.95[mixed]`,
  );
  outMap = "[mixed]";
}

console.log(`  ${timings.length} lines${music ? ` · bed: ${music}` : " · no music found"}`);

execFileSync(
  "ffmpeg",
  [
    "-y", ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", "0:v", "-map", outMap,
    // H.264 + AAC + yuv420p, because a webm will not open in QuickTime or
    // preview in Slack, and this is a video whose whole job is to be watched by
    // somebody else without them installing anything.
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart",
    // The bed is looped forever; the video decides when it stops.
    "-shortest",
    OUT,
  ],
  { stdio: ["ignore", "ignore", "inherit"] },
);

console.log(`  → ${OUT}`);
