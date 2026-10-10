import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { google } from "@ai-sdk/google";
import { isStepCount, Output, streamText } from "ai";
import { z } from "zod";
import { groundHit } from "@/lib/search";
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

// Critical rules are repeated from the Context document: the model follows the system prompt more reliably.
const SYSTEM_PROMPT = `You are the search engine for Vertex, a video learning platform. You do not chat.
For the learner's query, find every relevant lesson and video moment with the groq_query tool, then return them ranked best first.

## Query rules
- Turn the query into keywords: drop stop words ("how", "to", "the", "in", "with"), wildcard each word, and OR them: "data fetching" -> ["data*", "fetching*"]. Never match the whole phrase as one pattern. groq_query takes no params, so write the array inline.
- Lessons: search title, pt::text(notes) and keyPoints[] in ONE query, ranked by score:
  *[_type == "lesson" && (title match $terms || pt::text(notes) match $terms || keyPoints[] match $terms)] | score(boost(title match $terms, 3), pt::text(notes) match $terms, keyPoints[] match $terms) | order(_score desc)[0...25]{_id, title, _score}
- Video moments live in "video" documents (url, chapters[{startSeconds, label}], chunks[{startSeconds, text}]). A video belongs to the lesson whose videoUrl equals video.url. Match chapters first; use transcript chunks only for videos with no matching chapter. Never project whole chapters or chunks arrays:
  *[_type == "video" && (chapters[].label match $terms || chunks[].text match $terms)][0...25]{"lessonId": *[_type == "lesson" && videoUrl == ^.url][0]._id, "chapters": chapters[label match $terms][0...2]{startSeconds, label}, "chunks": select(count(chapters[label match $terms]) > 0 => [], chunks[text match $terms][0...2]{startSeconds, text})}
- Run both queries, then stop querying. Do not use text::semanticSimilarity (embeddings are off).

## Ranking
- Rank by specificity: the exact concept in a lesson title or chapter label beats a broad keyword hit in notes or transcript.
- A lesson that has a matching video moment is returned once, as a "video" result at its best moment. Otherwise it is a "lesson" result.
- Leave out results that are only loosely related. Return at most 30.

## Grounding
- lessonId must be a lesson _id you saw in a query result. Never invent ids.
- For a "video" result, startSeconds must be the exact startSeconds of a chapter or chunk you saw. For a "lesson" result, startSeconds is null.
- If nothing matches, return an empty array.`;

// ponytail: cached for the process lifetime (Context doc edits still reach the tools per request); restart to refresh.
let initialContext: Promise<string> | undefined;

function getInitialContext(mcpUrl: string, token: string) {
  initialContext ??= fetch(`${mcpUrl.replace(/\/$/, "")}/initial-context`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => (res.ok ? res.text() : Promise.reject(new Error(`initial-context ${res.status}`))));
  initialContext.catch(() => (initialContext = undefined));
  return initialContext;
}

export async function GET(request: Request) {
  const parsed = QuerySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  if (!parsed.success) return Response.json({ error: "Query must be 2–200 characters." }, { status: 400 });

  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!mcpUrl || !token || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ error: "Search is not configured." }, { status: 500 });
  }

  let mcp: MCPClient | undefined;
  try {
    const [mcpClient, schema] = await Promise.all([
      createMCPClient({ transport: { type: "http", url: mcpUrl, headers: { Authorization: `Bearer ${token}` } } }),
      getInitialContext(mcpUrl, token),
    ]);
    mcp = mcpClient;
    // Only groq_query: schema is already in the prompt, and array readers could pull whole transcripts.
    const { groq_query } = await mcp.tools();

    const result = streamText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.1-flash-lite"),
      instructions: `${SYSTEM_PROMPT}\n\n# Data reference\n\n${schema}`,
      prompt: `Search query: ${parsed.data}`,
      tools: { groq_query },
      stopWhen: isStepCount(6),
      // Low thinking: the rules are spelled out; deeper thinking only adds latency and free-tier stalls.
      providerOptions: { google: { thinkingConfig: { thinkingLevel: "low" } } },
      output: Output.array({ element: HitSchema, maxItems: 30 }),
      // A stalled provider stream must not hold the request open; also stop when the learner leaves.
      timeout: { totalMs: 60_000, toolMs: 15_000 },
      abortSignal: request.signal,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const seen = new Set<string>();
        try {
          for await (const hit of result.elementStream) {
            if (seen.has(hit.lessonId)) continue;
            const lesson = await sanityFetch(SEARCH_HIT_QUERY, { id: hit.lessonId, t: hit.startSeconds ?? -1 });
            const card = groundHit(hit, lesson, (image, w, h) => urlFor(image).width(w).height(h).fit("crop").auto("format").url());
            if (!card) continue;
            seen.add(hit.lessonId);
            controller.enqueue(encoder.encode(`${JSON.stringify(card)}\n`));
          }
          // Provider errors end elementStream quietly; the final output rejects instead.
          await result.output;
        } catch (error) {
          console.error("search stream failed", error);
          controller.enqueue(encoder.encode(`${JSON.stringify({ error: "Search failed." })}\n`));
        } finally {
          controller.close();
          await mcp?.close();
        }
      },
    });

    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("search failed", error);
    await mcp?.close();
    return Response.json({ error: "Search failed." }, { status: 500 });
  }
}
