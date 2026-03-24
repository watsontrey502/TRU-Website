"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

function daysUntil(dateStr: string): number {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  return (then - now) / (1000 * 60 * 60 * 24);
}

function expiryLabel(dateStr: string, isExpired: boolean): { text: string; color: string } {
  if (isExpired) return { text: "Expired", color: "text-red-400" };
  const days = daysUntil(dateStr);
  if (days > 3) return { text: `Expires in ${Math.ceil(days)}d`, color: "text-emerald-400" };
  if (days >= 1) return { text: `Expires in ${Math.ceil(days)}d`, color: "text-yellow-400" };
  const hours = Math.max(1, Math.ceil(days * 24));
  return { text: `Expires in ${hours}h`, color: "text-red-400" };
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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

  // Active conversation from list
  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  /* ---- Check for extend redirect ---- */
  useEffect(() => {
    const extendedId = searchParams.get("extended");
    if (extendedId) {
      toast("Conversation extended! You have 7 more days.", "success");
      setActiveConvId(extendedId);
      // Clean URL
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

  /* ---- Load thread ---- */
  const loadThread = useCallback(async (convId: string) => {
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
  }, [toast]);

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
    !convDetail.extended &&
    daysUntil(convDetail.expires_at) < 3;
  const threadExpired = convDetail?.status === "expired";

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
      <>
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-2">
            Messages
          </h1>
          <p className="text-stone">
            Chat with your matches after connecting at events.
          </p>
        </div>
        <div className="bg-[#1A1A1D] rounded-2xl p-10 border border-white/10 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="font-serif text-xl font-semibold text-champagne mb-2">
            No matches yet
          </h2>
          <p className="text-stone text-sm max-w-sm mx-auto">
            Attend events and use Double Take to connect! When you match with someone, your conversation will appear here.
          </p>
        </div>
      </>
    );
  }

  /* ---- Desktop: side-by-side  |  Mobile: list OR thread ---- */
  return (
    <>
      {/* Mobile-only: show header only when on list view */}
      <div className={`mb-6 ${activeConvId ? "hidden md:block" : ""}`}>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-champagne mb-2">
          Messages
        </h1>
        <p className="text-stone">
          Chat with your matches after connecting at events.
        </p>
      </div>

      <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] rounded-2xl overflow-hidden border border-white/10 bg-[#1A1A1D]">
        {/* ---------- LEFT: Conversation List ---------- */}
        <div
          className={`w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-white/10 flex flex-col ${
            activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* List header */}
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="font-serif text-lg font-semibold text-champagne">
              Conversations
            </h2>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const expiry = expiryLabel(conv.expires_at, conv.is_expired);
              const isActive = conv.id === activeConvId;
              return (
                <motion.button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-5 py-4 border-b border-white/5 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  } ${conv.is_expired ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gold font-serif font-bold text-base">
                        {conv.other_person?.first_name?.[0] ?? "?"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-semibold text-champagne text-sm truncate">
                          {conv.other_person?.first_name ?? "Someone"}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {conv.unread_count > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold text-[10px] font-bold text-black">
                              {conv.unread_count > 9 ? "9+" : conv.unread_count}
                            </span>
                          )}
                          {conv.last_message && (
                            <span className="text-[11px] text-stone">
                              {timeAgo(conv.last_message.created_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gold/70 mb-1 truncate">
                        {conv.event_name}
                      </p>

                      {conv.last_message ? (
                        <p className="text-sm text-stone truncate">
                          {conv.last_message.sender_id === userId ? "You: " : ""}
                          {conv.last_message.content}
                        </p>
                      ) : (
                        <p className="text-sm text-stone/50 italic">
                          No messages yet
                        </p>
                      )}

                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`text-[10px] font-medium ${expiry.color}`}>
                          {expiry.text}
                        </span>
                        {conv.is_expired && !conv.extended && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtend(conv.id);
                            }}
                            disabled={extending}
                            className="text-[10px] font-medium text-gold hover:text-champagne transition-colors"
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
          className={`flex-1 flex flex-col ${
            activeConvId ? "flex" : "hidden md:flex"
          }`}
        >
          <AnimatePresence mode="wait">
            {!activeConvId ? (
              /* No conversation selected (desktop) */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center px-6">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-stone text-sm">
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
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                  {/* Back button (mobile) */}
                  <button
                    onClick={goBack}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-champagne" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-gold font-serif font-bold text-sm">
                      {activeConv?.other_person?.first_name?.[0] ?? "?"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-champagne text-sm truncate">
                      {activeConv?.other_person?.first_name ?? "Someone"}
                    </p>
                    <p className="text-[11px] text-gold/70 truncate">
                      {activeConv?.event_name}
                    </p>
                  </div>

                  {threadExpiry && (
                    <span className={`text-[11px] font-medium ${threadExpiry.color} flex-shrink-0`}>
                      {threadExpiry.text}
                    </span>
                  )}
                </div>

                {/* Extend banner */}
                {(threadExpiringSoon || threadExpired) && !convDetail?.extended && (
                  <div className={`px-4 py-2.5 flex items-center justify-between ${threadExpired ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                    <p className={`text-xs font-medium ${threadExpired ? "text-red-400" : "text-yellow-400"}`}>
                      {threadExpired
                        ? "This conversation has expired."
                        : "This conversation is expiring soon!"}
                    </p>
                    <button
                      onClick={() => handleExtend(activeConvId!)}
                      disabled={extending}
                      className="text-xs font-semibold text-gold hover:text-champagne transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {extending ? "Extending..." : "Extend (+7 days)"}
                    </button>
                  </div>
                )}

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {threadLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <p className="text-stone text-sm text-center">
                        No messages yet. Say hello!
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isMine = msg.sender_id === userId;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isMine
                                  ? "bg-gold/20 text-champagne rounded-br-md"
                                  : "bg-white/5 text-[#E0DCD7] rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                              <p
                                className={`text-[10px] mt-1 ${
                                  isMine ? "text-gold/50 text-right" : "text-stone/50"
                                }`}
                              >
                                {formatTimestamp(msg.created_at)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input area */}
                <div className="px-4 py-3 border-t border-white/10">
                  {threadExpired && !convDetail?.extended ? (
                    <div className="text-center py-2">
                      <p className="text-stone text-xs mb-2">
                        Extend this conversation to keep chatting.
                      </p>
                      <button
                        onClick={() => handleExtend(activeConvId!)}
                        disabled={extending}
                        className="px-5 py-2 rounded-full bg-gold text-black text-sm font-semibold hover:bg-champagne transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {extending ? "Extending..." : "Extend Conversation ($5)"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-champagne placeholder:text-stone/50 focus:outline-none focus:border-gold/40 transition-colors"
                        style={{ maxHeight: 120 }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height = Math.min(target.scrollHeight, 120) + "px";
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold text-black hover:bg-champagne transition-colors disabled:opacity-30 disabled:hover:bg-gold flex-shrink-0 cursor-pointer"
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                          </svg>
                        )}
                      </button>
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
