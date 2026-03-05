import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="text-center max-w-md px-6">
        <div className="text-7xl font-bold text-white/10 mb-4">404</div>
        <h1 className="text-xl font-semibold text-white mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/inbox"
          className="px-4 py-2 bg-[rgb(138,9,9)] text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Go to inbox
        </Link>
      </div>
    </div>
  );
}
