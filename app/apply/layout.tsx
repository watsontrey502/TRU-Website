import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply to join TRÜ Nashville. Our application takes about 2 minutes. We review every application to curate a quality community.",
  openGraph: {
    title: "Apply | TRÜ Nashville",
    description:
      "Apply to join Nashville's members-only social club. Takes about 2 minutes.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
