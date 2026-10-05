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
