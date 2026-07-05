import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The deck reads engagement markdown from OUTSIDE this project dir (the harness root),
  // so server code must use the Node.js runtime with native fs. Route handlers pin
  // `runtime = 'nodejs'` individually; nothing here is edge-bound.
  reactStrictMode: true,
};

export default nextConfig;
