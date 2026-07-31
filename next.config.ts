import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/modules/:moduleSlug/:chapterSlug',
        destination: '/tracks/go/modules/:moduleSlug/:chapterSlug',
        permanent: true,
      },
      {
        source: '/modules/:moduleSlug',
        destination: '/tracks/go/modules/:moduleSlug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
