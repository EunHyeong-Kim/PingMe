"use client";

import { useState } from "react";
import Image from "next/image";
import { LogOut, Plus, Settings, UserCog, Trash2 } from "lucide-react";
import MemberSettingsModal from "./MemberSettingsModal";
import AccountSettingsModal from "./AccountSettingsModal";

interface SidebarMember {
  id: string;
  name: string;
  color: string;
  profileEmoji?: string;
}

interface SidebarGroup {
  id: string;
  name: string;
  profileImg?: string;
  profileEmoji?: string;
  ownerId: string;
  members: SidebarMember[];
}

interface SidebarProps {
  groups: SidebarGroup[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string | null) => void;
  onAddGroup: () => void;
  onDeleteGroup: (groupId: string) => void;
  currentUserId: string;
  onLogOut: () => void;
}

export default function Sidebar({ groups, selectedGroupId, onSelectGroup, onAddGroup, onDeleteGroup, onLogOut, currentUserId }: SidebarProps) {
  const [settingsGroupId, setSettingsGroupId] = useState<string | null>(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [deleteConfirmGroupId, setDeleteConfirmGroupId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const settingsGroup = settingsGroupId ? groups.find((g) => g.id === settingsGroupId) : null;
  const currentMember = settingsGroup?.members.find((m) => m.id === currentUserId);

  return (
    <aside className="w-56 min-w-56 h-screen bg-white flex flex-col border-r border-sky-100 shadow-sm">
      {/* 앱 로고 — 아이콘만 가운데 정렬 */}
      <div className="px-5 py-5 border-b border-sky-100 flex justify-center">
        <Image src="/favicon.ico" alt="Ping" width={36} height={36} className="rounded-xl" />
      </div>

      {/* 그룹 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 px-2 font-semibold">내 그룹</p>
        <nav className="space-y-1">
          {groups.map((group) => {
            const isSelected = group.id === selectedGroupId;
            const isOwner = group.ownerId === currentUserId;
            const isConfirming = deleteConfirmGroupId === group.id;
            return (
              <div key={group.id} className="relative group/item">
                <button
                  onClick={() => onSelectGroup(group.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                    isSelected
                      ? "bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md shadow-sky-200"
                      : "text-slate-600 hover:bg-sky-50 hover:text-slate-800"
                  }`}
                >
                  <span className="text-xl leading-none">{group.profileEmoji ?? group.profileImg ?? "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{group.name}</p>
                    <p className={`text-xs truncate font-medium ${isSelected ? "text-sky-100" : "text-slate-400"}`}>
                      {group.members.length}명
                    </p>
                  </div>
                </button>

                {/* 설정/삭제 버튼 — 선택된 그룹에만 노출 */}
                {isSelected && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isOwner && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmGroupId(group.id); }}
                        className="w-6 h-6 rounded-lg bg-white/20 hover:bg-rose-400/80 flex items-center justify-center text-white transition-all"
                        title="그룹 삭제"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSettingsGroupId(group.id); }}
                      className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all"
                      title="내 프로필 설정"
                    >
                      <Settings size={12} />
                    </button>
                  </div>
                )}

                {/* 삭제 확인 */}
                {isConfirming && (
                  <div className="mx-1 mt-1 mb-1 p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <p className="text-xs font-semibold text-rose-600 mb-1">그룹을 삭제할까요?</p>
                    <p className="text-[10px] text-rose-400 mb-2">모든 일정과 데이터가 삭제됩니다.</p>
                    <div className="flex gap-2">
                      <button
                        disabled={deleting}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setDeleting(true);
                          await onDeleteGroup(group.id);
                          setDeleteConfirmGroupId(null);
                          setDeleting(false);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 disabled:opacity-50 transition-all"
                      >
                        {deleting ? "삭제 중..." : "삭제"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmGroupId(null); }}
                        className="flex-1 py-1.5 rounded-lg bg-white text-slate-500 text-xs font-bold hover:bg-slate-100 border border-slate-200 transition-all"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* 그룹 추가 + 로그아웃 */}
      <div className="px-3 py-4 border-t border-sky-100 space-y-2">
        <button
          onClick={onAddGroup}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sky-500 hover:bg-sky-50 transition-all duration-150 text-sm font-semibold border border-dashed border-sky-300 hover:border-sky-400"
        >
          <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
            <Plus size={13} className="text-sky-500" />
          </div>
          <span>그룹 추가 / 참여</span>
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setShowAccountSettings(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-all text-xs"
            title="내 정보 변경"
          >
            <UserCog size={12} />
            <span>내 정보</span>
          </button>
          <button
            onClick={onLogOut}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all text-xs"
            title="로그아웃"
          >
            <LogOut size={12} />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* 멤버 설정 모달 */}
      {settingsGroupId && settingsGroup && currentMember && (
        <MemberSettingsModal
          groupId={settingsGroupId}
          userId={currentUserId}
          currentColor={currentMember.color}
          currentEmoji={currentMember.profileEmoji}
          memberName={currentMember.name}
          onClose={() => setSettingsGroupId(null)}
          onSaved={() => setSettingsGroupId(null)}
        />
      )}

      {/* 내 정보 변경 모달 */}
      {showAccountSettings && (
        <AccountSettingsModal onClose={() => setShowAccountSettings(false)} />
      )}
    </aside>
  );
}
