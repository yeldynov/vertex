// Module/lesson labels come from array order (0-based indexes in, 1-based labels out).
export const moduleLabel = (moduleIndex: number) => `Module ${moduleIndex + 1}`;

export const lessonLabel = (moduleIndex: number, lessonIndex: number) =>
  `Lesson ${moduleIndex + 1}.${lessonIndex + 1}`;

/** 66240 → "18h 24m", 754 → "12m 34s", 42 → "42s". */
export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h) return `${h}h ${m}m`;
  if (m) return s ? `${m}m ${s}s` : `${m}m`;
  return `${s}s`;
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** 18240 → "18.2k", 950 → "950". */
export const formatCount = (n: number) => compact.format(n).toLowerCase();

const tones = ["oxblood", "teal", "mustard", "violet", "olive", "rust"] as const;
export type Tone = (typeof tones)[number];

/** A course's sleeve colour, stable on every page because it hashes the slug.
 *  ponytail: two courses can share a tone; add a schema colour field if that matters. */
export function courseTone(slug: string | null | undefined): Tone {
  // Seed and bit-mix picked so the current catalog spreads at most two courses per tone.
  let h = 6;
  for (const ch of slug ?? "") h = (h * 31 + ch.charCodeAt(0)) | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return tones[(h >>> 0) % tones.length];
}
