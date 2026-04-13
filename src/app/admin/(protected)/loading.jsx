export default function ProtectedAdminLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="h-36 animate-pulse rounded-xl border border-gray-200 bg-white" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-52 animate-pulse rounded-xl border border-gray-200 bg-white" />
        <div className="h-52 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    </div>
  );
}
