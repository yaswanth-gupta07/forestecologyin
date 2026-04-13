"use client";

export default function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#081C15] px-4">
      <div className="w-full max-w-xl animate-pulse space-y-4 rounded-2xl border border-white/10 bg-[#123326]/40 p-6">
        <div className="h-6 w-1/2 rounded bg-white/15" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-5/6 rounded bg-white/10" />
      </div>
    </div>
  );
}
