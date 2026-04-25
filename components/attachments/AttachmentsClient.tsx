"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AttachmentItem } from "@/app/(app)/attachments/page";

type FileType = "image" | "pdf" | "doc" | "sheet" | "other";
type FilterTab = "all" | "documents" | "images" | "spreadsheets" | "other";
type DirectionTab = "received" | "sent";
type SortField = "name" | "type" | "sender" | "subject" | "date" | "size";
type SortDirection = "asc" | "desc";

type ColumnKey = "checkbox" | "name" | "type" | "sender" | "subject" | "date" | "size" | "actions";

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
  sortable: boolean;
}

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

function getFileExtension(name: string): string {
  const match = name.match(/\.([^.]+)$/);
  return match ? match[1].toUpperCase() : "FILE";
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

export default function AttachmentsClient({
  attachments,
  receivedNextLink,
  sentNextLink,
  homeAccountId,
}: {
  attachments: AttachmentItem[];
  receivedNextLink: string | null;
  sentNextLink: string | null;
  homeAccountId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [directionTab, setDirectionTab] = useState<DirectionTab>("received");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<AttachmentItem[]>(attachments);
  const [receivedNextLinkState, setReceivedNextLink] = useState<string | null>(receivedNextLink);
  const [sentNextLinkState, setSentNextLink] = useState<string | null>(sentNextLink);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<AttachmentItem | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Default visible columns: name, type, date, actions (with preview)
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(["name", "type", "date", "actions"])
  );

  const allColumns: ColumnConfig[] = [
    { key: "checkbox", label: "Select", visible: visibleColumns.has("checkbox"), sortable: false },
    { key: "name", label: "File Name", visible: visibleColumns.has("name"), sortable: true },
    { key: "type", label: "Type", visible: visibleColumns.has("type"), sortable: true },
    { key: "sender", label: "Sender", visible: visibleColumns.has("sender"), sortable: true },
    { key: "subject", label: "Email Subject", visible: visibleColumns.has("subject"), sortable: true },
    { key: "date", label: "Date Received", visible: visibleColumns.has("date"), sortable: true },
    { key: "size", label: "Size", visible: visibleColumns.has("size"), sortable: true },
    { key: "actions", label: "Actions", visible: visibleColumns.has("actions"), sortable: false },
  ];

  function toggleColumn(key: ColumnKey) {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    }
    if (showColumnMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showColumnMenu]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(item => `${item.messageId}-${item.id}`)));
    }
  }

  const filtered = items.filter((item) => {
    // Filter by direction tab
    if (item.direction !== directionTab) return false;

    // Filter by file type tab
    const tabMatch = matchesTab(item, activeTab);
    if (!tabMatch) return false;

    // Filter by search
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.senderName.toLowerCase().includes(q) ||
      item.senderAddress.toLowerCase().includes(q) ||
      item.messageSubject.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "type":
        comparison = getFileExtension(a.name).localeCompare(getFileExtension(b.name));
        break;
      case "sender":
        comparison = a.senderName.localeCompare(b.senderName);
        break;
      case "subject":
        comparison = a.messageSubject.localeCompare(b.messageSubject);
        break;
      case "date":
        comparison = a.receivedDateTime.localeCompare(b.receivedDateTime);
        break;
      case "size":
        comparison = a.size - b.size;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const directionFiltered = items.filter((a) => a.direction === directionTab);
  const imageCount = directionFiltered.filter((a) => getFileType(a.contentType, a.name) === "image").length;
  const docCount = directionFiltered.filter((a) => {
    const t = getFileType(a.contentType, a.name);
    return t === "doc" || t === "pdf";
  }).length;
  const totalSize = totalBytes(directionFiltered);

  const currentNextLink = directionTab === "received" ? receivedNextLinkState : sentNextLinkState;

  async function loadMore() {
    if (!currentNextLink || loadingMore) return;
    setLoadingMore(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({
        nextLink: currentNextLink,
        homeAccountId,
        direction: directionTab,
      });
      const res = await fetch(`/api/attachments/paginate?${params}`);
      if (!res.ok) throw new Error("Failed to load more attachments");
      const data = await res.json();
      setItems(prev => [...prev, ...data.items]);
      if (directionTab === "received") {
        setReceivedNextLink(data.nextLink || null);
      } else {
        setSentNextLink(data.nextLink || null);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

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

        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setDirectionTab("received")}
            className="px-4 py-2 rounded-[10px] text-sm font-semibold transition-all"
            style={{
              backgroundColor: directionTab === "received" ? "rgb(138 9 9)" : "rgb(245 245 245)",
              color: directionTab === "received" ? "white" : "rgb(82 82 82)",
            }}
          >
            Received
          </button>
          <button
            onClick={() => setDirectionTab("sent")}
            className="px-4 py-2 rounded-[10px] text-sm font-semibold transition-all"
            style={{
              backgroundColor: directionTab === "sent" ? "rgb(138 9 9)" : "rgb(245 245 245)",
              color: directionTab === "sent" ? "white" : "rgb(82 82 82)",
            }}
          >
            Sent
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-5">
          <StatCard label="Total Files" value={String(directionFiltered.length)} icon="files" />
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

          <div className="flex items-center gap-2">
            <div className="relative" ref={columnMenuRef}>
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="px-3 py-2 rounded-[8px] text-sm font-medium transition-colors flex items-center gap-1.5"
                style={{ backgroundColor: "rgb(245 245 245)", color: "rgb(82 82 82)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(229 229 229)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Columns
              </button>

              {showColumnMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-[10px] shadow-lg z-10"
                  style={{ backgroundColor: "white", border: "1px solid rgb(229 229 229)" }}
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold uppercase tracking-wider px-2 py-1.5" style={{ color: "rgb(115 115 115)" }}>
                      Show/Hide Columns
                    </p>
                    {allColumns.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={col.visible}
                          onChange={() => toggleColumn(col.key)}
                          className="w-4 h-4 rounded cursor-pointer"
                          style={{ accentColor: "rgb(138 9 9)" }}
                        />
                        <span className="text-sm" style={{ color: "rgb(58 58 58)" }}>
                          {col.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
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
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {sorted.length === 0 ? (
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
            className="rounded-[14px]"
            style={{ backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ backgroundColor: "rgb(253 235 235)", borderColor: "rgb(229 229 229)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: "rgb(138 9 9)" }}>
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-xs px-2 py-1 rounded hover:bg-white/50 transition-colors"
                    style={{ color: "rgb(138 9 9)" }}
                  >
                    Clear
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const selectedItems = sorted.filter(item =>
                        selectedIds.has(`${item.messageId}-${item.id}`)
                      );
                      for (const item of selectedItems) {
                        try {
                          const url = `/api/mail/attachments/${encodeURIComponent(item.messageId)}/${encodeURIComponent(item.id)}?homeAccountId=${encodeURIComponent(item.homeAccountId)}`;
                          const res = await fetch(url);
                          if (!res.ok) throw new Error(`Download failed: ${res.status}`);
                          const blob = await res.blob();
                          const a = document.createElement("a");
                          a.href = URL.createObjectURL(blob);
                          a.download = item.name;
                          a.click();
                          URL.revokeObjectURL(a.href);
                          await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (err) {
                          console.error("[bulk-download]", err);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors"
                    style={{ backgroundColor: "rgb(138 9 9)", color: "white" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(115 7 7)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Selected ({selectedIds.size})
                  </button>
                </div>
              </div>
            )}
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr style={{ borderBottom: "1px solid rgb(229 229 229)" }}>
                  {visibleColumns.has("checkbox") && (
                    <th className="text-center px-3 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === sorted.length && sorted.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: "rgb(138 9 9)" }}
                      />
                    </th>
                  )}
                  {visibleColumns.has("name") && (
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                      style={{ color: sortField === "name" ? "rgb(138 9 9)" : "rgb(115 115 115)" }}
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1.5">
                        File Name
                        {sortField === "name" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: sortDirection === "asc" ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.has("type") && (
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                      style={{ color: sortField === "type" ? "rgb(138 9 9)" : "rgb(115 115 115)" }}
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center gap-1.5">
                        Type
                        {sortField === "type" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: sortDirection === "asc" ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.has("sender") && (
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                      style={{ color: sortField === "sender" ? "rgb(138 9 9)" : "rgb(115 115 115)" }}
                      onClick={() => handleSort("sender")}
                    >
                      <div className="flex items-center gap-1.5">
                        Sender
                        {sortField === "sender" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: sortDirection === "asc" ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.has("subject") && (
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                      style={{ color: sortField === "subject" ? "rgb(138 9 9)" : "rgb(115 115 115)" }}
                      onClick={() => handleSort("subject")}
                    >
                      <div className="flex items-center gap-1.5">
                        Email Subject
                        {sortField === "subject" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: sortDirection === "asc" ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.has("date") && (
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                      style={{ color: sortField === "date" ? "rgb(138 9 9)" : "rgb(115 115 115)" }}
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-1.5">
                        Date Received
                        {sortField === "date" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: sortDirection === "asc" ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.has("size") && (
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                      style={{ color: sortField === "size" ? "rgb(138 9 9)" : "rgb(115 115 115)" }}
                      onClick={() => handleSort("size")}
                    >
                      <div className="flex items-center gap-1.5">
                        Size
                        {sortField === "size" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: sortDirection === "asc" ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.has("actions") && (
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(115 115 115)" }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, idx) => (
                  <AttachmentRow
                    key={`${item.messageId}-${item.id}`}
                    item={item}
                    isLast={idx === sorted.length - 1}
                    isSelected={selectedIds.has(`${item.messageId}-${item.id}`)}
                    visibleColumns={visibleColumns}
                    onRowClick={() => router.push(`/inbox/${item.messageId}?returnTo=/attachments`)}
                    onToggleSelection={() => toggleSelection(`${item.messageId}-${item.id}`)}
                    onPreview={() => setPreviewItem(item)}
                  />
                ))}
              </tbody>
            </table>
            {loadError && (
              <div className="text-center py-3 text-sm" style={{ color: "rgb(138 9 9)" }}>
                {loadError}
                <button onClick={loadMore} className="ml-2 underline font-medium">Retry</button>
              </div>
            )}
            {currentNextLink && (
              <div className="flex justify-center py-4 border-t border-neutral-200">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-[8px] text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "rgb(138 9 9)", color: "white" }}
                  onMouseEnter={(e) => { if (!loadingMore) { e.currentTarget.style.backgroundColor = "rgb(115 7 7)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
                >
                  {loadingMore ? "Loading..." : "Load More Attachments"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative rounded-[16px] overflow-hidden max-w-5xl max-h-full"
            style={{ backgroundColor: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgb(229 229 229)" }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileIcon type={getFileType(previewItem.contentType, previewItem.name)} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold truncate" style={{ color: "rgb(27 29 29)" }} title={previewItem.name}>
                    {previewItem.name}
                  </h3>
                  <p className="text-xs truncate" style={{ color: "rgb(115 115 115)" }}>
                    {formatSize(previewItem.size)} • {formatDate(previewItem.receivedDateTime)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="flex-shrink-0 p-2 rounded-[8px] hover:bg-neutral-100 transition-colors"
                style={{ color: "rgb(115 115 115)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(100vh-16rem)] overflow-auto">
              {getFileType(previewItem.contentType, previewItem.name) === "image" ? (
                <img
                  src={`/api/mail/attachments/${encodeURIComponent(previewItem.messageId)}/${encodeURIComponent(previewItem.id)}?homeAccountId=${encodeURIComponent(previewItem.homeAccountId)}&mode=inline`}
                  alt={previewItem.name}
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: "70vh" }}
                />
              ) : getFileType(previewItem.contentType, previewItem.name) === "pdf" ? (
                <iframe
                  src={`/api/mail/attachments/${encodeURIComponent(previewItem.messageId)}/${encodeURIComponent(previewItem.id)}?homeAccountId=${encodeURIComponent(previewItem.homeAccountId)}&mode=inline`}
                  className="w-full"
                  style={{ height: "70vh", border: "none" }}
                  title={previewItem.name}
                />
              ) : (
                <div className="text-center py-12">
                  <FileIcon type={getFileType(previewItem.contentType, previewItem.name)} />
                  <p className="text-sm mt-4" style={{ color: "rgb(115 115 115)" }}>
                    Preview not available for this file type.
                  </p>
                  <p className="text-xs mt-2" style={{ color: "rgb(155 155 155)" }}>
                    Download the file to view it.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "rgb(229 229 229)" }}>
              <button
                onClick={async () => {
                  try {
                    const url = `/api/mail/attachments/${encodeURIComponent(previewItem.messageId)}/${encodeURIComponent(previewItem.id)}?homeAccountId=${encodeURIComponent(previewItem.homeAccountId)}`;
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
                    const blob = await res.blob();
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = previewItem.name;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  } catch (err) {
                    console.error("[download]", err);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-sm font-medium transition-colors"
                style={{ backgroundColor: "rgb(138 9 9)", color: "white" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(115 7 7)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttachmentRow({
  item,
  isLast,
  isSelected,
  visibleColumns,
  onRowClick,
  onToggleSelection,
  onPreview,
}: {
  item: AttachmentItem;
  isLast: boolean;
  isSelected: boolean;
  visibleColumns: Set<ColumnKey>;
  onRowClick: () => void;
  onToggleSelection: () => void;
  onPreview: () => void;
}) {
  const type = getFileType(item.contentType, item.name);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      const url = `/api/mail/attachments/${encodeURIComponent(item.messageId)}/${encodeURIComponent(item.id)}?homeAccountId=${encodeURIComponent(item.homeAccountId)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("[download]", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <tr
      className="transition-colors hover:bg-neutral-50"
      style={{
        borderBottom: isLast ? "none" : "1px solid rgb(245 245 245)",
        backgroundColor: isSelected ? "rgb(254 249 249)" : "transparent"
      }}
    >
      {visibleColumns.has("checkbox") && (
        <td className="text-center px-3 py-3.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded cursor-pointer"
            style={{ accentColor: "rgb(138 9 9)" }}
          />
        </td>
      )}
      {visibleColumns.has("name") && (
        <td className="px-5 py-3.5 cursor-pointer" onClick={onRowClick}>
          <div className="flex items-center gap-2.5 min-w-0">
            <FileIcon type={type} />
            <span
              className="text-sm font-medium truncate"
              style={{ color: "rgb(27 29 29)" }}
              title={item.name}
            >
              {item.name}
            </span>
          </div>
        </td>
      )}
      {visibleColumns.has("type") && (
        <td className="px-5 py-3.5 cursor-pointer" onClick={onRowClick}>
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "rgb(245 245 245)", color: "rgb(58 58 58)" }}>
            {getFileExtension(item.name)}
          </span>
        </td>
      )}
      {visibleColumns.has("sender") && (
        <td className="px-5 py-3.5 cursor-pointer" onClick={onRowClick}>
          <div className="min-w-0">
            <p className="text-sm truncate" style={{ color: "rgb(58 58 58)" }}>
              {item.senderName}
            </p>
            <p className="text-xs truncate" style={{ color: "rgb(155 155 155)" }}>
              {item.senderAddress}
            </p>
          </div>
        </td>
      )}
      {visibleColumns.has("subject") && (
        <td className="px-5 py-3.5 cursor-pointer" onClick={onRowClick}>
          <span className="text-sm truncate block" style={{ color: "rgb(58 58 58)" }} title={item.messageSubject}>
            {item.messageSubject}
          </span>
        </td>
      )}
      {visibleColumns.has("date") && (
        <td className="px-5 py-3.5 cursor-pointer" onClick={onRowClick}>
          <span className="text-sm whitespace-nowrap" style={{ color: "rgb(115 115 115)" }}>
            {formatDate(item.receivedDateTime)}
          </span>
        </td>
      )}
      {visibleColumns.has("size") && (
        <td className="px-5 py-3.5 cursor-pointer" onClick={onRowClick}>
          <span className="text-sm" style={{ color: "rgb(115 115 115)" }}>
            {formatSize(item.size)}
          </span>
        </td>
      )}
      {visibleColumns.has("actions") && (
        <td className="px-5 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors"
              style={{ backgroundColor: "rgb(245 245 245)", color: "rgb(58 58 58)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(229 229 229)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              title="Preview attachment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: "rgb(245 245 245)", color: "rgb(58 58 58)" }}
              onMouseEnter={(e) => { if (!downloading) { e.currentTarget.style.backgroundColor = "rgb(229 229 229)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              title="Download attachment"
            >
              {downloading ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Download
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRowClick(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors"
              style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; e.currentTarget.style.color = "rgb(138 9 9)"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View email
            </button>
          </div>
        </td>
      )}
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
