import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    unoptimized: true,
    domains: []
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;