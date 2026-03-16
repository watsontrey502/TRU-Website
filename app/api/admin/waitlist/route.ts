import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { resend, FROM_EMAIL } from "@/lib/email/resend";
import {
  applicationApproved,
  applicationWaitlisted,
  applicationRejected,
} from "@/lib/email/templates";

export async function PATCH(req: NextRequest) {
  try {
    // Verify the caller is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "approved", "waitlisted", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Use service client to bypass RLS for the update
    const service = createServiceClient();

    // Fetch submission details for the email
    const { data: submission } = await service
      .from("waitlist_submissions")
      .select("first_name, email, status")
      .eq("id", id)
      .single();

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const { error } = await service
      .from("waitlist_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send status email (non-fatal if it fails)
    if (status !== "pending" && status !== submission.status) {
      try {
        const templates: Record<string, typeof applicationApproved> = {
          approved: applicationApproved,
          waitlisted: applicationWaitlisted,
          rejected: applicationRejected,
        };

        const template = templates[status];
        if (template) {
          const { subject, html } = template(submission.first_name);
          await resend.emails.send({
            from: FROM_EMAIL,
            to: submission.email,
            subject,
            html,
          });
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        // Non-fatal — status was still updated
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
