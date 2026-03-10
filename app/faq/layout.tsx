import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about TRÜ Dating Nashville — how it works, membership, events, Double Take matching, and more.",
  openGraph: {
    title: "FAQ | TRÜ Dating Nashville",
    description:
      "Everything you need to know about TRÜ Dating Nashville.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
