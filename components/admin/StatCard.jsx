"use client";

export default function StatCard({ icon: Icon, label, count, color = "forest" }) {
  const colorMap = {
    forest: "bg-forest-50 text-forest-700 border-forest-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const iconColorMap = {
    forest: "bg-forest-100 text-forest-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <div
      className={`rounded-xl border p-5 ${colorMap[color]} transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{label}</p>
          <p className="text-3xl font-bold mt-1">
            {count === null ? (
              <span className="inline-block w-10 h-8 bg-current/10 rounded animate-pulse" />
            ) : (
              count
            )}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
