# Search: switch the LLM to Gemini's free tier

## Goal

Run `/api/search` on Google Gemini's free tier instead of paid OpenAI, because the OpenAI key returns `429 insufficient_quota`. The MCP connection, system prompt, grounding, NDJSON stream and UI stay exactly as built in `prompts/search.md`.

## Decisions & assumptions

1. **Provider:** replace `@ai-sdk/openai` with `@ai-sdk/google` (4.0.93, AI SDK 7 line). In the route, `openai(...)` becomes `google(process.env.GEMINI_MODEL || "<default>")`. The key is read from `GOOGLE_GENERATIVE_AI_API_KEY`, the provider's default env name. No other code changes.
2. **Model:** a Flash model, set by `GEMINI_MODEL`. The default is whichever current Flash model the free key actually lists, checked once with `GET https://generativelanguage.googleapis.com/v1beta/models` (likely `gemini-3.8-flash` or a newer `gemini-3.x-flash`).
3. **Tools + structured output:** the AI SDK docs say Gemini requires structured outputs for tool calling, but they don't confirm that a tool loop and a response schema work in the same request. The default is tried first. If Gemini rejects the combination, the route sets `providerOptions.google.structuredOutputs = false`. The AI SDK then requests JSON through the prompt and still validates every element against the Zod `HitSchema`, so grounding is unchanged.
4. **Free-tier limits:**
   - Requests per minute are low. A 429 from Gemini already surfaces as the page's "Search failed. Try again" state, because errors were fixed to reach the stream.
   - On the free tier, Google may use prompts (search queries + course content) to improve its models. Course content is not sensitive, and learner queries are anonymous text.
5. **Cleanup:**
   - Remove `@ai-sdk/openai`.
   - `.env.example`: replace `OPENAI_API_KEY`/`OPENAI_MODEL` with `GOOGLE_GENERATIVE_AI_API_KEY`/`GEMINI_MODEL`.
   - `AGENTS.md` stack line: "Vercel AI SDK with the OpenAI provider" → "Vercel AI SDK with the Google (Gemini) provider", so future tasks follow the change.
   - The route's config check tests `GOOGLE_GENERATIVE_AI_API_KEY`.

## Files

- `app/api/search/route.ts`: provider import, model, env check (and `providerOptions` only if needed).
- `package.json` / lock: `+@ai-sdk/google`, `-@ai-sdk/openai`.
- `.env.example`, `AGENTS.md`.

## Security

The Gemini key is server-only. It is read in the route handler only and never prefixed `NEXT_PUBLIC_`. Nothing else changes: the browser still calls only `/api/search`.

## Acceptance criteria

- With a free AI Studio key in `.env.local`, `curl 'localhost:3000/api/search?q=server%20components'` streams grounded lesson lines. "Fetching data in server components" and "What server components actually do" rank first.
- `/search?q=server+components` renders the cards, count line and sort, and gets compared with `design/vertex-search.png`.
- `q=zzqx` shows the empty state.

## Checks

`node --test lib/*.test.ts`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, plus the live curl above against the real MCP + Gemini, with the real output reported.

## Manual test

1. Get a free key at https://aistudio.google.com/apikey (no card needed).
2. Add `GOOGLE_GENERATIVE_AI_API_KEY=<key>` to `.env.local`, then run `npm run dev`.
3. Search "server components" from the home page. Cards stream in.
4. Search "zzqx". You should see the empty state and "Browse all courses".

## Needs your attention

- I need the key in `.env.local` before I can run the live check. Everything else can be done without it.
