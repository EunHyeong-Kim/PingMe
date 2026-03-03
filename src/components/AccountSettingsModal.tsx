"use client";

import { useState } from "react";
import { X, Check, Eye, EyeOff, User, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateAllMemberDisplayNames } from "@/lib/firestore";

interface AccountSettingsModalProps {
  onClose: () => void;
}

export default function AccountSettingsModal({ onClose }: AccountSettingsModalProps) {
  const { user, updateDisplayName, updateUserPassword } = useAuth();

  // 닉네임
  const [name, setName] = useState(user?.displayName ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // 비밀번호
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleNameSave = async () => {
    if (!name.trim()) return;
    if (name.trim() === user?.displayName) {
      setNameMsg({ type: "err", text: "현재 닉네임과 동일해요." });
      return;
    }
    setNameSaving(true);
    setNameMsg(null);
    try {
      await updateDisplayName(name.trim());
      if (user) await updateAllMemberDisplayNames(user.uid, name.trim());
      setNameMsg({ type: "ok", text: "닉네임이 변경됐어요." });
    } catch {
      setNameMsg({ type: "err", text: "닉네임 변경에 실패했어요." });
    } finally {
      setNameSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: "err", text: "모든 항목을 입력해주세요." });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: "err", text: "새 비밀번호는 6자 이상이어야 해요." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: "err", text: "새 비밀번호가 일치하지 않아요." });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await updateUserPassword(currentPw, newPw);
      setPwMsg({ type: "ok", text: "비밀번호가 변경됐어요." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setPwMsg({ type: "err", text: "현재 비밀번호가 틀렸어요." });
      } else {
        setPwMsg({ type: "err", text: "비밀번호 변경에 실패했어요." });
      }
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
        >
          <X size={15} />
        </button>

        <h2 className="text-base font-bold text-slate-800 mb-1">내 정보 변경</h2>
        <p className="text-xs text-slate-400 mb-6">{user?.email}</p>

        {/* ── 닉네임 변경 ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
              <User size={12} className="text-sky-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">닉네임</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameMsg(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleNameSave(); }}
              placeholder="새 닉네임"
              maxLength={20}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
            />
            <button
              onClick={handleNameSave}
              disabled={nameSaving || !name.trim()}
              className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Check size={13} />
              저장
            </button>
          </div>
          {nameMsg && (
            <p className={`text-xs mt-2 font-medium ${nameMsg.type === "ok" ? "text-emerald-500" : "text-rose-500"}`}>
              {nameMsg.text}
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 mb-6" />

        {/* ── 비밀번호 변경 ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
              <Lock size={12} className="text-sky-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">비밀번호 변경</span>
          </div>
          <div className="space-y-2">
            {/* 현재 비밀번호 */}
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => { setCurrentPw(e.target.value); setPwMsg(null); }}
                placeholder="현재 비밀번호"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {/* 새 비밀번호 */}
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setPwMsg(null); }}
                placeholder="새 비밀번호 (6자 이상)"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {/* 새 비밀번호 확인 */}
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setPwMsg(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSave(); }}
              placeholder="새 비밀번호 확인"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          {pwMsg && (
            <p className={`text-xs mt-2 font-medium ${pwMsg.type === "ok" ? "text-emerald-500" : "text-rose-500"}`}>
              {pwMsg.text}
            </p>
          )}

          <button
            onClick={handlePasswordSave}
            disabled={pwSaving || !currentPw || !newPw || !confirmPw}
            className="mt-3 w-full py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 disabled:opacity-50 transition-all"
          >
            {pwSaving ? "변경 중..." : "비밀번호 변경"}
          </button>
        </div>
      </div>
    </div>
  );
}
