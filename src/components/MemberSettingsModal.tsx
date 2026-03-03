"use client";

import { useState, useRef } from "react";
import { X, Pipette, Loader2, Check, Trash2, Pencil } from "lucide-react";
import { updateMemberColor, updateMemberEmoji, renameGroup, deleteGroup } from "@/lib/firestore";
import EmojiPickerPanel from "./EmojiPickerPanel";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#0ea5e9", "#6366f1", "#a855f7",
  "#ec4899", "#64748b", "#84cc16", "#f43f5e",
];

interface MemberSettingsModalProps {
  groupId: string;
  groupName: string;
  userId: string;
  currentColor: string;
  currentEmoji?: string;
  memberName: string;
  isOwner: boolean;
  onClose: () => void;
  onSaved: (color: string, emoji?: string) => void;
  onGroupRenamed: (newName: string) => void;
  onGroupDeleted: () => void;
}

export default function MemberSettingsModal({
  groupId,
  groupName,
  userId,
  currentColor,
  currentEmoji,
  memberName,
  isOwner,
  onClose,
  onSaved,
  onGroupRenamed,
  onGroupDeleted,
}: MemberSettingsModalProps) {
  const [color, setColor] = useState(currentColor);
  const [emoji, setEmoji] = useState(currentEmoji ?? "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 그룹명 변경
  const [editingName, setEditingName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState(groupName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // 그룹 삭제
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleNameSave = async () => {
    const trimmed = groupNameInput.trim();
    if (!trimmed || trimmed === groupName) { setEditingName(false); return; }
    setNameSaving(true);
    try {
      await renameGroup(groupId, trimmed);
      onGroupRenamed(trimmed);
      setNameSaved(true);
      setEditingName(false);
      setTimeout(() => setNameSaved(false), 2000);
    } finally {
      setNameSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteGroup(groupId);
      onGroupDeleted();
    } finally {
      setDeleting(false);
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

        {/* ── 그룹 설정 (오너 전용) ── */}
        {isOwner && (
          <div className="mb-6 pb-6 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">그룹 설정</p>

            {/* 그룹명 변경 */}
            <div className="mb-3">
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleNameSave(); if (e.key === "Escape") setEditingName(false); }}
                    maxLength={20}
                    className="flex-1 px-3 py-2 rounded-xl border border-sky-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
                  />
                  <button
                    onClick={handleNameSave}
                    disabled={nameSaving || !groupNameInput.trim()}
                    className="px-3 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 disabled:opacity-50 transition-all flex items-center gap-1"
                  >
                    {nameSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setGroupNameInput(groupName); }}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs hover:bg-slate-200 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-all group"
                >
                  <span className="text-sm text-slate-700 font-semibold truncate">
                    {nameSaved ? "✓ 저장됨" : groupName}
                  </span>
                  <Pencil size={12} className="text-slate-300 group-hover:text-sky-400 transition-colors shrink-0" />
                </button>
              )}
            </div>

            {/* 그룹 삭제 */}
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-400 text-xs font-semibold hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500 transition-all"
              >
                <Trash2 size={12} />
                그룹 삭제
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <p className="text-xs font-semibold text-rose-600 mb-1">정말 삭제할까요?</p>
                <p className="text-[10px] text-rose-400 mb-2">모든 일정·댓글·투두 데이터가 삭제됩니다.</p>
                <div className="flex gap-2">
                  <button
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 disabled:opacity-50 transition-all"
                  >
                    {deleting ? "삭제 중..." : "삭제"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg bg-white text-slate-500 text-xs font-bold hover:bg-slate-100 border border-slate-200 transition-all"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 내 프로필 설정 ── */}
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
