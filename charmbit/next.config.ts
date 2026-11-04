import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The sticker chat traces custom lettering with this font at request time.
  outputFileTracingIncludes: {
    "/api/sticker-chat": ["./assets/fonts/**"],
  },
};

export default nextConfig;
