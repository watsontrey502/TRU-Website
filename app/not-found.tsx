import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-dark mb-3">
          404
        </h1>
        <p className="text-muted text-lg mb-8">
          This page doesn&apos;t exist &mdash; but great nights out do.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-forest text-white font-semibold hover:bg-forest-dark transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-forest/20 text-forest font-semibold hover:bg-forest/5 transition-colors"
          >
            View Events
          </Link>
        </div>
      </div>
    </div>
  );
}
