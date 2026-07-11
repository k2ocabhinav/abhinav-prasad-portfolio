import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  experimental: {
    inlineCss: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
