import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-serif text-3xl font-bold tracking-wider hover:text-copper-light transition-colors"
            >
              TR&Uuml;
            </Link>
            <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-xs">
              Curated dating events for Nashville singles who are done with
              swiping. Real people, real experiences.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium tracking-wide uppercase text-white/40 mb-4">
                Company
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/about"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/events"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/membership"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Membership
                </Link>
                <Link
                  href="/faq"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  FAQ
                </Link>
                <Link
                  href="/apply"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Apply
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium tracking-wide uppercase text-white/40 mb-4">
                Legal
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/privacy"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="mailto:hello@trudating.com"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="text-sm font-medium tracking-wide uppercase text-white/40 mb-4">
              Follow Us
            </h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/trudatingnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-copper transition-all"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@trudatingnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-copper transition-all"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.82a4.84 4.84 0 01-1-.13z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
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
