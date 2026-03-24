"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  const navBg = scrolled
    ? "bg-[rgba(12,12,13,0.85)] backdrop-blur-md"
    : "bg-transparent";

  const publicLinks = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
  ];

  const authedLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/messages", label: "Messages" },
    { href: "/events", label: "Events" },
  ];

  const links = user ? authedLinks : publicLinks;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              className="font-sans text-2xl font-extrabold text-white tracking-tighter hover:opacity-80 transition-opacity"
            >
              TR&Uuml;
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium font-sans transition-colors ${
                    pathname === link.href
                      ? "text-white"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                      <span className="text-gold text-xs font-semibold">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#1a1a1b] backdrop-blur-xl shadow-xl overflow-hidden"
                      >
                        <Link
                          href="/dashboard/profile"
                          className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          My Account
                        </Link>
                        <Link
                          href="/dashboard/messages"
                          className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Messages
                        </Link>
                        <Link
                          href="/dashboard/messages"
                          className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Matches
                        </Link>
                        <div className="border-t border-white/10" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/apply"
                  className="text-white px-6 py-2.5 rounded-full text-sm font-medium tracking-wide hover:opacity-90 transition-all shadow-[0_0_20px_rgba(200,169,126,0.3)]"
                  style={{
                    background: "linear-gradient(135deg, #C8A97E, #b8935e)",
                  }}
                >
                  Apply
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5 cursor-pointer"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={
                  mobileOpen
                    ? { rotate: 45, y: 4 }
                    : { rotate: 0, y: 0 }
                }
                className="block w-6 h-0.5 bg-white origin-center"
                transition={{ duration: 0.3 }}
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-6 h-0.5 bg-white"
                transition={{ duration: 0.2 }}
              />
              <motion.span
                animate={
                  mobileOpen
                    ? { rotate: -45, y: -4 }
                    : { rotate: 0, y: 0 }
                }
                className="block w-6 h-0.5 bg-white origin-center"
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={`text-2xl font-sans font-medium tracking-wide transition-colors ${
                      pathname === link.href
                        ? "text-gold"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + links.length * 0.1 }}
                  >
                    <Link
                      href="/dashboard/profile"
                      className="text-2xl font-sans font-medium tracking-wide text-white/80 hover:text-white transition-colors"
                    >
                      My Account
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + links.length * 0.1 }}
                  >
                    <button
                      onClick={handleSignOut}
                      className="text-2xl font-sans font-medium tracking-wide text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/apply"
                    className="mt-4 text-white px-10 py-4 rounded-full text-lg font-medium tracking-wide hover:opacity-90 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #C8A97E, #b8935e)",
                    }}
                  >
                    Apply
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
