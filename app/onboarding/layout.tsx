import { Suspense } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0C0C0D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Suspense
          fallback={
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-[#C8A97E]/30 border-t-[#C8A97E] rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
}
