import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "TRÜ Dating Nashville's terms of service. Membership eligibility, event policies, community standards, and more.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
