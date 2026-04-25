export default function AppLoading() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ height: "100vh" }}>
      <div className="flex flex-col items-center gap-3">
        <svg className="w-6 h-6 animate-spin" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    </div>
  );
}
