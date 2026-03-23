import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { resend, FROM_EMAIL } from "@/lib/email/resend";
import { verificationComplete } from "@/lib/email/templates";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin ? user : null;
}

/** GET: List profiles pending verification */
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data, error } = await service
      .from("profiles")
      .select(
        "id, first_name, last_name, email, instagram, id_document_path, verification_status, created_at"
      )
      .in("verification_status", [
        "id_uploaded",
        "id_approved",
        "background_pending",
      ])
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate signed URLs for ID documents
    const profilesWithUrls = await Promise.all(
      (data || []).map(async (profile) => {
        let id_document_url = null;
        if (profile.id_document_path) {
          const { data: signedUrl } = await service.storage
            .from("id-documents")
            .createSignedUrl(profile.id_document_path, 3600); // 1 hour expiry
          id_document_url = signedUrl?.signedUrl || null;
        }
        return { ...profile, id_document_url };
      })
    );

    return NextResponse.json(profilesWithUrls);
  } catch (err) {
    console.error("Verification list error:", err);
    return NextResponse.json(
      { error: "Failed to fetch verifications" },
      { status: 500 }
    );
  }
}

/** PATCH: Approve/reject ID, or trigger background check */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profile_id, action } = await req.json();
    if (!profile_id || !action) {
      return NextResponse.json(
        { error: "profile_id and action are required" },
        { status: 400 }
      );
    }

    const service = createServiceClient();

    if (action === "approve_id") {
      // ID looks good — mark as approved, trigger background check
      await service
        .from("profiles")
        .update({ verification_status: "background_pending" })
        .eq("id", profile_id);

      // TODO: Integrate Checkr API here when ready
      // For now, admin can manually mark as verified after Checkr results

      return NextResponse.json({ success: true, status: "background_pending" });
    }

    if (action === "reject_id") {
      await service
        .from("profiles")
        .update({
          verification_status: "rejected",
          id_document_path: null,
        })
        .eq("id", profile_id);

      return NextResponse.json({ success: true, status: "rejected" });
    }

    if (action === "verify") {
      // Background check passed — mark as fully verified
      await service
        .from("profiles")
        .update({ verification_status: "verified" })
        .eq("id", profile_id);

      // Send verification email
      const { data: profile } = await service
        .from("profiles")
        .select("first_name, email")
        .eq("id", profile_id)
        .single();

      if (profile) {
        const { subject, html } = verificationComplete(profile.first_name);
        await resend.emails
          .send({ from: FROM_EMAIL, to: profile.email, subject, html })
          .catch(console.error);
      }

      return NextResponse.json({ success: true, status: "verified" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Verification update error:", err);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
}
