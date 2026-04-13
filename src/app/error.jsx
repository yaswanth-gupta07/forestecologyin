"use client";

export default function GlobalError({ error, reset }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#081C15] px-4 text-[#E8F8EE]">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#123326]/40 p-6">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-[#C8E9D7]">
          {error?.message || "An unexpected production error occurred."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg border border-[#63D3A6] px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
