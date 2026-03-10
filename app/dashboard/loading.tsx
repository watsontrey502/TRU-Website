import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <>
      {/* Welcome */}
      <div className="mb-10">
        <Skeleton className="h-9 w-64 mb-3" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Upcoming Events */}
      <section className="mb-12">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>

      {/* Available Events */}
      <section className="mb-12">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </>
  );
}
