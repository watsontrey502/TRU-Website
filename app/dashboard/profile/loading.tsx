import { Skeleton } from "@/components/Skeleton";

export default function ProfileLoading() {
  return (
    <>
      <Skeleton className="h-9 w-36 mb-2" />
      <Skeleton className="h-4 w-52 mb-10" />

      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-6 max-w-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3.5 w-24 mb-2" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </>
  );
}
