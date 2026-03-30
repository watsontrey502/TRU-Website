"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OtherPerson {
  id: string;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  instagram?: string;
}

interface LastMessage {
  content: string;
  sender_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  event_name: string;
  other_person: OtherPerson;
  last_message: LastMessage | null;
  unread_count: number;
  expires_at: string;
  is_expired: boolean;
  extended: boolean;
  status: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface ConversationDetail {
  id: string;
  participant_a: string;
  participant_b: string;
  expires_at: string;
  status: string;
  extended: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d";
  return `${days}d`;
}

function daysUntil(dateStr: string): number {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  return (then - now) / (1000 * 60 * 60 * 24);
}

function expiryLabel(
  dateStr: string,
  isExpired: boolean
): { text: string; color: string; urgency: "safe" | "warn" | "danger" } {
  if (isExpired)
    return { text: "Expired", color: "text-red-400", urgency: "danger" };
  const days = daysUntil(dateStr);
  if (days > 3)
    return {
      text: `${Math.ceil(days)}d left`,
      color: "text-emerald-400",
      urgency: "safe",
    };
  if (days >= 1)
    return {
      text: `${Math.ceil(days)}d left`,
      color: "text-yellow-400",
      urgency: "warn",
    };
  const hours = Math.max(1, Math.ceil(days * 24));
  return { text: `${hours}h left`, color: "text-red-400", urgency: "danger" };
}

/** Returns 0..1 progress where 1 = just created, 0 = expired */
function expiryProgress(dateStr: string): number {
  const totalDays = 7;
  const days = daysUntil(dateStr);
  return Math.max(0, Math.min(1, days / totalDays));
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDateHeading(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "Yesterday";

  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function groupMessagesByDate(
  messages: Message[]
): { date: string; messages: Message[] }[] {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const d = new Date(msg.created_at);
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ date: msg.created_at, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

const MAX_CHARS = 2000;

/* ------------------------------------------------------------------ */
/*  Avatar component                                                   */
/* ------------------------------------------------------------------ */

function Avatar({
  person,
  size = "md",
}: {
  person?: OtherPerson | null;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "w-9 h-9", md: "w-11 h-11", lg: "w-12 h-12" };
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-lg" };

  if (person?.avatar_url) {
    return (
      <div
        className={`${dims[size]} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gold/20`}
      >
        <img
          src={person.avatar_url}
          alt={person.first_name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dims[size]} rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center flex-shrink-0 ring-2 ring-gold/20`}
    >
      <span className={`text-gold font-serif font-bold ${textSize[size]}`}>
        {person?.first_name?.[0]?.toUpperCase() ?? "?"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Expiry bar                                                         */
/* ------------------------------------------------------------------ */

function ExpiryBar({
  expiresAt,
  isExpired,
}: {
  expiresAt: string;
  isExpired: boolean;
}) {
  const progress = isExpired ? 0 : expiryProgress(expiresAt);
  const barColor =
    progress > 0.4
      ? "bg-emerald-400"
      : progress > 0.15
        ? "bg-yellow-400"
        : "bg-red-400";

  return (
    <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${barColor} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function MessagesPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Thread state
  const [messages, setMessages] = useState<Message[]>([]);
  const [convDetail, setConvDetail] = useState<ConversationDetail | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [extending, setExtending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Active conversation from list
  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  // Grouped messages by date
  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  // Sort conversations: unread first, then by last message time
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      // Active (non-expired) first
      if (a.is_expired !== b.is_expired) return a.is_expired ? 1 : -1;
      // Unread first
      if (a.unread_count > 0 !== b.unread_count > 0)
        return a.unread_count > 0 ? -1 : 1;
      // Then by last message time
      const aTime = a.last_message
        ? new Date(a.last_message.created_at).getTime()
        : 0;
      const bTime = b.last_message
        ? new Date(b.last_message.created_at).getTime()
        : 0;
      return bTime - aTime;
    });
  }, [conversations]);

  /* ---- Check for extend redirect ---- */
  useEffect(() => {
    const extendedId = searchParams.get("extended");
    if (extendedId) {
      toast("Conversation extended! You have 7 more days.", "success");
      setActiveConvId(extendedId);
      window.history.replaceState({}, "", "/dashboard/messages");
    }
  }, [searchParams, toast]);

  /* ---- Load user ---- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  /* ---- Load conversations ---- */
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /* ---- Realtime subscription for new messages ---- */
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message & {
            conversation_id: string;
          };

          // If this message is in the active thread and not from us, add it
          if (
            newMsg.conversation_id === activeConvId &&
            newMsg.sender_id !== userId
          ) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            // Mark as read
            fetch(`/api/messages/${newMsg.conversation_id}/read`, {
              method: "POST",
            });
          }

          // Update conversation list
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== newMsg.conversation_id) return c;
              return {
                ...c,
                last_message: {
                  content: newMsg.content,
                  sender_id: newMsg.sender_id,
                  created_at: newMsg.created_at,
                },
                unread_count:
                  newMsg.sender_id !== userId &&
                  newMsg.conversation_id !== activeConvId
                    ? c.unread_count + 1
                    : c.unread_count,
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activeConvId, supabase]);

  /* ---- Load thread ---- */
  const loadThread = useCallback(
    async (convId: string) => {
      setThreadLoading(true);
      try {
        const res = await fetch(`/api/messages/${convId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
          setConvDetail(data.conversation);
        }
      } catch {
        toast("Failed to load messages", "error");
      }
      setThreadLoading(false);
    },
    [toast]
  );

  /* ---- Mark as read ---- */
  const markRead = useCallback(async (convId: string) => {
    try {
      await fetch(`/api/messages/${convId}/read`, { method: "POST" });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      );
    } catch {
      // silent
    }
  }, []);

  /* ---- Open conversation ---- */
  const openConversation = useCallback(
    (convId: string) => {
      setActiveConvId(convId);
      setInput("");
      loadThread(convId);
      markRead(convId);
    },
    [loadThread, markRead]
  );

  /* ---- Auto-scroll ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---- Send message ---- */
  const sendMessage = async () => {
    if (!input.trim() || !activeConvId || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Optimistic
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender_id: userId || "",
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/messages/${activeConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast(err.error || "Failed to send", "error");
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      } else {
        const msg: Message = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? msg : m))
        );
        // Update last message in list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  last_message: {
                    content: msg.content,
                    sender_id: msg.sender_id,
                    created_at: msg.created_at,
                  },
                }
              : c
          )
        );
      }
    } catch {
      toast("Failed to send message", "error");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
    setSending(false);
    inputRef.current?.focus();
  };

  /* ---- Extend conversation ---- */
  const handleExtend = async (convId: string) => {
    setExtending(true);
    try {
      const res = await fetch(`/api/messages/${convId}/extend`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to extend", "error");
      } else if (data.type === "free") {
        toast("Conversation extended for 7 more days!", "success");
        loadConversations();
        if (activeConvId === convId) loadThread(convId);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast("Failed to extend conversation", "error");
    }
    setExtending(false);
  };

  /* ---- Back (mobile) ---- */
  const goBack = () => {
    setActiveConvId(null);
    setMessages([]);
    setConvDetail(null);
    loadConversations();
  };

  /* ---- Keyboard shortcut for send ---- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ---- Computed expiry for thread ---- */
  const threadExpiry = convDetail
    ? expiryLabel(convDetail.expires_at, convDetail.status === "expired")
    : null;
  const threadExpiringSoon =
    convDetail &&
    convDetail.status !== "expired" &&
    daysUntil(convDetail.expires_at) < 1;
  const threadExpired = convDetail?.status === "expired";

  const charsLeft = MAX_CHARS - input.length;

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ---- Empty state ---- */
  if (conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-2">
            Messages
          </h1>
          <p className="text-stone">
            Chat with your matches after connecting at events.
          </p>
        </div>
        <div className="bg-[#1A1A1D]/80 backdrop-blur-sm rounded-2xl p-10 border border-white/10 text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="font-serif text-xl font-semibold text-champagne mb-2">
            No conversations yet
          </h2>
          <p className="text-stone text-sm max-w-sm mx-auto mb-6">
            Attend events and use Double Take to connect. When you match with
            someone, a 7-day conversation window opens here.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Browse Events
          </a>
        </div>
      </motion.div>
    );
  }

  /* ---- Desktop: side-by-side  |  Mobile: list OR thread ---- */
  return (
    <>
      {/* Mobile-only: show header only when on list view */}
      <div className={`mb-6 ${activeConvId ? "hidden md:block" : ""}`}>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-1">
          Messages
        </h1>
        <p className="text-stone text-sm">
          {conversations.filter((c) => c.unread_count > 0).length > 0
            ? `${conversations.filter((c) => c.unread_count > 0).length} unread conversation${conversations.filter((c) => c.unread_count > 0).length > 1 ? "s" : ""}`
            : "Chat with your matches after connecting at events."}
        </p>
      </div>

      <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#1A1A1D]/80 backdrop-blur-sm">
        {/* ---------- LEFT: Conversation List ---------- */}
        <div
          className={`w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-white/[0.08] flex flex-col ${
            activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* List header */}
          <div className="px-5 py-4 border-b border-white/[0.08]">
            <h2 className="font-serif text-lg font-semibold text-champagne">
              Conversations
            </h2>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {sortedConversations.map((conv) => {
              const expiry = expiryLabel(conv.expires_at, conv.is_expired);
              const isActive = conv.id === activeConvId;
              const hasUnread = conv.unread_count > 0;

              return (
                <motion.button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-5 py-4 border-b border-white/[0.04] transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gold/[0.08]"
                      : "hover:bg-white/[0.04]"
                  } ${conv.is_expired ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with unread dot */}
                    <div className="relative">
                      <Avatar person={conv.other_person} />
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gold border-2 border-[#1A1A1D]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className={`text-sm truncate ${
                            hasUnread
                              ? "font-bold text-champagne"
                              : "font-semibold text-champagne"
                          }`}
                        >
                          {conv.other_person?.first_name ?? "Someone"}
                        </span>
                        {conv.last_message && (
                          <span className="text-[11px] text-stone flex-shrink-0">
                            {timeAgo(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gold/60 mb-1 truncate">
                        {conv.event_name}
                      </p>

                      {conv.last_message ? (
                        <p
                          className={`text-sm truncate ${
                            hasUnread
                              ? "text-champagne/90 font-medium"
                              : "text-stone"
                          }`}
                        >
                          {conv.last_message.sender_id === userId
                            ? "You: "
                            : ""}
                          {conv.last_message.content}
                        </p>
                      ) : (
                        <p className="text-sm text-stone/40 italic">
                          Say hello...
                        </p>
                      )}

                      {/* Expiry bar + label */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1">
                          <ExpiryBar
                            expiresAt={conv.expires_at}
                            isExpired={conv.is_expired}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-medium ${expiry.color} flex-shrink-0`}
                        >
                          {expiry.text}
                        </span>
                        {conv.is_expired && !conv.extended && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtend(conv.id);
                            }}
                            disabled={extending}
                            className="text-[10px] font-semibold text-gold hover:text-champagne transition-colors flex-shrink-0"
                          >
                            Extend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ---------- RIGHT: Thread ---------- */}
        <div
          className={`flex-1 flex flex-col bg-[#141416] ${
            activeConvId ? "flex" : "hidden md:flex"
          }`}
        >
          <AnimatePresence mode="wait">
            {!activeConvId ? (
              /* No conversation selected (desktop placeholder) */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center px-6">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-white/[0.03] flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-stone/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-stone/60 text-sm">
                    Select a conversation to start chatting
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeConvId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0"
              >
                {/* Thread header */}
                <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-3 bg-[#1A1A1D]/50">
                  {/* Back button (mobile) */}
                  <button
                    onClick={goBack}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5 text-champagne"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <Avatar person={activeConv?.other_person} size="sm" />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-champagne text-sm truncate">
                      {activeConv?.other_person?.first_name ?? "Someone"}
                    </p>
                    <p className="text-[11px] text-gold/60 truncate">
                      {activeConv?.event_name}
                    </p>
                  </div>

                  {threadExpiry && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[11px] font-medium ${threadExpiry.color}`}
                      >
                        {threadExpiry.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expiry warning banner */}
                <AnimatePresence>
                  {(threadExpiringSoon || threadExpired) &&
                    !convDetail?.extended && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`overflow-hidden ${
                          threadExpired ? "bg-red-500/10" : "bg-gold/10"
                        }`}
                      >
                        <div className="px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg
                              className={`w-4 h-4 flex-shrink-0 ${
                                threadExpired ? "text-red-400" : "text-gold"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p
                              className={`text-xs font-medium ${
                                threadExpired ? "text-red-400" : "text-gold"
                              }`}
                            >
                              {threadExpired
                                ? "This conversation has expired."
                                : "Less than 24 hours left!"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleExtend(activeConvId!)}
                            disabled={extending}
                            className="text-xs font-semibold px-3 py-1 rounded-full bg-gold/20 text-gold hover:bg-gold/30 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {extending ? "..." : "Extend +7d"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages area */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
                >
                  {threadLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                        <svg
                          className="w-7 h-7 text-gold"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                      </div>
                      <p className="text-champagne text-sm font-medium mb-1">
                        Start the conversation
                      </p>
                      <p className="text-stone/60 text-xs text-center max-w-[260px]">
                        You matched at{" "}
                        <span className="text-gold/70">
                          {activeConv?.event_name}
                        </span>
                        . Break the ice -- what stood out to you?
                      </p>
                    </div>
                  ) : (
                    <>
                      {groupedMessages.map((group) => (
                        <div key={group.date} className="mb-1">
                          {/* Date separator */}
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-white/[0.06]" />
                            <span className="text-[10px] uppercase tracking-wider text-stone/40 font-medium">
                              {formatDateHeading(group.date)}
                            </span>
                            <div className="flex-1 h-px bg-white/[0.06]" />
                          </div>

                          {/* Messages in this date group */}
                          <div className="space-y-2">
                            {group.messages.map((msg, idx) => {
                              const isMine = msg.sender_id === userId;
                              const isTemp = msg.id.startsWith("temp-");
                              // Show avatar for first message or when sender changes
                              const prevMsg =
                                idx > 0 ? group.messages[idx - 1] : null;
                              const showAvatar =
                                !isMine &&
                                (!prevMsg ||
                                  prevMsg.sender_id !== msg.sender_id);

                              return (
                                <motion.div
                                  key={msg.id}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{
                                    opacity: isTemp ? 0.7 : 1,
                                    y: 0,
                                  }}
                                  transition={{ duration: 0.15 }}
                                  className={`flex ${
                                    isMine ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  {/* Other person's avatar on first of group */}
                                  {!isMine && (
                                    <div className="w-7 mr-2 flex-shrink-0">
                                      {showAvatar && (
                                        <Avatar
                                          person={activeConv?.other_person}
                                          size="sm"
                                        />
                                      )}
                                    </div>
                                  )}

                                  <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                      isMine
                                        ? "bg-gold/15 text-champagne rounded-br-md"
                                        : "bg-white/[0.06] text-[#E0DCD7] rounded-bl-md"
                                    }`}
                                  >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                      {msg.content}
                                    </p>
                                    <p
                                      className={`text-[10px] mt-1 ${
                                        isMine
                                          ? "text-gold/40 text-right"
                                          : "text-stone/40"
                                      }`}
                                    >
                                      {formatTimestamp(msg.created_at)}
                                    </p>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input area */}
                <div className="px-4 py-3 border-t border-white/[0.08] bg-[#1A1A1D]/50">
                  {threadExpired && !convDetail?.extended ? (
                    <div className="text-center py-3">
                      <p className="text-stone text-xs mb-3">
                        This conversation has expired. Extend it to keep
                        chatting.
                      </p>
                      <button
                        onClick={() => handleExtend(activeConvId!)}
                        disabled={extending}
                        className="px-6 py-2.5 rounded-full bg-gold text-black text-sm font-semibold hover:bg-champagne transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {extending
                          ? "Extending..."
                          : "Extend Conversation (+7 days)"}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-end gap-2">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => {
                            if (e.target.value.length <= MAX_CHARS) {
                              setInput(e.target.value);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message..."
                          rows={1}
                          className="flex-1 resize-none rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2.5 text-sm text-champagne placeholder:text-stone/40 focus:outline-none focus:border-gold/30 focus:bg-white/[0.07] transition-all"
                          style={{ maxHeight: 120 }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height =
                              Math.min(target.scrollHeight, 120) + "px";
                          }}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!input.trim() || sending}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold text-black hover:bg-champagne transition-colors disabled:opacity-20 disabled:hover:bg-gold flex-shrink-0 cursor-pointer"
                        >
                          {sending ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94l18-8a.75.75 0 000-1.38l-18-8z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {/* Character count (only show when near limit) */}
                      {input.length > MAX_CHARS * 0.8 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-[10px] mt-1 text-right ${
                            charsLeft < 100
                              ? "text-red-400"
                              : "text-stone/40"
                          }`}
                        >
                          {charsLeft} characters remaining
                        </motion.p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
