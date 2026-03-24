import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Missing token" },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  const { data, error } = await service
    .from("waitlist_submissions")
    .select("id, email, first_name, invite_claimed_at")
    .eq("invite_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { valid: false, error: "Invalid invitation token" },
      { status: 404 }
    );
  }

  if (data.invite_claimed_at) {
    return NextResponse.json(
      { valid: false, error: "This invitation has already been used" },
      { status: 410 }
    );
  }

  return NextResponse.json({
    valid: true,
    email: data.email,
    firstName: data.first_name,
  });
}
