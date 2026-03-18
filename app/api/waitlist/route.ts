import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { resend, FROM_EMAIL } from "@/lib/email/resend";
import { applicationReceived, newApplicationAdmin } from "@/lib/email/templates";

// Flodesk form reference: https://trudatingnashville.myflodesk.com/waitlist
// Form ID: 6849f5cd1c9e3680be1db78b
//
// Setup: Get your API key from https://app.flodesk.com/account/api
// and add it to .env.local as FLODESK_API_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName, lastName, email, phone, age, gender,
      instagram, neighborhood, work, heardFrom,
      interesting, idealDate, referralCode,
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── 1. Store in Supabase (primary data store) ──────────
    const supabase = createServiceClient();
    const { error: dbError } = await supabase
      .from("waitlist_submissions")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        age: age || null,
        gender: gender || null,
        instagram: instagram || null,
        neighborhood: neighborhood || null,
        work: work || null,
        heard_from: heardFrom || null,
        interesting: interesting || null,
        ideal_date: idealDate || null,
        referral_code: referralCode || null,
      });

    if (dbError) {
      console.error("Supabase insert error:", dbError.message);
      // Don't fail the request — still try Flodesk
    }

    // ── 2. Send confirmation email to applicant ───────────
    if (process.env.RESEND_API_KEY) {
      try {
        const { subject, html } = applicationReceived(firstName);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject,
          html,
        });
      } catch (emailErr) {
        console.error("Resend email failed:", emailErr);
        // Non-fatal — data is safe in Supabase
      }
    }

    // ── 3. Notify admin of new application ───────────────
    const adminEmail = process.env.ADMIN_EMAIL;
    if (process.env.RESEND_API_KEY && adminEmail) {
      try {
        const { subject, html } = newApplicationAdmin({
          firstName, lastName, email, phone, age, gender,
          instagram, neighborhood, work, heardFrom: heardFrom,
          interesting, idealDate: idealDate, referralCode: referralCode,
        });
        await resend.emails.send({
          from: FROM_EMAIL,
          to: adminEmail,
          subject,
          html,
        });
      } catch (adminEmailErr) {
        console.error("Admin notification email failed:", adminEmailErr);
        // Non-fatal
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
