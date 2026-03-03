"use client";

import { useState, useRef } from "react";
import { X, Pipette, Loader2, Check } from "lucide-react";
import { updateMemberColor, updateMemberEmoji } from "@/lib/firestore";
import EmojiPickerPanel from "./EmojiPickerPanel";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#0ea5e9", "#6366f1", "#a855f7",
  "#ec4899", "#64748b", "#84cc16", "#f43f5e",
];

interface MemberSettingsModalProps {
  groupId: string;
  userId: string;
  currentColor: string;
  currentEmoji?: string;
  memberName: string;
  onClose: () => void;
  onSaved: (color: string, emoji?: string) => void;
}

export default function MemberSettingsModal({
  groupId,
  userId,
  currentColor,
  currentEmoji,
  memberName,
  onClose,
  onSaved,
}: MemberSettingsModalProps) {
  const [color, setColor] = useState(currentColor);
  const [emoji, setEmoji] = useState(currentEmoji ?? "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isPreset = PRESET_COLORS.includes(color);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (color !== currentColor) await updateMemberColor(groupId, userId, color);
      if (emoji !== (currentEmoji ?? "")) await updateMemberEmoji(groupId, userId, emoji);
      onSaved(color, emoji || undefined);
      setSaved(true);
      setTimeout(onClose, 700);
    } finally {
      setSaving(false);
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

        <h2 className="text-base font-bold text-slate-800 mb-5">내 프로필 설정</h2>

        {/* 아바타 클릭 → 이모지 피커 */}
        <div className="flex flex-col items-center mb-5">
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="relative group"
            title="클릭해서 이모지 변경"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg transition-all group-hover:scale-105"
              style={{ backgroundColor: color, fontSize: emoji ? "2rem" : "1.5rem" }}
            >
              {emoji || memberName[0]}
            </div>
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold">변경</span>
            </div>
          </button>
          {emoji && (
            <button
              onClick={() => setEmoji("")}
              className="mt-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              초기화
            </button>
          )}
        </div>

        {/* 이모지 피커 */}
        {showEmojiPicker && (
          <div className="mb-5">
            <EmojiPickerPanel
              onSelect={(e) => {
                setEmoji(e);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}

        {/* 색상 선택 */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">컬러</label>
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-xl border-2 transition-all ${
                  color === c ? "border-slate-700 scale-110 shadow-md" : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => colorInputRef.current?.click()}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                !isPreset
                  ? "border-sky-400 bg-sky-50 text-sky-600"
                  : "border-slate-200 text-slate-500 hover:border-sky-300"
              }`}
            >
              <Pipette size={13} />
              직접 선택
              {!isPreset && (
                <span className="w-4 h-4 rounded-md border border-white shadow-sm inline-block" style={{ backgroundColor: color }} />
              )}
            </button>
            <div className="w-10 h-10 rounded-xl border-2 border-white shadow-md shrink-0" style={{ backgroundColor: color }} />
            <input ref={colorInputRef} type="color" value={color} onChange={(e) => setColor(e.target.value)} className="sr-only" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white text-sm font-bold shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 size={14} className="animate-spin" /> 저장 중...</>
          ) : saved ? (
            <><Check size={14} /> 저장됨!</>
          ) : (
            "저장하기"
          )}
        </button>
      </div>
    </div>
  );
}
