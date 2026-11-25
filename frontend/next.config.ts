import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/quizzes",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
