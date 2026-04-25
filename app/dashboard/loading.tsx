export default function DashboardLoading() {
  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <div className="w-[260px] flex-shrink-0 border-r border-neutral-200 bg-white">
        <div className="p-4 space-y-3 animate-pulse">
          <div className="h-10 bg-neutral-100 rounded-[10px]" />
          <div className="space-y-1 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 bg-neutral-50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
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
    </div>
  );
}
