export default function DashboardLoading() {
  return (
    <div className="flex-1 bg-neutral-50 p-6 animate-pulse">
      <div className="h-6 bg-neutral-200 rounded w-40 mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-xl border border-neutral-200" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-white rounded-xl border border-neutral-200" />
        <div className="h-64 bg-white rounded-xl border border-neutral-200" />
      </div>
    </div>
  );
}
