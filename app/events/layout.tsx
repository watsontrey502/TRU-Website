import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse upcoming TRÜ events in Nashville. Curated experiences at beautiful venues for interesting people who happen to be single.",
  openGraph: {
    title: "Upcoming Events | TRÜ Nashville",
    description:
      "Curated experiences at beautiful Nashville venues. Browse upcoming events for members and waitlist.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
