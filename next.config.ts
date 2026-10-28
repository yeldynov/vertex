import type { NextConfig } from "next";

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

const nextConfig: NextConfig = {
  // Object form: Sanity crop/size params live in the query string, which the URL form disallows.
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }] },
  // First-party path for PostHog so ad blockers do not drop browser events.
  async rewrites() {
    if (!posthogHost) return [];
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com")}/static/:path*`,
      },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
  // PostHog API paths end with a slash.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
