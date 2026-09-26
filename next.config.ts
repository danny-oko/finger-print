import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /come share card reads its stickers by a computed path, which file
  // tracing can't follow on its own.
  outputFileTracingIncludes: {
    "/api/og/come": ["./assets/og/**"],
  },
};

export default nextConfig;
