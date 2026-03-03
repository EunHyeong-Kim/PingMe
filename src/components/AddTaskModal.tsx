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

function toDisplay(iso: string) {
  return iso.replace(/-/g, "/");
}

function toISO(display: string) {
  return display.replace(/\//g, "-");
}

function isValidISO(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default function AddTaskModal({ groupId, authorId, defaultDate, onClose }: AddTaskModalProps) {
  const [text, setText] = useState("");

  // 시작일
  const [date, setDate] = useState(defaultDate);
  const [displayDate, setDisplayDate] = useState(toDisplay(defaultDate));

  // 기간 설정
  const [useRange, setUseRange] = useState(false);
  const [endDate, setEndDate] = useState(defaultDate);
  const [displayEndDate, setDisplayEndDate] = useState(toDisplay(defaultDate));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hiddenStartRef = useRef<HTMLInputElement>(null);
  const hiddenEndRef = useRef<HTMLInputElement>(null);

  const handleStartDisplayChange = (val: string) => {
    setDisplayDate(val);
    const iso = toISO(val);
    if (isValidISO(iso)) setDate(iso);
  };

  const handleStartNativeChange = (val: string) => {
    setDate(val);
    setDisplayDate(toDisplay(val));
  };

  const handleEndDisplayChange = (val: string) => {
    setDisplayEndDate(val);
    const iso = toISO(val);
    if (isValidISO(iso)) setEndDate(iso);
  };

  const handleEndNativeChange = (val: string) => {
    setEndDate(val);
    setDisplayEndDate(toDisplay(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError("일정 내용을 입력해주세요."); return; }
    if (!isValidISO(date)) { setError("시작일을 올바르게 입력해주세요."); return; }
    if (useRange) {
      if (!isValidISO(endDate)) { setError("종료일을 올바르게 입력해주세요."); return; }
      if (endDate < date) { setError("종료일은 시작일보다 같거나 늦어야 합니다."); return; }
    }
    setLoading(true);
    try {
      await addTask(groupId, authorId, text.trim(), date, useRange ? endDate : undefined);
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

        <h2 className="text-lg font-black text-slate-800 mb-5">일정 추가</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 시작일 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              {useRange ? "시작일" : "날짜"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={displayDate}
                onChange={(e) => handleStartDisplayChange(e.target.value)}
                placeholder="YYYY/MM/DD"
                maxLength={10}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <button
                type="button"
                onClick={() => hiddenStartRef.current?.showPicker()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors"
                tabIndex={-1}
              >
                <CalendarDays size={17} />
              </button>
              <input
                ref={hiddenStartRef}
                type="date"
                value={date}
                onChange={(e) => handleStartNativeChange(e.target.value)}
                className="sr-only"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* 기간 설정 토글 */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setUseRange((v) => !v)}
              className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${useRange ? "bg-sky-500" : "bg-slate-200"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${useRange ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <span className="text-xs font-semibold text-slate-500">기간 설정</span>
          </label>

          {/* 종료일 — 기간 설정 ON일 때만 노출 */}
          {useRange && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">종료일</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayEndDate}
                  onChange={(e) => handleEndDisplayChange(e.target.value)}
                  placeholder="YYYY/MM/DD"
                  maxLength={10}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => hiddenEndRef.current?.showPicker()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors"
                  tabIndex={-1}
                >
                  <CalendarDays size={17} />
                </button>
                <input
                  ref={hiddenEndRef}
                  type="date"
                  value={endDate}
                  min={date}
                  onChange={(e) => handleEndNativeChange(e.target.value)}
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>
            </div>
          )}

          {/* 내용 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">내용</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="일정 내용을 입력하세요"
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
