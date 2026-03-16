import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="text-white"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-sans text-2xl font-extrabold text-white tracking-tighter hover:opacity-80 transition-opacity"
            >
              TR&Uuml;
            </Link>
            <p className="mt-2 text-stone text-sm">The Offline Era</p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <Link
                href="/about"
                className="text-white/60 hover:text-gold text-sm transition-colors"
              >
                About
              </Link>
              <Link
                href="/apply"
                className="text-white/60 hover:text-gold text-sm transition-colors"
              >
                Apply
              </Link>
              <Link
                href="/faq"
                className="text-white/60 hover:text-gold text-sm transition-colors"
              >
                FAQ
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/privacy"
                className="text-white/60 hover:text-gold text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-white/60 hover:text-gold text-sm transition-colors"
              >
                Terms
              </Link>
              <a
                href="https://instagram.com/trudatingnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-gold text-sm transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Social icon */}
          <div className="flex flex-col items-start md:items-end">
            <a
              href="https://instagram.com/trudatingnashville"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/40 transition-all"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; 2026 TR&Uuml; Dating Nashville
          </p>
          <p className="text-white/30 text-xs">
            Nashville, Tennessee
          </p>
        </div>
      </div>
    </footer>
  );
}
