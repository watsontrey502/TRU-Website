import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about TRÜ Nashville — how it works, membership, events, Double Take matching, and more.",
  openGraph: {
    title: "FAQ | TRÜ Nashville",
    description:
      "Everything you need to know about TRÜ Nashville.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
