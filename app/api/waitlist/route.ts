import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

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

    // ── 2. Send to Flodesk (email marketing) ───────────────
    const apiKey = process.env.FLODESK_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch("https://api.flodesk.com/v1/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
          },
          body: JSON.stringify({
            email,
            first_name: firstName,
            last_name: lastName,
            custom_fields: {
              phone,
              age,
              gender,
              instagram,
              neighborhood,
              work,
              heard_from: heardFrom,
              interesting,
              ideal_date: idealDate,
              referral_code: referralCode,
            },
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Flodesk API error:", res.status, errorText);
        }

        // Add subscriber to the Waitlist segment (if configured)
        const segmentId = process.env.FLODESK_WAITLIST_SEGMENT_ID;
        if (segmentId && res.ok) {
          await fetch(
            `https://api.flodesk.com/v1/subscribers/${encodeURIComponent(email)}/segments`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
              },
              body: JSON.stringify({ segment_ids: [segmentId] }),
            }
          );
        }
      } catch (flodeskErr) {
        console.error("Flodesk request failed:", flodeskErr);
        // Non-fatal — data is safe in Supabase
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
