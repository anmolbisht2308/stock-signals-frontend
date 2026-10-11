import type { NextConfig } from "next";

// The browser calls /api/* on this app; Next forwards it to the Python API on your Mac,
// so the API never has to be reachable from anywhere else.
const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
