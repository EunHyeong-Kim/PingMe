"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CalendarDays, ClipboardList, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import DailyFeed from "@/components/DailyFeed";
import GroupModal from "@/components/GroupModal";
import AddTaskModal from "@/components/AddTaskModal";
import PersonalTodoView from "@/components/PersonalTodoView";
import GroupTodoView from "@/components/GroupTodoView";
import {
  getMyGroups,
  subscribeGroupTasks,
  subscribeGroupMembers,
  updateTaskStatus,
  deleteGroup,
} from "@/lib/firestore";
import { Group, MemberConfig, Task, TaskStatus } from "@/lib/types";

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const { user, loading: authLoading, logOut } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberConfig[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [pageLoading, setPageLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [todoTargetMemberId, setTodoTargetMemberId] = useState<string | null>(null);
  // 모바일 전용 상태
  const [mobileView, setMobileView] = useState<"calendar" | "feed">("calendar");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth");
  }, [authLoading, user, router]);

  // 내 그룹 목록 불러오기
  useEffect(() => {
    if (!user) return;
    getMyGroups(user.uid).then((gs) => {
      setGroups(gs);
      if (gs.length > 0) setSelectedGroupId(gs[0].id);
      setPageLoading(false);
    });
  }, [user]);

  // 모든 그룹 멤버 실시간 구독 (그룹 목록 변경 시 재구독)
  useEffect(() => {
    if (groups.length === 0) return;
    const unsubs = groups.map((g) =>
      subscribeGroupMembers(g.id, (gMembers) => {
        setMembers((prev) => [
          ...prev.filter((m) => m.groupId !== g.id),
          ...gMembers,
        ]);
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [groups]);

  // 선택된 그룹 태스크 실시간 구독
  useEffect(() => {
    if (!selectedGroupId) return;
    const unsub = subscribeGroupTasks(selectedGroupId, setTasks);
    return unsub;
  }, [selectedGroupId]);

  const handleStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatus(taskId, newStatus);
  }, []);

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    await deleteGroup(groupId);
    const updatedGroups = await getMyGroups(user!.uid);
    setGroups(updatedGroups);
    setSelectedGroupId(updatedGroups[0]?.id ?? null);
  }, [user]);

  const handleRenameGroup = useCallback((groupId: string, newName: string) => {
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, name: newName } : g));
  }, []);

  const handleGroupCreatedOrJoined = async (group: Group) => {
    if (!user) return;
    const updatedGroups = await getMyGroups(user.uid);
    setGroups(updatedGroups);
    setSelectedGroupId(group.id || updatedGroups[0]?.id);
    setShowGroupModal(false);
  };

  // 로딩 중
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-200">
            <span className="text-white font-black text-lg">P</span>
          </div>
          <Loader2 size={20} className="animate-spin text-sky-500" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // 그룹이 없을 때
  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-sky-100 p-8 max-w-sm w-full text-center border border-sky-100">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-xl font-black text-slate-800 mb-2">
            안녕하세요, {user.displayName}님!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            그룹을 만들거나 초대 코드로 참여하여 일정을 공유해보세요.
          </p>
          <button
            onClick={() => setShowGroupModal(true)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white text-sm font-bold shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-sky-500 transition-all"
          >
            그룹 시작하기
          </button>
          <button onClick={logOut} className="mt-3 text-xs text-slate-400 hover:text-slate-600">
            로그아웃
          </button>
        </div>
        {showGroupModal && (
          <GroupModal
            userId={user.uid}
            userName={user.displayName ?? "사용자"}
            onClose={() => setShowGroupModal(false)}
            onGroupCreatedOrJoined={handleGroupCreatedOrJoined}
          />
        )}
      </div>
    );
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? groups[0];

  // Sidebar용 그룹 포맷 변환
  const sidebarGroups = groups.map((g) => ({
    id: g.id,
    name: g.name,
    profileEmoji: g.profileEmoji,
    ownerId: g.ownerId,
    inviteCode: g.inviteCode,
    members: members
      .filter((m) => m.groupId === g.id)
      .map((m) => ({ id: m.userId, name: m.displayName, color: m.chosenColor, profileEmoji: m.profileEmoji })),
  }));

  const currentGroupMembers = members.filter((m) => m.groupId === selectedGroup.id);

  // 캘린더/피드용 통합 포맷
  const calendarGroup = {
    id: selectedGroup.id,
    name: selectedGroup.name,
    profileImg: selectedGroup.profileEmoji,
    members: currentGroupMembers.map((m) => ({
      id: m.userId,
      name: m.displayName,
      color: m.chosenColor,
      profileEmoji: m.profileEmoji,
    })),
  };

  const calendarTasks = tasks.map((t) => ({
    id: t.id,
    memberId: t.authorId,
    text: t.text,
    date: t.date,
    endDate: t.endDate,
    status: t.status,
    comments: [],
  }));

  // 투두 뷰 활성 여부
  const isTodoView = !!todoTargetMemberId;

  // 중앙 패널 (캘린더 or 투두)
  const centerPanel = todoTargetMemberId === "__group__" ? (
    <GroupTodoView
      groupId={selectedGroup.id}
      groupName={selectedGroup.name}
      groupEmoji={selectedGroup.profileEmoji}
      currentUserId={user.uid}
      members={calendarGroup.members}
      onMemberClick={(memberId) => setTodoTargetMemberId(memberId)}
      onBack={() => setTodoTargetMemberId(null)}
    />
  ) : todoTargetMemberId ? (() => {
    const target = calendarGroup.members.find((m) => m.id === todoTargetMemberId);
    if (!target) return null;
    return (
      <PersonalTodoView
        targetUserId={target.id}
        targetUserName={target.name}
        targetUserColor={target.color}
        targetUserEmoji={target.profileEmoji}
        groupId={selectedGroup.id}
        groupName={selectedGroup.name}
        groupEmoji={selectedGroup.profileEmoji}
        isOwner={target.id === user.uid}
        currentUserId={user.uid}
        members={calendarGroup.members}
        onMemberClick={(memberId) => setTodoTargetMemberId(memberId)}
        onBack={() => setTodoTargetMemberId(null)}
      />
    );
  })() : (
    <MonthlyCalendar
      group={calendarGroup}
      tasks={calendarTasks}
      currentDate={currentDate}
      selectedDate={selectedDate}
      onSelectDate={(date) => { setSelectedDate(date); setMobileView("feed"); }}
      onPrevMonth={() => setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}
      onNextMonth={() => setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}
      onMemberClick={(memberId) => setTodoTargetMemberId(memberId)}
    />
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-sky-50">
      {/* ── 메인 영역 (사이드바 + 중앙 + 피드) ── */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          groups={sidebarGroups}
          selectedGroupId={selectedGroup.id}
          onSelectGroup={(id) => { setSelectedGroupId(id); setTodoTargetMemberId(null); setShowMobileSidebar(false); }}
          onAddGroup={() => { setShowGroupModal(true); setShowMobileSidebar(false); }}
          onDeleteGroup={handleDeleteGroup}
          onRenameGroup={handleRenameGroup}
          currentUserId={user.uid}
          onLogOut={logOut}
          isMobileOpen={showMobileSidebar}
          onMobileClose={() => setShowMobileSidebar(false)}
        />

        {/* 중앙 패널 — 모바일: feed 탭이면 숨김, 투두 뷰면 항상 표시 */}
        <div className={`flex-1 overflow-hidden flex-col ${
          !isTodoView && mobileView === "feed" ? "hidden md:flex" : "flex"
        }`}>
          {centerPanel}
        </div>

        {/* 우측 피드 — 모바일: feed 탭일 때만 표시, 투두 뷰면 숨김 */}
        {!isTodoView && (
          <div className={`flex-col ${
            mobileView === "feed" ? "flex w-full" : "hidden"
          } md:flex md:w-auto`}>
            <DailyFeed
              group={calendarGroup}
              tasks={calendarTasks}
              selectedDate={selectedDate}
              currentUserId={user.uid}
              onStatusChange={handleStatusChange}
              onAddTask={() => setShowAddTask(true)}
            />
          </div>
        )}
      </div>

      {/* ── 모바일 하단 내비게이션 ── */}
      <nav className="md:hidden shrink-0 h-16 bg-white border-t border-sky-100 flex items-center z-30 shadow-[0_-1px_12px_rgba(14,165,233,0.08)]">
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-slate-400 hover:text-sky-500 transition-colors"
        >
          <Menu size={20} />
          <span className="text-[9px] font-semibold">그룹</span>
        </button>
        <button
          onClick={() => { setMobileView("calendar"); setTodoTargetMemberId(null); }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
            mobileView === "calendar" && !isTodoView ? "text-sky-500" : "text-slate-400 hover:text-sky-400"
          }`}
        >
          <CalendarDays size={20} />
          <span className="text-[9px] font-semibold">캘린더</span>
        </button>
        <button
          onClick={() => { setMobileView("feed"); setTodoTargetMemberId(null); }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
            mobileView === "feed" && !isTodoView ? "text-sky-500" : "text-slate-400 hover:text-sky-400"
          }`}
        >
          <ClipboardList size={20} />
          <span className="text-[9px] font-semibold">일정</span>
        </button>
      </nav>

      {showGroupModal && (
        <GroupModal
          userId={user.uid}
          userName={user.displayName ?? "사용자"}
          onClose={() => setShowGroupModal(false)}
          onGroupCreatedOrJoined={handleGroupCreatedOrJoined}
        />
      )}
      {showAddTask && selectedGroup && (
        <AddTaskModal
          groupId={selectedGroup.id}
          authorId={user.uid}
          defaultDate={selectedDate}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
}
