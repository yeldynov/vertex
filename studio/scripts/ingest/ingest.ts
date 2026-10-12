// Offline: builds one `video` doc (chapters + ~30s transcript chunks) per unique lesson videoUrl.
// npm run ingest [-- --force] [-- --only <url>]   (writes with your `sanity login` token)
import {getCliClient} from 'sanity/cli'
import {
  type Chapter,
  type Cue,
  type Provider,
  parseDescriptionChapters,
  parseJson3,
  parseProvider,
  parseVtt,
  toChunks,
  videoDocId,
} from './parse.ts'

const client = getCliClient({apiVersion: '2026-03-03'})
const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null

type Moments = {chapters: Chapter[]; cues: Cue[]}

async function getJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${res.status} ${url.split('?')[0]}`)
  return res.json()
}

async function getText(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${res.status} ${url.split('?')[0]}`)
  return res.text()
}

// The IOS innertube client still returns caption tracks without a PO token; WEB returns UNPLAYABLE.
const YT_UA = 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)'

async function youtube(id: string): Promise<Moments> {
  const player = await getJson('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: {'content-type': 'application/json', 'user-agent': YT_UA},
    body: JSON.stringify({
      context: {client: {clientName: 'IOS', clientVersion: '20.10.4', deviceModel: 'iPhone16,2', hl: 'en'}},
      videoId: id,
    }),
  })
  if (player.playabilityStatus?.status !== 'OK') throw new Error(`youtube: ${player.playabilityStatus?.status}`)
  const chapters = parseDescriptionChapters(player.videoDetails?.shortDescription ?? '')
  const tracks: {baseUrl: string; languageCode: string; kind?: string}[] =
    player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  const track =
    tracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr') ??
    tracks.find((t) => t.languageCode.startsWith('en') && t.kind !== 'asr') ??
    tracks.find((t) => t.languageCode.startsWith('en'))
  const cues = track ? parseJson3(await getJson(`${track.baseUrl}&fmt=json3`, {headers: {'user-agent': YT_UA}})) : []
  return {chapters, cues}
}

async function vimeo(id: string): Promise<Moments> {
  const token = process.env.VIMEO_ACCESS_TOKEN
  if (!token) throw new Error('vimeo: VIMEO_ACCESS_TOKEN not set')
  const headers = {authorization: `bearer ${token}`, accept: 'application/vnd.vimeo.*+json;version=3.4'}
  const [tracks, chaps] = await Promise.all([
    getJson(`https://api.vimeo.com/videos/${id}/texttracks`, {headers}),
    getJson(`https://api.vimeo.com/videos/${id}/chapters`, {headers}).catch(() => ({data: []})),
  ])
  const en: {language: string; link: string; active: boolean}[] = (tracks.data ?? []).filter((t: {language?: string}) =>
    t.language?.startsWith('en'),
  )
  const track = en.find((t) => t.active) ?? en[0]
  const chapters = (chaps.data ?? []).map((c: {timecode: number; title: string}) => ({
    startSeconds: Math.floor(c.timecode),
    label: c.title,
  }))
  return {chapters, cues: track ? parseVtt(await getText(track.link)) : []}
}

async function bunny(library: string, id: string): Promise<Moments> {
  const key = process.env.BUNNY_STREAM_API_KEY
  const cdn = process.env.BUNNY_CDN_HOSTNAME
  if (!key || !cdn) throw new Error('bunny: BUNNY_STREAM_API_KEY / BUNNY_CDN_HOSTNAME not set')
  const video = await getJson(`https://video.bunnycdn.com/library/${library}/videos/${id}`, {headers: {AccessKey: key}})
  const caption = (video.captions ?? []).find((c: {srclang: string}) => c.srclang.startsWith('en'))
  const chapters = (video.chapters ?? []).map((c: {start: number; title: string}) => ({
    startSeconds: Math.floor(c.start),
    label: c.title,
  }))
  const cues = caption ? parseVtt(await getText(`https://${cdn}/${id}/captions/${caption.srclang}.vtt`)) : []
  return {chapters, cues}
}

function moments(p: Provider) {
  if (p.kind === 'youtube') return youtube(p.id)
  if (p.kind === 'vimeo') return vimeo(p.id)
  return bunny(p.library, p.id)
}

// sanity exec compiles to CommonJS, so no top-level await.
async function main() {
  const urls: string[] = only
    ? [only]
    : await client.fetch(`array::unique(*[_type == "lesson" && defined(videoUrl)].videoUrl)`)
  const existing = new Set<string>(await client.fetch(`*[_type == "video"].url`))
  const tally = {created: 0, skipped: 0, failed: 0}

  for (const url of urls) {
    if (existing.has(url) && !force) {
      tally.skipped++
      continue
    }
    const provider = parseProvider(url)
    try {
      if (!provider) throw new Error('unsupported provider')
      const {chapters, cues} = await moments(provider)
      const chunks = toChunks(cues)
      if (!chapters.length && !chunks.length) throw new Error('no captions or chapters')
      await client.createOrReplace({
        _id: videoDocId(url),
        _type: 'video',
        url,
        chapters: chapters.map((c, i) => ({_key: `c${i}`, _type: 'chapter', ...c})),
        chunks: chunks.map((c, i) => ({_key: `k${i}`, _type: 'chunk', ...c})),
      })
      tally.created++
      console.log(`✓ ${url}  ${chapters.length} chapters, ${chunks.length} chunks`)
    } catch (err) {
      tally.failed++
      console.error(`✗ ${url}  ${(err as Error).message}`)
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`\ncreated ${tally.created} · skipped ${tally.skipped} · failed ${tally.failed}`)
}

main()
