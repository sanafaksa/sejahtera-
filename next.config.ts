import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jvirjhgozafatvcjakur.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },

  serverExternalPackages: ["@prisma/client", "@prisma/engines"],

  // Keep the admin area out of search results.
  async headers() {
    return [
      {
        source: "/ilv-studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
