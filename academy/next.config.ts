import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __projectDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: resolve(__projectDir),
  },
};

export default nextConfig;
