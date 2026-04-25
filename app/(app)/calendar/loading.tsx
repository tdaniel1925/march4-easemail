export default function CalendarLoading() {
  return (
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
  );
}
