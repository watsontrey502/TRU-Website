import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "You're Invited",
  description:
    "You've been invited to apply for TRÜ — Nashville's members-only social club for interesting people who happen to be single.",
  openGraph: {
    title: "You're Invited to TRÜ",
    description:
      "A private social club for interesting people who happen to be single. Curated events, beautiful venues, and Double Take post-event matching.",
  },
};

export default function InvitePage() {
  redirect("/apply");
}
