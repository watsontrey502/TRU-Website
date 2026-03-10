import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Call the SECURITY DEFINER function that bypasses RLS
  // to detect mutual votes across both sides of double_take_votes
  const { data: matches, error } = await supabase
    .rpc("get_my_matches", { requesting_user_id: user.id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matches: matches ?? [] });
}
