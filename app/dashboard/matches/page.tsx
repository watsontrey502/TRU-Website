"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MatchDisplay {
  event_id: string;
  event_name: string;
  matched_first_name: string;
  matched_instagram: string;
  matched_at: string;
  conversation_id?: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/matches");
        if (res.ok) {
          const { matches: data } = await res.json();
          setMatches(data ?? []);
        }
      } catch {
        // silent
      }
      setLoading(false);
    }
    load();
  }, []);

  // Group by event
  const grouped = matches.reduce<Record<string, MatchDisplay[]>>((acc, m) => {
    const key = m.event_name || m.event_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <p className="text-gold text-[10px] font-medium tracking-[0.25em] uppercase mb-3">
          Double Take
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
          Your Matches
        </h1>
        <p className="text-white/40 text-sm">
          When both people select each other after an event, it&apos;s a match. Start a conversation before it expires.
        </p>
      </div>

      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-12 text-center"
        >
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="font-serif text-xl font-bold text-white mb-2">No matches yet</h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
            Attend events and use Double Take to start matching. When someone you picked also picks you, you&apos;ll see them here.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-colors"
          >
            Browse Events
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([eventName, eventMatches], gi) => (
            <motion.div
              key={eventName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
            >
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {eventName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventMatches.map((match, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: gi * 0.1 + i * 0.05 }}
                    className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 hover:border-gold/20 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold font-serif font-bold text-lg">
                          {match.matched_first_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white">{match.matched_first_name}</h3>
                        {match.matched_instagram && (
                          <p className="text-gold/60 text-sm truncate">@{match.matched_instagram.replace("@", "")}</p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-gold/10 text-gold border border-gold/20 whitespace-nowrap">
                        ✦ Mutual
                      </span>
                    </div>

                    {match.conversation_id ? (
                      <Link
                        href={`/dashboard/messages?conversation=${match.conversation_id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message
                      </Link>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Conversation starting soon
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
