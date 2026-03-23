import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        event_id,
        participant_a,
        participant_b,
        created_at,
        expires_at,
        extended,
        status,
        events:event_id (name),
        profile_a:participant_a (id, first_name, last_name, avatar_url, instagram),
        profile_b:participant_b (id, first_name, last_name, avatar_url, instagram)
      `
      )
      .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Conversations fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get last message and unread count for each conversation
    const conversationsWithMessages = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Last message
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("content, sender_id, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Unread count
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .is("read_at", null);

        // Determine the "other" person
        const otherProfile =
          conv.participant_a === user.id ? conv.profile_b : conv.profile_a;

        // Check if expired
        const isExpired =
          conv.status === "expired" ||
          (conv.status === "active" &&
            new Date(conv.expires_at) < new Date());

        return {
          id: conv.id,
          event_name: (() => {
            const e = conv.events;
            if (Array.isArray(e)) return e[0]?.name || "Unknown Event";
            if (e && typeof e === "object" && "name" in e) return (e as { name: string }).name;
            return "Unknown Event";
          })(),
          other_person: otherProfile,
          last_message: lastMessage,
          unread_count: unreadCount || 0,
          expires_at: conv.expires_at,
          is_expired: isExpired,
          extended: conv.extended,
          status: isExpired && conv.status === "active" ? "expired" : conv.status,
        };
      })
    );

    return NextResponse.json(conversationsWithMessages);
  } catch (err) {
    console.error("Messages error:", err);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
