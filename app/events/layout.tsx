import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse upcoming TRÜ dating events in Nashville. Rooftop wine tastings, dinner parties, hikes, trivia nights, and more for singles aged 25–42.",
  openGraph: {
    title: "Upcoming Events | TRÜ Dating Nashville",
    description:
      "Rooftop wine tastings, dinner parties, hikes, and more. Browse upcoming events for Nashville singles.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
