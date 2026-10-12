// Pure helpers for video ingestion. No network, no Sanity — covered by parse.test.ts.

export type Cue = {start: number; text: string}
export type Chapter = {startSeconds: number; label: string}
export type Chunk = {startSeconds: number; text: string}
export type Provider =
  | {kind: 'youtube'; id: string}
  | {kind: 'vimeo'; id: string}
  | {kind: 'bunny'; library: string; id: string}

const SAFE_ID = /^[\w-]+$/

/** URL → Sanity doc id. Dots go too: a dot would make the id path-scoped. */
export function videoDocId(url: string) {
  return `video-${url.replace(/[^A-Za-z0-9_-]/g, '')}`.slice(0, 128)
}

/** Same URL shapes the web embed accepts (lib/video.ts); null when unsupported. */
export function parseProvider(videoUrl: string): Provider | null {
  let url: URL
  try {
    url = new URL(videoUrl)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m)\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    const id =
      host === 'youtu.be'
        ? parts[0]
        : (url.searchParams.get('v') ?? (['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : null))
    return id && /^[\w-]{11}$/.test(id) ? {kind: 'youtube', id} : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parts.find((p) => /^\d+$/.test(p))
    return id ? {kind: 'vimeo', id} : null
  }
  if (host === 'iframe.mediadelivery.net' && ['embed', 'play'].includes(parts[0])) {
    const [, library, id] = parts
    return library && id && SAFE_ID.test(library) && SAFE_ID.test(id) ? {kind: 'bunny', library, id} : null
  }
  return null
}

const TIMESTAMP = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/

/** YouTube description chapters, kept only when YouTube itself would show them. */
export function parseDescriptionChapters(description: string): Chapter[] {
  const chapters: Chapter[] = []
  for (const line of description.split('\n')) {
    const m = line.match(TIMESTAMP)
    if (!m) continue
    const startSeconds = Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3])
    const label = line
      .replace(m[0], '')
      .replace(/^[\s\-–—:|()[\]]+|[\s\-–—:|()[\]]+$/g, '')
      .trim()
    if (label) chapters.push({startSeconds, label})
  }
  const valid =
    chapters.length >= 3 &&
    chapters[0].startSeconds === 0 &&
    chapters.every((c, i) => i === 0 || c.startSeconds > chapters[i - 1].startSeconds)
  return valid ? chapters : []
}

function clean(text: string) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** YouTube timedtext `fmt=json3` → cues. */
export function parseJson3(json: {events?: {tStartMs?: number; segs?: {utf8?: string}[]}[]}): Cue[] {
  return (json.events ?? [])
    .filter((e) => e.segs && e.tStartMs != null)
    .map((e) => ({start: e.tStartMs! / 1000, text: clean(e.segs!.map((s) => s.utf8 ?? '').join(''))}))
    .filter((c) => c.text)
}

function vttSeconds(stamp: string) {
  const [s, m = '0', h = '0'] = stamp.replace(',', '.').split(':').reverse()
  return Number(h) * 3600 + Number(m) * 60 + Number(s)
}

/** WebVTT (Vimeo, Bunny) → cues. Inline tags are stripped. */
export function parseVtt(vtt: string): Cue[] {
  const cues: Cue[] = []
  for (const block of vtt.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n')
    const i = lines.findIndex((l) => l.includes('-->'))
    if (i < 0) continue
    const start = vttSeconds(lines[i].split('-->')[0].trim())
    const text = clean(lines.slice(i + 1).join(' '))
    if (text && Number.isFinite(start)) cues.push({start, text})
  }
  return cues
}

/** Cues → ~`seconds`-long chunks starting on cue boundaries, with whole, strictly increasing starts. */
export function toChunks(cues: Cue[], seconds = 30): Chunk[] {
  const chunks: Chunk[] = []
  let current: {start: number; parts: string[]} | null = null
  for (const cue of [...cues].sort((a, b) => a.start - b.start)) {
    // Sorted cues + a 30s gap from a floored start keep the next floored start strictly greater.
    if (!current || cue.start - current.start >= seconds) {
      if (current) chunks.push({startSeconds: current.start, text: current.parts.join(' ')})
      current = {start: Math.floor(cue.start), parts: []}
    }
    if (current.parts.at(-1) !== cue.text) current.parts.push(cue.text)
  }
  if (current) chunks.push({startSeconds: current.start, text: current.parts.join(' ')})
  return chunks.filter((c) => c.text)
}
