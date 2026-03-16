import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TRÜ Nashville",
    short_name: "TRÜ",
    description:
      "A private social club for interesting people who happen to be single. Nashville waitlist now open.",
    start_url: "/",
    display: "standalone",
    background_color: "#0C0C0D",
    theme_color: "#0C0C0D",
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
