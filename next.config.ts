import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Optimization ON: Next serves resized WebP/AVIF via /_next/image for better
    // mobile Core Web Vitals. All <Image> sources must be whitelisted below.
    unoptimized: false,
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

  async redirects() {
    return [
      // /process was replaced by /craftsmanship.
      { source: "/process", destination: "/craftsmanship", permanent: true },
      // Products renamed to drop the "Tumang" slug prefix: keep old URLs alive.
      {
        source: "/products/tumang-hand-spun-copper-pendant-dome",
        destination: "/products/hand-spun-copper-pendant-dome",
        permanent: true,
      },
      {
        source: "/products/tumang-fluted-copper-urn-planter",
        destination: "/products/fluted-copper-urn-planter",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      // Keep the admin area out of search results.
      {
        source: "/ilv-studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Only www.ilavioo.com should be indexed: sejahtera-one.vercel.app and
      // preview deployments serve the same pages and would be duplicates.
      {
        source: "/:path*",
        missing: [{ type: "host", value: "www.ilavioo.com" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      // Static images are not content-hashed, so cache for a day and refresh in the background.
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
