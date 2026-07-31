import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/modules/:moduleSlug/:chapterSlug',
        destination: '/tracks/go/:moduleSlug/:chapterSlug',
        permanent: true,
      },
      {
        source: '/modules/:moduleSlug',
        destination: '/tracks/go',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
