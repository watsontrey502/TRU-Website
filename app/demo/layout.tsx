"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const demoNavItems = [
  { href: "/demo/dashboard", label: "Home", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { href: "/demo/matches", label: "Matches", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
  { href: "/demo/dashboard", label: "Profile", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

// Pages that show the bottom nav (the "in-app" pages)
const BOTTOM_NAV_PAGES = ["/demo/dashboard", "/demo/event", "/demo/double-take", "/demo/matches"];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomNav = BOTTOM_NAV_PAGES.includes(pathname);

  return (
    <div className="fixed inset-0 z-[60] overflow-auto bg-cream">
      {/* Floating DEMO MODE badge */}
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[70] bg-copper/90 text-white text-xs font-sans font-medium px-4 py-1.5 rounded-full tracking-wide shadow-lg">
        DEMO MODE
      </div>

      {/* Exit demo link */}
      <Link
        href="/"
        className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-[70] text-muted hover:text-dark text-xs font-sans font-medium px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 transition-colors"
      >
        Exit Demo
      </Link>

      {children}

      {/* Persistent bottom nav for in-app demo pages */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white border-t border-gray-200 bottom-nav-safe">
          <div className="flex justify-around py-2">
            {demoNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
                    active ? "text-forest" : "text-muted"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
