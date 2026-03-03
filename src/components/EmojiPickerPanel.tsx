"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { EMOJI_KO_DATA, EMOJI_CATEGORIES, searchEmoji } from "@/lib/emojiKoData";

interface EmojiPickerPanelProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPickerPanel({ onSelect }: EmojiPickerPanelProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const results = useMemo(() => {
    if (query.trim()) return searchEmoji(query);
    if (activeCategory === "전체") return EMOJI_KO_DATA;
    return EMOJI_KO_DATA.filter((e) => e.category === activeCategory);
  }, [query, activeCategory]);

  return (
    <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden select-none">
      {/* 검색창 */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 focus-within:border-sky-400 focus-within:bg-white transition-all">
          <Search size={13} className="text-sky-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) setActiveCategory("전체");
            }}
            placeholder="검색 (예: 공부, 운동, 불꽃)"
            className="flex-1 bg-transparent text-xs text-slate-600 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-300 hover:text-slate-500 text-sm leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 탭 (검색 중일 때 숨김) */}
      {!query && (
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-hide">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-sky-50 text-slate-500 hover:bg-sky-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 카운트 */}
      {query && (
        <p className="px-3 pb-1 text-xs text-sky-500 font-medium">
          {results.length > 0 ? `${results.length}개 결과` : "결과가 없어요"}
        </p>
      )}

      {/* 이모지 그리드 */}
      <div className="grid grid-cols-8 gap-0.5 px-3 pb-3 max-h-52 overflow-y-auto">
        {results.map((entry, i) => (
          <button
            key={entry.emoji + i}
            onClick={() => onSelect(entry.emoji)}
            title={entry.keywords[0]}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-sky-100 hover:scale-110 transition-all"
          >
            {entry.emoji}
          </button>
        ))}
        {results.length === 0 && (
          <div className="col-span-8 py-6 text-center text-sm text-slate-400">
            <span className="text-2xl block mb-1">🤷</span>
            검색 결과가 없어요
          </div>
        )}
      </div>
    </div>
  );
}
