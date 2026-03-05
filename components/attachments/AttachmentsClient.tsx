"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AttachmentItem } from "@/app/attachments/page";

type FileType = "image" | "pdf" | "doc" | "sheet" | "other";
type FilterTab = "all" | "documents" | "images" | "spreadsheets" | "other";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(contentType: string, name: string): FileType {
  if (contentType.startsWith("image/")) return "image";
  if (contentType === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (contentType.includes("spreadsheet") || name.match(/\.(xlsx|xls|csv)$/i)) return "sheet";
  if (contentType.includes("document") || contentType.includes("word") || name.match(/\.(docx|doc|txt)$/i)) return "doc";
  return "other";
}

function totalBytes(items: AttachmentItem[]): number {
  return items.reduce((sum, a) => sum + a.size, 0);
}

function FileIcon({ type }: { type: FileType }) {
  if (type === "image") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "rgb(59 130 246)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type === "pdf") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "rgb(239 68 68)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (type === "doc") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "rgb(34 197 94)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (type === "sheet") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "rgb(34 197 94)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "rgb(115 115 115)" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "documents", label: "Documents" },
  { key: "images", label: "Images" },
  { key: "spreadsheets", label: "Spreadsheets" },
  { key: "other", label: "Other" },
];

function matchesTab(item: AttachmentItem, tab: FilterTab): boolean {
  if (tab === "all") return true;
  const type = getFileType(item.contentType, item.name);
  if (tab === "images") return type === "image";
  if (tab === "documents") return type === "doc" || type === "pdf";
  if (tab === "spreadsheets") return type === "sheet";
  if (tab === "other") return type === "other";
  return true;
}

export default function AttachmentsClient({ attachments }: { attachments: AttachmentItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const filtered = attachments.filter((item) => {
    const tabMatch = matchesTab(item, activeTab);
    if (!tabMatch) return false;
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.senderName.toLowerCase().includes(q) ||
      item.senderAddress.toLowerCase().includes(q)
    );
  });

  const imageCount = attachments.filter((a) => getFileType(a.contentType, a.name) === "image").length;
  const docCount = attachments.filter((a) => {
    const t = getFileType(a.contentType, a.name);
    return t === "doc" || t === "pdf";
  }).length;
  const totalSize = totalBytes(attachments);

  return (
    <div
      className="flex flex-col flex-1"
      style={{ height: "100vh", overflow: "hidden", backgroundColor: "rgb(247 247 247)" }}
    >
      <div
        className="flex-shrink-0 px-8 pt-7 pb-5 border-b border-neutral-200"
        style={{ backgroundColor: "white" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold" style={{ color: "rgb(27 29 29)" }}>
            All Attachments
          </h1>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-5">
          <StatCard label="Total Files" value={String(attachments.length)} icon="files" />
          <StatCard label="Images" value={String(imageCount)} icon="image" />
          <StatCard label="Documents" value={String(docCount)} icon="doc" />
          <StatCard label="Total Size" value={formatSize(totalSize)} icon="size" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === tab.key ? "rgb(138 9 9)" : "transparent",
                  color: activeTab === tab.key ? "white" : "rgb(82 82 82)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: "rgb(155 155 155)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or sender…"
              className="w-full pl-9 py-2 rounded-[10px] text-sm placeholder-neutral-400 focus:outline-none transition-colors border"
              style={{
                paddingRight: search ? "2rem" : "0.75rem",
                backgroundColor: "rgb(245 245 245)",
                borderColor: "transparent",
                color: "rgb(58 58 58)",
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.borderColor = "rgb(218 100 100)";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "rgb(245 245 245)";
                e.target.style.borderColor = "transparent";
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                style={{ color: "rgb(155 155 155)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-[14px] py-20"
            style={{ backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              style={{ color: "rgb(200 200 200)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "rgb(115 115 115)" }}>
              {debouncedSearch
                ? `No attachments matching "${debouncedSearch}"`
                : "No attachments found"}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgb(155 155 155)" }}>
              Attachments from emails with files will appear here.
            </p>
          </div>
        ) : (
          <div
            className="rounded-[14px] overflow-hidden"
            style={{ backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid rgb(229 229 229)" }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(115 115 115)" }}>
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(115 115 115)" }}>
                    Sender
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(115 115 115)" }}>
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(115 115 115)" }}>
                    Size
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(115 115 115)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <AttachmentRow
                    key={`${item.messageId}-${item.id}`}
                    item={item}
                    isLast={idx === filtered.length - 1}
                    onRowClick={() => router.push(`/inbox/${item.messageId}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AttachmentRow({
  item,
  isLast,
  onRowClick,
}: {
  item: AttachmentItem;
  isLast: boolean;
  onRowClick: () => void;
}) {
  const type = getFileType(item.contentType, item.name);

  return (
    <tr
      onClick={onRowClick}
      className="cursor-pointer transition-colors hover:bg-neutral-50"
      style={{ borderBottom: isLast ? "none" : "1px solid rgb(245 245 245)" }}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileIcon type={type} />
          <span
            className="text-sm font-medium truncate max-w-xs"
            style={{ color: "rgb(27 29 29)" }}
            title={item.name}
          >
            {item.name}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="min-w-0">
          <p className="text-sm truncate" style={{ color: "rgb(58 58 58)" }}>
            {item.senderName}
          </p>
          <p className="text-xs truncate" style={{ color: "rgb(155 155 155)" }}>
            {item.senderAddress}
          </p>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm whitespace-nowrap" style={{ color: "rgb(115 115 115)" }}>
          {formatDate(item.receivedDateTime)}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm" style={{ color: "rgb(115 115 115)" }}>
          {formatSize(item.size)}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors"
          style={{
            backgroundColor: "rgb(253 235 235)",
            color: "rgb(138 9 9)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgb(138 9 9)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgb(253 235 235)";
            e.currentTarget.style.color = "rgb(138 9 9)";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View email
        </button>
      </td>
    </tr>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div
      className="rounded-[12px] px-4 py-4"
      style={{ backgroundColor: "rgb(249 249 249)", border: "1px solid rgb(235 235 235)" }}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <StatIcon icon={icon} />
        <span className="text-xs font-medium" style={{ color: "rgb(115 115 115)" }}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-semibold" style={{ color: "rgb(27 29 29)" }}>
        {value}
      </p>
    </div>
  );
}

function StatIcon({ icon }: { icon: string }) {
  if (icon === "files") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(138 9 9)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    );
  }
  if (icon === "image") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(59 130 246)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (icon === "doc") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(34 197 94)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(138 9 9)" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}
