import "server-only";

export const apiVersion = "2026-10-05";
export const projectId = required("SANITY_PROJECT_ID");
export const dataset = required("SANITY_DATASET");
export const readToken = required("SANITY_API_READ_TOKEN");

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
