export default function InboxLoading() {
  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-24 mb-2" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 bg-neutral-100 rounded-full w-16" />
          ))}
        </div>
      </div>
      {/* Email rows */}
      <div className="divide-y divide-neutral-50">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-neutral-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 py-0.5">
              <div className="h-3.5 bg-neutral-200 rounded" style={{ width: `${35 + (i % 3) * 15}%` }} />
              <div className="h-3 bg-neutral-100 rounded" style={{ width: `${55 + (i % 4) * 10}%` }} />
              <div className="h-2.5 bg-neutral-100 rounded" style={{ width: `${30 + (i % 5) * 8}%` }} />
            </div>
            <div className="h-2.5 bg-neutral-100 rounded w-10 flex-shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
