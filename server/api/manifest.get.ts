import type { MonitorsDataResult } from "~~/types/main";
import { getCache } from "~/utils/cache-server";

/**
 * Dynamic PWA manifest based on site status
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { siteTitle, siteDescription } = config.public;

  // Get cached site data to determine status
  const cacheKey = "site-data";
  const cachedData = getCache(cacheKey) as MonitorsDataResult | null;

  // Determine colors based on status
  let themeColor = "#128771"; // Default green for normal
  let backgroundColor = "#128771";
  let iconPath = "normal";

  if (cachedData?.status) {
    const { status } = cachedData;
    
    if (status.count === status.ok) {
      // All normal - green
      themeColor = "#128771";
      backgroundColor = "#128771";
      iconPath = "normal";
    } else if (status.count === status.error || status.error === status.count) {
      // All offline/error - red
      themeColor = "#ef4444";
      backgroundColor = "#ef4444";
      iconPath = "error";
    } else if (status.error > 0 || status.unknown > 0) {
      // Some issues - yellow
      themeColor = "#eab308";
      backgroundColor = "#eab308";
      iconPath = "normal"; // Use normal icons for warn state
    }
  } else {
    // No data available - default to loading state (neutral)
    themeColor = "#128771";
    backgroundColor = "#128771";
    iconPath = "normal";
  }

  const manifest = {
    name: siteTitle,
    short_name: siteDescription,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: themeColor,
    icons: [
      {
        src: `/images/icons/${iconPath}/pwa-64x64.png`,
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: `/images/icons/${iconPath}/pwa-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `/images/icons/${iconPath}/pwa-512x512.png`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `/images/icons/${iconPath}/maskable-icon-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  // Set proper headers for manifest
  setHeader(event, "Content-Type", "application/manifest+json");
  setHeader(event, "Cache-Control", "public, max-age=300"); // Cache for 5 minutes

  return manifest;
});
