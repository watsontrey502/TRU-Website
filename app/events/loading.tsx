import { Skeleton } from "@/components/Skeleton";

export default function EventsLoading() {
  return (
    <>
      {/* Hero placeholder */}
      <section className="bg-black pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center">
          <Skeleton className="h-12 w-64 mb-6 !bg-white/10" />
          <Skeleton className="h-5 w-96 max-w-full !bg-white/10" />
        </div>
      </section>

      {/* Cards placeholder */}
      <section className="bg-cream py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          {/* Filter tabs */}
          <div className="flex items-center justify-center gap-2 mb-14">
            <Skeleton className="h-10 w-16 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>

          {/* Event cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-40" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
