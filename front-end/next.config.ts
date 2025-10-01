import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/2025-2-Squad-01' : '',
  assetPrefix: isProd ? '/2025-2-Squad-01' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
