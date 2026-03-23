import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a participant
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, participant_a, participant_b, expires_at, status, extended")
      .eq("id", conversationId)
      .single();

    if (
      !conversation ||
      (conversation.participant_a !== user.id &&
        conversation.participant_b !== user.id)
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch messages
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: messages, error } = await supabase
      .from("messages")
      .select("id, sender_id, content, read_at, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      conversation,
      messages: messages || [],
    });
  } catch (err) {
    console.error("Messages fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a participant and conversation is active
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, participant_a, participant_b, expires_at, status")
      .eq("id", conversationId)
      .single();

    if (
      !conversation ||
      (conversation.participant_a !== user.id &&
        conversation.participant_b !== user.id)
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if expired
    const isExpired =
      conversation.status === "expired" ||
      (conversation.status === "active" &&
        new Date(conversation.expires_at) < new Date());

    if (isExpired) {
      return NextResponse.json(
        { error: "This conversation has expired. Extend it to keep chatting." },
        { status: 403 }
      );
    }

    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select("id, sender_id, content, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(message);
  } catch (err) {
    console.error("Send message error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
