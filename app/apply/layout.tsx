import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply to join TRÜ Dating Nashville. Our application takes about 2 minutes. We review every application to curate a quality community.",
  openGraph: {
    title: "Apply | TRÜ Dating Nashville",
    description:
      "Apply to join Nashville's curated dating events community. Takes about 2 minutes.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
