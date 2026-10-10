// Embed URLs are rebuilt from parsed ids, never passed through from the author's URL.
const YOUTUBE_ID = /^[\w-]{11}$/;
const SAFE_ID = /^[\w-]+$/;

/** Provider embed URL that starts at `start` seconds; null for unsupported URLs. */
export function embedUrl(videoUrl: string, start = 0): string | null {
  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  const t = Math.max(0, Math.floor(start));

  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    const id = host === "youtu.be" ? parts[0] : url.searchParams.get("v") ?? (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null);
    return id && YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?start=${t}&rel=0` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = parts.find((p) => /^\d+$/.test(p));
    return id ? `https://player.vimeo.com/video/${id}#t=${t}s` : null;
  }
  if (host === "iframe.mediadelivery.net" && ["embed", "play"].includes(parts[0])) {
    const [, lib, id] = parts;
    return lib && id && SAFE_ID.test(lib) && SAFE_ID.test(id) ? `https://iframe.mediadelivery.net/embed/${lib}/${id}?t=${t}` : null;
  }
  return null;
}

/** `?t=` search param → whole seconds, or 0 when missing/invalid. */
export function parseStart(value: string | string[] | undefined) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}
