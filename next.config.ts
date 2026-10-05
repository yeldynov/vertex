import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Object form: Sanity crop/size params live in the query string, which the URL form disallows.
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }] },
};

export default nextConfig;
