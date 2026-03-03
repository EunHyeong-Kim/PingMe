"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Send,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { UIGroup, UITask } from "@/lib/ui-types";
import { TaskStatus, Comment } from "@/lib/types";
import { editTask, deleteTask, addComment, subscribeComments } from "@/lib/firestore";

interface DailyFeedProps {
  group: UIGroup;
  tasks: UITask[];
  selectedDate: string;
  currentUserId: string;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask?: () => void;
}

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  예정: "진행 중",
  "진행 중": "완료",
  완료: "예정",
};

const STATUS_STYLES: Record<
  TaskStatus,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  예정: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
    icon: <Circle size={12} className="text-slate-400" />,
  },
  "진행 중": {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    icon: <Clock size={12} className="text-amber-500" />,
  },
  완료: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    icon: <CheckCircle2 size={12} className="text-emerald-500" />,
  },
};

function formatSelectedDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`;
}

interface TaskCardProps {
  task: UITask;
  memberColor: string;
  memberName: string;
  memberEmoji?: string;
  isOwner: boolean;
  currentUserId: string;
  currentUserName: string;
  getMemberColor: (userId: string) => string;
  getMemberEmoji: (userId: string) => string | undefined;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

function MemberAvatar({ name, color, profileEmoji, size = 7 }: { name: string; color: string; profileEmoji?: string; size?: number }) {
  const px = size * 4;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 overflow-hidden"
      style={{ backgroundColor: color, width: px, height: px, fontSize: profileEmoji ? px * 0.55 : px * 0.45 }}
    >
      {profileEmoji || name[0]}
    </div>
  );
}

function formatCommentTime(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function TaskCard({ task, memberColor, memberName, memberEmoji, isOwner, currentUserId, currentUserName, getMemberColor, getMemberEmoji, onStatusChange }: TaskCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDate, setEditDate] = useState(task.date);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // 카드 마운트 즉시 구독 → 댓글 수 실시간 반영
  useEffect(() => {
    const unsub = subscribeComments(task.id, setComments);
    return () => unsub();
  }, [task.id]);

  const handleSendComment = async () => {
    if (!commentInput.trim() || commentSending) return;
    setCommentSending(true);
    try {
      await addComment(task.id, currentUserId, currentUserName, commentInput.trim());
      setCommentInput("");
    } finally {
      setCommentSending(false);
    }
  };
  const statusStyle = STATUS_STYLES[task.status];

  const handleEditSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    await editTask(task.id, editText.trim(), editDate);
    setSaving(false);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(task.text);
    setEditDate(task.date);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* 상단 멤버 컬러 라인 */}
      <div className="h-1 w-full rounded-t-2xl" style={{ backgroundColor: memberColor }} />

      <div className="p-3.5">
        {/* 멤버 정보 + 상태 + 수정/삭제 */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <MemberAvatar name={memberName} color={memberColor} profileEmoji={memberEmoji} size={7} />
            <span className="text-xs font-bold text-slate-600">{memberName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 수정/삭제 버튼 — 본인 태스크만 노출 */}
            {isOwner && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-sky-100 hover:text-sky-500 transition-all"
                  title="수정"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-all"
                  title="삭제"
                >
                  <Trash2 size={11} />
                </button>
              </>
            )}

            {/* 상태 버튼 */}
            <button
              onClick={() => onStatusChange(task.id, STATUS_CYCLE[task.status])}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              {statusStyle.icon}
              {task.status}
            </button>
          </div>
        </div>

        {/* 삭제 확인 */}
        {showDeleteConfirm && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <p className="text-xs font-semibold text-rose-600 mb-2">정말 삭제할까요?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all"
              >
                삭제
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 인라인 수정 폼 */}
        {isEditing ? (
          <div className="mb-3 space-y-2">
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sky-200 text-xs text-slate-600 focus:outline-none focus:border-sky-400 bg-sky-50"
            />
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-sky-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 bg-sky-50 resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                disabled={saving || !editText.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 disabled:opacity-50 transition-all"
              >
                <Check size={11} /> 저장
              </button>
              <button
                onClick={handleEditCancel}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                <X size={11} /> 취소
              </button>
            </div>
          </div>
        ) : (
          /* 할 일 텍스트 */
          <p
            className={`text-sm font-semibold mb-3 leading-snug ${
              task.status === "완료" ? "line-through text-slate-300" : "text-slate-700"
            }`}
          >
            {task.text}
          </p>
        )}

        {/* 액션 버튼들 */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 text-sky-500 border border-sky-200 hover:bg-sky-100 text-xs font-semibold transition-all"
            >
              <MessageCircle size={11} />
              댓글
              {comments.length > 0 && (
                <span className="bg-sky-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]">
                  {comments.length}
                </span>
              )}
              {showComments ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          </div>
        )}

        {/* 댓글 영역 */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2 font-medium">
                아직 댓글이 없어요
              </p>
            ) : (
              comments.map((comment) => {
                const avatarColor = getMemberColor(comment.authorId);
                const avatarEmoji = getMemberEmoji(comment.authorId);
                return (
                <div key={comment.id} className="flex gap-2">
                  <div className="shrink-0 mt-0.5">
                    <MemberAvatar name={comment.authorName} color={avatarColor} profileEmoji={avatarEmoji} size={6} />
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-600">{comment.authorName}</span>
                      <span className="text-xs text-slate-400">{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600">{comment.content}</p>
                  </div>
                </div>
                );
              })
            )}
            {/* 댓글 입력창 */}
            <div className="flex gap-2 mt-2.5">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendComment(); }}
                placeholder="인증 댓글 달기..."
                className="flex-1 bg-sky-50 text-xs text-slate-600 placeholder-slate-400 rounded-xl px-3 py-2 border border-sky-200 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
              />
              <button
                onClick={handleSendComment}
                disabled={!commentInput.trim() || commentSending}
                className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-sm shadow-sky-200"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DailyFeed({
  group,
  tasks,
  selectedDate,
  currentUserId,
  onStatusChange,
  onAddTask,
}: DailyFeedProps) {
  const dayTasks = tasks.filter((t: UITask) => t.date === selectedDate);
  const getMember = (memberId: string) => group.members.find((m) => m.id === memberId);
  const getMemberColor = (userId: string) =>
    group.members.find((m) => m.id === userId)?.color ?? "#94a3b8";
  const getMemberEmoji = (userId: string) =>
    group.members.find((m) => m.id === userId)?.profileEmoji;
  const completedCount = dayTasks.filter((t) => t.status === "완료").length;
  const achieveRate =
    dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

  return (
    <aside className="w-72 min-w-72 h-screen bg-white flex flex-col border-l border-sky-100 shadow-sm">
      {/* 헤더 */}
      <div className="px-5 py-5 border-b border-sky-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">{formatSelectedDate(selectedDate)}</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {dayTasks.length > 0
                ? `${dayTasks.length}개 할 일 · ${completedCount}개 완료`
                : "등록된 일정이 없어요"}
            </p>
          </div>
          {dayTasks.length > 0 && (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex flex-col items-center justify-center shadow-lg shadow-sky-200">
              <span className="text-lg font-black text-white leading-none">{achieveRate}</span>
              <span className="text-white/70 text-[9px] font-bold">%</span>
            </div>
          )}
        </div>

        {/* 달성률 바 */}
        {dayTasks.length > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">달성률</span>
              <span className="text-sky-500 font-bold">{completedCount}/{dayTasks.length}</span>
            </div>
            <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${achieveRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 태스크 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-20">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 border-2 border-sky-100 flex items-center justify-center text-3xl">
              📅
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">이 날엔 일정이 없어요</p>
              <p className="text-xs text-slate-400">달력에서 다른 날짜를 선택해보세요</p>
            </div>
          </div>
        ) : (
          dayTasks.map((task) => {
            const member = getMember(task.memberId);
            const memberColor = member?.color ?? "#94a3b8";
            const memberName = member?.name ?? "멤버";
            const currentUserMember = getMember(currentUserId);
            const currentUserName = currentUserMember?.name ?? "나";
            return (
              <TaskCard
                key={task.id}
                task={task}
                memberColor={memberColor}
                memberName={memberName}
                memberEmoji={member?.profileEmoji}
                isOwner={task.memberId === currentUserId}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                getMemberColor={getMemberColor}
                getMemberEmoji={getMemberEmoji}
                onStatusChange={onStatusChange}
              />
            );
          })
        )}
      </div>

      {/* 할 일 추가 버튼 */}
      <div className="px-4 py-4 border-t border-sky-100 shrink-0">
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white text-sm font-bold transition-all duration-150 shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5"
        >
          <Plus size={16} />
          오늘 할 일 추가
        </button>
      </div>
    </aside>
  );
}
