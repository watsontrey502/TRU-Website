import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind TRÜ Dating Nashville. We started TRÜ because Nashville deserves better than dating apps — real people, real experiences, real connection.",
  openGraph: {
    title: "About TRÜ Dating Nashville",
    description:
      "The story behind TRÜ. We started this because Nashville deserves better than dating apps.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
