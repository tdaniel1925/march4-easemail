"use client";

import { useEffect } from "react";

const SHORTCUTS: { key: string; description: string }[] = [
  { key: "j / ↓", description: "Select next email" },
  { key: "k / ↑", description: "Select previous email" },
  { key: "o / Enter", description: "Open selected email" },
  { key: "e", description: "Archive selected email" },
  { key: "#", description: "Delete selected email" },
  { key: "r", description: "Reply to selected" },
  { key: "a", description: "Reply all" },
  { key: "f", description: "Forward selected" },
  { key: "c", description: "Compose new email" },
  { key: "/", description: "Focus search" },
  { key: "u", description: "Mark selected unread" },
  { key: "s", description: "Star / unstar selected" },
  { key: "Esc", description: "Close modals / go back" },
  { key: "?", description: "Show this help" },
];

export default function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-xl w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: "rgb(27 29 29)" }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] hover:bg-neutral-100 transition-colors"
            style={{ color: "rgb(155 155 155)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center gap-3 py-1.5">
              <kbd
                className="flex-shrink-0 px-2 py-0.5 rounded-[6px] text-xs font-semibold font-mono border"
                style={{
                  backgroundColor: "rgb(245 245 245)",
                  borderColor: "rgb(212 212 212)",
                  color: "rgb(58 58 58)",
                  minWidth: 56,
                  textAlign: "center",
                }}
              >
                {key}
              </kbd>
              <span className="text-sm" style={{ color: "rgb(82 82 82)" }}>
                {description}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-center" style={{ color: "rgb(155 155 155)" }}>
          Shortcuts are disabled when typing in inputs
        </p>
      </div>
    </div>
  );
}
