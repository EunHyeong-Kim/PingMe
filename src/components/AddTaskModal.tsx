"use client";

import { useState, useRef } from "react";
import { X, Loader2, CalendarDays } from "lucide-react";
import { addTask } from "@/lib/firestore";

interface AddTaskModalProps {
  groupId: string;
  authorId: string;
  defaultDate: string;
  onClose: () => void;
}

// "YYYY-MM-DD" → "YYYY/MM/DD"
function toDisplay(iso: string) {
  return iso.replace(/-/g, "/");
}

// "YYYY/MM/DD" → "YYYY-MM-DD"
function toISO(display: string) {
  return display.replace(/\//g, "-");
}

export default function AddTaskModal({ groupId, authorId, defaultDate, onClose }: AddTaskModalProps) {
  const [text, setText] = useState("");
  const [date, setDate] = useState(defaultDate);           // 내부 ISO 형식
  const [displayDate, setDisplayDate] = useState(toDisplay(defaultDate)); // 표시 형식
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  const handleDisplayChange = (val: string) => {
    setDisplayDate(val);
    const iso = toISO(val);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) setDate(iso);
  };

  const handleNativeDateChange = (val: string) => {
    setDate(val);
    setDisplayDate(toDisplay(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError("할 일을 입력해주세요."); return; }
    setLoading(true);
    try {
      await addTask(groupId, authorId, text.trim(), date);
      onClose();
    } catch (err: unknown) {
      console.error("[Ping] addTask 오류:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`추가 실패: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
        >
          <X size={15} />
        </button>

        <h2 className="text-lg font-black text-slate-800 mb-5">할 일 추가</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">날짜</label>
            <div className="relative">
              <input
                type="text"
                value={displayDate}
                onChange={(e) => handleDisplayChange(e.target.value)}
                placeholder="YYYY/MM/DD"
                maxLength={10}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <button
                type="button"
                onClick={() => hiddenDateRef.current?.showPicker()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors"
                tabIndex={-1}
              >
                <CalendarDays size={17} />
              </button>
              {/* 네이티브 달력 선택기 — 화면에는 숨김 */}
              <input
                ref={hiddenDateRef}
                type="date"
                value={date}
                onChange={(e) => handleNativeDateChange(e.target.value)}
                className="sr-only"
                tabIndex={-1}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">할 일</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="오늘 무엇을 할 건가요?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none"
            />
          </div>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white text-sm font-bold shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            추가하기
          </button>
        </form>
      </div>
    </div>
  );
}
