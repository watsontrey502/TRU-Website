"use client";

import { useEffect, useState } from "react";

interface MatchDisplay {
  event_id: string;
  event_name: string;
  matched_first_name: string;
  matched_instagram: string;
  matched_at: string;
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
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-dark mb-2">
          Your Matches
        </h1>
        <p className="text-muted">
          Mutual connections from your events. When both people select each other, it&apos;s a match.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-copper/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="font-serif text-xl font-semibold text-dark mb-2">No matches yet</h2>
          <p className="text-muted text-sm max-w-sm mx-auto">
            Attend events and use Double Take to start matching. When someone you picked also picks you, you&apos;ll see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([eventName, eventMatches]) => (
            <div key={eventName}>
              <h2 className="font-serif text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {eventName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventMatches.map((match, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[var(--shadow-card)]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-copper/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-copper font-serif font-bold text-lg">
                          {match.matched_first_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-dark">{match.matched_first_name}</h3>
                        {match.matched_instagram && (
                          <p className="text-copper text-sm truncate">@{match.matched_instagram.replace("@", "")}</p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-forest/10 text-forest whitespace-nowrap">
                        It&apos;s mutual!
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
