import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { google } from "@ai-sdk/google";
import { Output, streamText } from "ai";
import { z } from "zod";
import { groundHit, searchTerms } from "@/lib/search";
import { sanityFetch } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SEARCH_HIT_QUERY } from "@/sanity/queries";

const QuerySchema = z.string().trim().min(2).max(200);

// The model only names lessons and seconds; nullable (not optional) keeps the schema strict-mode friendly.
const HitSchema = z.object({
  kind: z.enum(["video", "lesson"]),
  lessonId: z.string(),
  startSeconds: z.number().int().min(0).nullable(),
});

// Ranking and grounding rules; the query rules live in code (runSearchQueries) and in the Context document.
const SYSTEM_PROMPT = `You are the ranking step of search for Vertex, a video learning platform. You do not chat.
You get the learner's query and two JSON query results: matching lessons ({_id, title, _score}) and matching video moments ({lessonId, lessonTitle, chapters, chunks}). Return every relevant result ranked best first.

## Ranking
- Rank by specificity: the exact concept in a lesson title or chapter label beats a broad keyword hit in notes or transcript.
- A lesson that has a matching video moment is returned once, as a "video" result at its best moment (prefer a chapter over a chunk). Otherwise it is a "lesson" result.
- Leave out results that are only loosely related. Return at most 30.

## Grounding
- lessonId must be a lesson _id or video lessonId from the data. Never invent ids.
- For a "video" result, startSeconds must be the exact startSeconds of a chapter or chunk listed for that lessonId. For a "lesson" result, startSeconds is null.
- If nothing matches, return an empty array.`;

/** Runs the two prescribed queries through the Context MCP. `terms` are [a-z0-9]+* only (see searchTerms), so inlining is safe. */
async function runSearchQueries(mcp: MCPClient, terms: string[], signal: AbortSignal) {
  const t = JSON.stringify(terms);
  const lessons = `*[_type == "lesson" && (title match ${t} || pt::text(notes) match ${t} || keyPoints[] match ${t})] | score(boost(title match ${t}, 3), pt::text(notes) match ${t}, keyPoints[] match ${t}) | order(_score desc)[0...25]{_id, title, _score}`;
  // Chapters first; chunks only for videos with no matching chapter. Never project whole arrays.
  const videos = `*[_type == "video" && (chapters[].label match ${t} || chunks[].text match ${t})] | score(boost(chapters[].label match ${t}, 3), chunks[].text match ${t}) | order(_score desc)[0...25]{"lessonId": *[_type == "lesson" && videoUrl == ^.url][0]._id, "lessonTitle": *[_type == "lesson" && videoUrl == ^.url][0].title, "chapters": chapters[label match ${t}][0...2]{startSeconds, label}, "chunks": select(count(chapters[label match ${t}]) > 0 => [], chunks[text match ${t}][0...2]{startSeconds, text})}`;
  const run = async (query: string) => {
    const res = (await mcp.callTool({ name: "groq_query", arguments: { query }, options: { signal } })) as {
      isError?: boolean;
      content?: { type: string; text?: string }[];
    };
    const text = res.content?.[0]?.text;
    if (res.isError || !text) throw new Error(`groq_query failed: ${text ?? "no content"}`);
    return (JSON.parse(text) as { result: unknown[] }).result;
  };
  return Promise.all([run(lessons), run(videos)]);
}

const NDJSON_HEADERS = { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const parsed = QuerySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  if (!parsed.success) return Response.json({ error: "Query must be 2–200 characters." }, { status: 400 });

  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!mcpUrl || !token || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ error: "Search is not configured." }, { status: 500 });
  }

  // Only stop words or punctuation: nothing to match, skip the MCP and the LLM.
  const terms = searchTerms(parsed.data);
  if (!terms.length) return new Response("", { headers: NDJSON_HEADERS });

  let mcp: MCPClient | undefined;
  try {
    mcp = await createMCPClient({ transport: { type: "http", url: mcpUrl, headers: { Authorization: `Bearer ${token}` } } });
    const [lessons, videos] = await runSearchQueries(mcp, terms, request.signal);
    await mcp.close();
    if (!lessons.length && !videos.length) return new Response("", { headers: NDJSON_HEADERS });

    const result = streamText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
      instructions: SYSTEM_PROMPT,
      prompt: `Search query: ${parsed.data}\n\nLessons:\n${JSON.stringify(lessons)}\n\nVideo moments:\n${JSON.stringify(videos)}`,
      // Low thinking: the rules are spelled out; deeper thinking only adds latency.
      providerOptions: { google: { thinkingConfig: { thinkingLevel: "low" } } },
      output: Output.array({ element: HitSchema, maxItems: 30 }),
      // A stalled provider stream must not hold the request open; also stop when the learner leaves.
      timeout: { totalMs: 60_000 },
      abortSignal: request.signal,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const seen = new Set<string>();
        const hydrate = async (hit: z.infer<typeof HitSchema>) => {
          const lesson = await sanityFetch(SEARCH_HIT_QUERY, { id: hit.lessonId, t: hit.startSeconds ?? -1 });
          return groundHit(hit, lesson, (image, w, h) => urlFor(image).width(w).height(h).fit("crop").auto("format").url());
        };
        // Hydrate every hit as soon as it arrives, but write cards in the model's order.
        let written = Promise.resolve();
        try {
          for await (const hit of result.elementStream) {
            if (seen.has(hit.lessonId)) continue;
            seen.add(hit.lessonId);
            const card = hydrate(hit);
            written = written.then(async () => {
              const c = await card;
              if (c) controller.enqueue(encoder.encode(`${JSON.stringify(c)}\n`));
            });
            written.catch(() => {}); // surfaced by the await below
          }
          // Provider errors end elementStream quietly; the final output rejects instead.
          await result.output;
          await written;
        } catch (error) {
          console.error("search stream failed", error);
          controller.enqueue(encoder.encode(`${JSON.stringify({ error: "Search failed." })}\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: NDJSON_HEADERS });
  } catch (error) {
    console.error("search failed", error);
    await mcp?.close();
    return Response.json({ error: "Search failed." }, { status: 500 });
  }
}
