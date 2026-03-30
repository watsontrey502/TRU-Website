import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | "signup" | "magiclink" | "recovery" | null;
  const token = searchParams.get("token");
  // Default to onboarding if this is a signup confirmation, dashboard otherwise
  let next = searchParams.get("next") ?? "/dashboard";

  // If type is signup or email (new account confirmation), redirect to onboarding
  if (type === "signup" || type === "email") {
    next = token ? `/onboarding?token=${token}` : "/onboarding";
  }

  // Password reset flow → redirect to reset password page
  if (type === "recovery") {
    next = "/reset-password";
  }

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      // Preserve token param in the redirect if present in next
      const response = NextResponse.redirect(redirectTo);
      request.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value);
      });
      return response;
    }
  }

  // If verification fails, redirect to login with error
  redirectTo.pathname = "/login";
  return NextResponse.redirect(redirectTo);
}
