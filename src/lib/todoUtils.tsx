"use client";

import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { TodoItem, ReactionType } from "@/lib/types";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "좋아요",  emoji: "❤️",  label: "좋아요"  },
  { type: "슬퍼요",  emoji: "😢",  label: "슬퍼요"  },
  { type: "응원해요", emoji: "💪", label: "응원해요" },
  { type: "웃겨요",  emoji: "😂",  label: "웃겨요"  },
  { type: "화나요",  emoji: "😡",  label: "화나요"  },
];

export function ReactionPicker({
  item,
  anchorRect,
  currentUserId,
  onToggle,
  onClose,
}: {
  item: TodoItem;
  anchorRect: DOMRect;
  currentUserId: string;
  onToggle: (type: ReactionType) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const PICKER_H = 60;
  const top = anchorRect.top + window.scrollY - PICKER_H;
  const centerX = anchorRect.left + anchorRect.width / 2 + window.scrollX;

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-100 px-3 py-2 flex items-center gap-1.5"
      style={{
        top,
        left: centerX,
        transform: "translateX(-50%)",
        filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.14))",
      }}
    >
      <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r border-b border-slate-100 rotate-45" />
      {REACTIONS.map(({ type, emoji, label }) => {
        const myReacted = (item.reactions?.[type] ?? []).includes(currentUserId);
        return (
          <button
            key={type}
            onClick={(e) => { e.stopPropagation(); onToggle(type); }}
            title={label}
            className={`text-2xl transition-transform hover:scale-125 active:scale-110 rounded-xl p-0.5 ${
              myReacted ? "bg-sky-50 ring-2 ring-sky-300" : ""
            }`}
          >
            {emoji}
          </button>
        );
      })}
    </div>,
    document.body
  );
}

export function ReactionBar({
  reactions,
  currentUserId,
}: {
  reactions: TodoItem["reactions"];
  currentUserId: string;
}) {
  if (!reactions) return null;
  const entries = REACTIONS.map(({ type, emoji }) => ({
    type,
    emoji,
    users: reactions[type] ?? [],
  })).filter((r) => r.users.length > 0);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {entries.map(({ type, emoji, users }) => {
        const mine = users.includes(currentUserId);
        return (
          <span
            key={type}
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full border transition-all ${
              mine
                ? "bg-sky-50 border-sky-300 text-sky-600"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            {emoji} {users.length}
          </span>
        );
      })}
    </div>
  );
}
