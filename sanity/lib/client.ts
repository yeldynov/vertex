import "server-only";
import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "../env";

// The dataset is private: every read carries the token, so this module must never reach the browser.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: readToken,
  useCdn: true,
  perspective: "published",
});

// ponytail: time-based revalidation; switch to tag-based + a webhook if 60s staleness hurts.
export function sanityFetch<const Q extends string>(query: Q, params: QueryParams = {}) {
  return client.fetch(query, params, { next: { revalidate: 60 } });
}
