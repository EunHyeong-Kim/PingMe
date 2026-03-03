"use client";

import { useState, useRef } from "react";
import { X, Loader2, Copy, Check, ChevronDown, Pipette } from "lucide-react";
import { createGroup, joinGroupByCode } from "@/lib/firestore";
import { Group } from "@/lib/types";
import EmojiPickerPanel from "./EmojiPickerPanel";

const PRESET_COLORS = [
  "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
  "#EF4444", "#F97316", "#F59E0B", "#10B981",
  "#14B8A6", "#06B6D4", "#0EA5E9", "#84CC16",
];

interface GroupModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onGroupCreatedOrJoined: (group: Group) => void;
}

export default function GroupModal({ userId, userName, onClose, onGroupCreatedOrJoined }: GroupModalProps) {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [groupName, setGroupName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📚");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) { setError("그룹 이름을 입력해주세요."); return; }
    setError(""); setLoading(true);
    try {
      const group = await createGroup(userId, userName, selectedColor, groupName.trim(), selectedEmoji);
      setCreatedCode(group.inviteCode);
    } catch {
      setError("그룹 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) { setError("초대 코드를 입력해주세요."); return; }
    setError(""); setLoading(true);
    try {
      const group = await joinGroupByCode(userId, userName, selectedColor, inviteCode.trim());
      onGroupCreatedOrJoined(group);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "참여에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 그룹 생성 완료 화면
  if (createdCode) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 flex items-center justify-center text-4xl mx-auto mb-4 border border-sky-100">
            {selectedEmoji}
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">{groupName}</h3>
          <p className="text-sm text-slate-500 mb-6">그룹이 생성되었습니다! 친구에게 코드를 공유하세요.</p>
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 mb-4">
            <p className="text-xs text-sky-500 font-bold uppercase tracking-wider mb-2">초대 코드</p>
            <p className="text-3xl font-black text-sky-600 tracking-[0.3em]">{createdCode}</p>
          </div>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 text-white text-sm font-bold mb-3 hover:bg-sky-600 transition-all"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "복사됨!" : "코드 복사"}
          </button>
          <button
            onClick={() => onGroupCreatedOrJoined({ id: "", name: groupName, profileEmoji: selectedEmoji, ownerId: userId, inviteCode: createdCode, createdAt: Date.now() })}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all"
          >
            대시보드로 이동
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      {/* 탭 */}
      <div className="flex bg-sky-100 rounded-xl p-1 mb-5">
        {(["create", "join"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"
            }`}
          >
            {t === "create" ? "그룹 만들기" : "코드로 참여"}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <div className="space-y-4">
          {/* 아이콘 + 그룹 이름 한 줄 */}
          <div className="flex gap-2 items-start">
            {/* 이모지 버튼 */}
            <div className="shrink-0">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 rounded-xl border border-slate-200 bg-sky-50 hover:border-sky-400 hover:bg-sky-100 transition-all flex items-center justify-center text-3xl"
              >
                {selectedEmoji}
              </button>
            </div>

            {/* 그룹 이름 */}
            <div className="flex-1">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="그룹 이름"
                className="w-full h-14 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>
          </div>

          {showEmojiPicker && (
            <div className="rounded-2xl border border-sky-100 overflow-hidden shadow-lg">
              <EmojiPickerPanel
                onSelect={(emoji) => {
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}

          {/* 내 컬러 선택 */}
          <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white text-sm font-bold shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            그룹 만들기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              초대 코드
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="AB12CD"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center font-black tracking-[0.3em] text-sky-600 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white text-sm font-bold shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            그룹 참여하기
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ────────────────────────────────────────────
// 컬러 피커
// ────────────────────────────────────────────
function ColorPicker({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isPreset = PRESET_COLORS.includes(selected);

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
        내 컬러
      </label>

      {/* 프리셋 컬러 */}
      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`w-10 h-10 rounded-xl transition-all ${
              selected === color
                ? "ring-2 ring-offset-2 ring-sky-400 scale-110"
                : "hover:scale-105 hover:ring-1 hover:ring-offset-1 hover:ring-slate-300"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* 커스텀 컬러 (스포이드 / 컬러휠) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => colorInputRef.current?.click()}
          className={`flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-xl border-2 transition-all text-sm font-semibold ${
            !isPreset
              ? "border-sky-400 bg-sky-50 text-sky-600"
              : "border-dashed border-slate-300 text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-500"
          }`}
        >
          <Pipette size={15} />
          <span>직접 선택</span>
          {!isPreset && (
            <span
              className="ml-auto w-5 h-5 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: selected }}
            />
          )}
        </button>

        {/* 선택된 컬러 미리보기 */}
        <div
          className="w-10 h-10 rounded-xl border-2 border-white shadow-md flex-shrink-0 transition-all"
          style={{ backgroundColor: selected }}
        />

        {/* 숨겨진 color input */}
        <input
          ref={colorInputRef}
          type="color"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="sr-only"
        />
      </div>

    </div>
  );
}

// ────────────────────────────────────────────
// 모달 쉘
// ────────────────────────────────────────────
function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all z-10"
        >
          <X size={15} />
        </button>
        <h2 className="text-lg font-black text-slate-800 mb-5">그룹 관리</h2>
        {children}
      </div>
    </div>
  );
}
