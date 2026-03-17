import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { resend, FROM_EMAIL } from "@/lib/email/resend";
import {
  applicationApproved,
  applicationWaitlisted,
  applicationRejected,
} from "@/lib/email/templates";

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

const templates: Record<string, typeof applicationApproved> = {
  approved: applicationApproved,
  waitlisted: applicationWaitlisted,
  rejected: applicationRejected,
};

const validStatuses = ["pending", "approved", "waitlisted", "rejected"];

async function sendStatusEmail(
  status: string,
  previousStatus: string,
  email: string,
  firstName: string
) {
  if (status === "pending" || status === previousStatus) return;
  const template = templates[status];
  if (!template) return;

  try {
    const { subject, html } = template(firstName);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });
  } catch (emailErr) {
    console.error("Email send failed:", emailErr);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ids, status, admin_notes } = body;

    const service = createServiceClient();

    // --- Handle admin notes update (single record) ---
    if (id && admin_notes !== undefined && !status) {
      const { error } = await service
        .from("waitlist_submissions")
        .update({ admin_notes, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    // --- Handle bulk status update ---
    if (ids && Array.isArray(ids) && ids.length > 0 && status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      // Fetch all submissions for email sending
      const { data: submissions } = await service
        .from("waitlist_submissions")
        .select("id, first_name, email, status")
        .in("id", ids);

      if (!submissions || submissions.length === 0) {
        return NextResponse.json(
          { error: "No submissions found" },
          { status: 404 }
        );
      }

      // Bulk update
      const { error } = await service
        .from("waitlist_submissions")
        .update({ status, updated_at: new Date().toISOString() })
        .in("id", ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Send emails in parallel (non-fatal)
      await Promise.allSettled(
        submissions.map((sub) =>
          sendStatusEmail(status, sub.status, sub.email, sub.first_name)
        )
      );

      return NextResponse.json({ success: true, count: submissions.length });
    }

    // --- Handle single status update ---
    if (id && status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const { data: submission } = await service
        .from("waitlist_submissions")
        .select("first_name, email, status")
        .eq("id", id)
        .single();

      if (!submission) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      const updateData: Record<string, string> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (admin_notes !== undefined) {
        updateData.admin_notes = admin_notes;
      }

      const { error } = await service
        .from("waitlist_submissions")
        .update(updateData)
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await sendStatusEmail(
        status,
        submission.status,
        submission.email,
        submission.first_name
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
