"use client";

import { useEffect } from "react";
import { useDataCacheStore } from "@/lib/stores/data-cache";
import type { EmailMessage } from "@/lib/types/email";

export interface KeyboardShortcutHandlers {
  onOpen: (email: EmailMessage) => void;
  onArchive: (email: EmailMessage) => void;
  onDelete: (email: EmailMessage) => void;
  onReply: (email: EmailMessage) => void;
  onReplyAll: (email: EmailMessage) => void;
  onForward: (email: EmailMessage) => void;
  onMarkUnread: (email: EmailMessage) => void;
  onStar: (email: EmailMessage) => void;
  onCompose: () => void;
  onFocusSearch: () => void;
  onEscape: () => void;
  onShowHelp: () => void;
}

export function useKeyboardShortcuts(
  emails: EmailMessage[],
  handlers: KeyboardShortcutHandlers,
  enabled = true,
) {
  const selectedEmailIndex = useDataCacheStore((s) => s.selectedEmailIndex);
  const setSelectedEmailIndex = useDataCacheStore((s) => s.setSelectedEmailIndex);

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;

      // Skip if focus is in an editable element
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const total = emails.length;
      const current = selectedEmailIndex;
      const selectedEmail = current >= 0 && current < total ? emails[current] : null;

      switch (e.key) {
        case "j":
        case "ArrowDown": {
          e.preventDefault();
          const next = Math.min(current + 1, total - 1);
          setSelectedEmailIndex(next);
          break;
        }
        case "k":
        case "ArrowUp": {
          e.preventDefault();
          const prev = Math.max(current - 1, 0);
          setSelectedEmailIndex(prev === current && current === 0 ? -1 : prev);
          break;
        }
        case "o":
        case "Enter": {
          if (selectedEmail) {
            e.preventDefault();
            handlers.onOpen(selectedEmail);
          }
          break;
        }
        case "e": {
          if (selectedEmail) {
            e.preventDefault();
            handlers.onArchive(selectedEmail);
          }
          break;
        }
        case "#": {
          if (selectedEmail) {
            e.preventDefault();
            handlers.onDelete(selectedEmail);
          }
          break;
        }
        case "r": {
          if (selectedEmail) {
            e.preventDefault();
            handlers.onReply(selectedEmail);
          }
          break;
        }
        case "a": {
          if (selectedEmail) {
            e.preventDefault();
            handlers.onReplyAll(selectedEmail);
          }
          break;
        }
        case "f": {
          if (selectedEmail) {
            e.preventDefault();
            handlers.onForward(selectedEmail);
          }
          break;
        }
        case "c": {
          e.preventDefault();
          handlers.onCompose();
          break;
        }
        case "/": {
          e.preventDefault();
          handlers.onFocusSearch();
          break;
        }
        case "u": {
          if (selectedEmail) {
            e.preventDefault();
            handlers.onMarkUnread(selectedEmail);
          }
          break;
        }
        case "s": {
          if (selectedEmail) {
            e.preventDefault();
            handlers.onStar(selectedEmail);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          handlers.onEscape();
          break;
        }
        case "?": {
          e.preventDefault();
          handlers.onShowHelp();
          break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, emails, selectedEmailIndex, setSelectedEmailIndex, handlers]);
}
