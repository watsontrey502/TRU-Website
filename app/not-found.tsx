import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-md">
        <p className="text-gold text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-6">
          Page not found
        </p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
          404
        </h1>
        <p className="text-white/40 text-base md:text-lg mb-10">
          This page doesn&apos;t exist &mdash; but great nights out do.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-shimmer inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-gold to-[#b8935e] hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(200,169,126,0.25)]"
          >
            Back to Home
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white/80 text-sm font-medium bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] transition-colors"
          >
            View Events
          </Link>
        </div>
      </div>
    </div>
  );
}
