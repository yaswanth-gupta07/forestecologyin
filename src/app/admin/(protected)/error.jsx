"use client";

export default function AdminProtectedError({ error, reset }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <p className="text-sm font-medium">Admin route error: {error?.message || "Unknown error"}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-3 rounded-lg border border-red-300 px-3 py-1 text-xs"
      >
        Retry
      </button>
    </div>
  );
}
