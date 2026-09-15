import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "maidensail.com" },
      { protocol: "https", hostname: "subscrr.app" },
    ],
  },
};

export default nextConfig;
