export default function AdminLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-7 w-52 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
