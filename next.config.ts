import type { NextConfig } from "next";
import { themeColors } from "./src/config/theme";

const nextConfig: NextConfig = {
  /* config options here */
  // Theme colors are configured in src/config/theme.ts
  // Access via: import { themeColors } from './src/config/theme'
};

// Re-export theme colors for convenience
export const theme = {
  colors: themeColors,
};

export default nextConfig;
