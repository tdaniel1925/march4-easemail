export default function CalendarLoading() {
  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <div className="w-64 flex-shrink-0 border-r border-neutral-200 bg-white">
        <div className="p-4 space-y-3 animate-pulse">
          <div className="h-10 bg-neutral-100 rounded-[10px]" />
          <div className="space-y-1 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 bg-neutral-50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white animate-pulse">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-4">
          <div className="h-8 bg-neutral-200 rounded w-8" />
          <div className="h-5 bg-neutral-200 rounded w-48" />
          <div className="h-8 bg-neutral-200 rounded w-8" />
        </div>
        <div className="flex-1 p-4">
          <div className="grid grid-cols-7 gap-px bg-neutral-100 rounded-xl overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-white h-[600px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
