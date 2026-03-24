import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token = searchParams.get("token");
  const next = searchParams.get("next");

  const redirectTo = request.nextUrl.clone();

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Determine redirect destination
      if (token) {
        // Signup flow: redirect to onboarding with invite token
        redirectTo.pathname = "/onboarding";
        redirectTo.searchParams.set("token", token);
      } else if (next) {
        // Login flow: redirect to specified path
        redirectTo.pathname = next;
      } else {
        redirectTo.pathname = "/dashboard";
      }

      // Clean up query params
      redirectTo.searchParams.delete("code");
      redirectTo.searchParams.delete("next");

      const response = NextResponse.redirect(redirectTo);
      request.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value);
      });
      return response;
    }
  }

  // If code exchange fails, redirect to login
  redirectTo.pathname = "/login";
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("token");
  redirectTo.searchParams.delete("next");
  return NextResponse.redirect(redirectTo);
}
