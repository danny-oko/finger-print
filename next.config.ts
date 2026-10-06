import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/come", destination: "/invite", permanent: true }];
  },
};

export default nextConfig;
