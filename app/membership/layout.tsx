import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Join TRÜ Nashville. Two membership tiers — Member ($25/mo) and Inner Circle ($65/mo). Curated events, Double Take matching, and a real community.",
  openGraph: {
    title: "Membership | TRÜ Nashville",
    description:
      "Two tiers starting at $25/mo. Curated events, Double Take matching, and a vetted community of Nashville singles.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
