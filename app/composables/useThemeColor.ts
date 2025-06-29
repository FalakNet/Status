/**
 * Composable to manage dynamic theme colors based on site status
 */
export const useThemeColor = () => {
  const statusStore = useStatusStore();

  const getThemeColor = (status: string) => {
    switch (status) {
      case "normal":
        return "#2ecc71"; // Green
      case "error":
        return "#de484a"; // Red
      case "warn":
        return "#f39c12"; // Orange/Yellow
      case "loading":
        return "#58d0ff"; // Blue
      case "unknown":
      default:
        return "#7f8c8d"; // Gray
    }
  };

  const updateThemeColor = () => {
    const color = getThemeColor(statusStore.siteStatus);
    
    // Update theme-color meta tag
    useHead({
      meta: [
        {
          name: "theme-color",
          content: color,
        },
      ],
    });

    // Update CSS custom property for additional styling
    if (process.client) {
      document.documentElement.style.setProperty("--dynamic-theme-color", color);
      
      // Update manifest link to trigger browser to fetch new manifest
      updateManifestLink();
    }
  };

  const updateManifestLink = () => {
    if (process.client) {
      const existingLink = document.querySelector('link[rel="manifest"]');
      if (existingLink) {
        const newLink = existingLink.cloneNode() as HTMLLinkElement;
        newLink.href = `/api/manifest?t=${Date.now()}`; // Add timestamp to bypass cache
        existingLink.parentNode?.replaceChild(newLink, existingLink);
      }
    }
  };

  // Watch for status changes and update theme color
  watchEffect(() => {
    updateThemeColor();
  });

  return {
    getThemeColor,
    updateThemeColor,
    updateManifestLink,
  };
};
