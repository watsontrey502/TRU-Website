import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TRU Dating Nashville",
    short_name: "TRU",
    description:
      "Curated dating events for Nashville singles. Stop swiping. Start connecting.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8F0",
    theme_color: "#2C4A3E",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
