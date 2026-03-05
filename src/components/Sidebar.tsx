"use client";

import { useState } from "react";
import Image from "next/image";
import { LogOut, Plus, Settings, UserCog } from "lucide-react";
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
  profileEmoji?: string;
  ownerId: string;
  inviteCode?: string;
  members: SidebarMember[];
}

interface SidebarProps {
  groups: SidebarGroup[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string | null) => void;
  onAddGroup: () => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup?: (groupId: string, newName: string) => void;
  currentUserId: string;
  onLogOut: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onDeleteGroup,
  onRenameGroup,
  onLogOut,
  currentUserId,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [settingsGroupId, setSettingsGroupId] = useState<string | null>(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const settingsGroup = settingsGroupId ? groups.find((g) => g.id === settingsGroupId) : null;
  const currentMember = settingsGroup?.members.find((m) => m.id === currentUserId);

  return (
    <>
      {/* 모바일 백드롭 */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={onMobileClose}
        />
      )}
    <aside className={`
      bg-white flex flex-col border-r border-sky-100 shadow-sm
      md:relative md:flex md:w-56 md:min-w-56
      fixed top-0 left-0 h-full z-50 w-64
      transition-transform duration-300 ease-in-out
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    `}>
      {/* 앱 로고 */}
      <div className="px-5 py-5 border-b border-sky-100 flex justify-center">
        <Image src="/favicon.ico" alt="Ping" width={36} height={36} className="rounded-xl" />
      </div>

      {/* 그룹 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 px-2 font-semibold">내 그룹</p>
        <nav className="space-y-1">
          {groups.map((group) => {
            const isSelected = group.id === selectedGroupId;
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
                  <span className="text-xl leading-none shrink-0">{group.profileEmoji ?? "📌"}</span>
                  <div className="flex-1 min-w-0 pr-7">
                    <p className="text-sm font-semibold truncate">{group.name}</p>
                    <p className={`text-xs truncate font-medium ${isSelected ? "text-sky-100" : "text-slate-400"}`}>
                      {group.members.length}명
                    </p>
                  </div>
                </button>

                {/* 설정 버튼 — 선택된 그룹에만 노출 */}
                {isSelected && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSettingsGroupId(group.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all"
                    title="그룹 / 프로필 설정"
                  >
                    <Settings size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* 그룹 추가 + 내 정보 + 로그아웃 */}
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
          groupName={settingsGroup.name}
          inviteCode={settingsGroup.inviteCode}
          userId={currentUserId}
          currentColor={currentMember.color}
          currentEmoji={currentMember.profileEmoji}
          memberName={currentMember.name}
          isOwner={settingsGroup.ownerId === currentUserId}
          onClose={() => setSettingsGroupId(null)}
          onSaved={() => setSettingsGroupId(null)}
          onGroupRenamed={(newName) => {
            onRenameGroup?.(settingsGroupId, newName);
          }}
          onGroupDeleted={() => {
            setSettingsGroupId(null);
            onDeleteGroup(settingsGroupId);
          }}
        />
      )}

      {/* 내 정보 변경 모달 */}
      {showAccountSettings && (
        <AccountSettingsModal onClose={() => setShowAccountSettings(false)} />
      )}
    </aside>
    </>
  );
}
