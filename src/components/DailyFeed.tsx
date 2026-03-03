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

function formatSelectedDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`;
}

function MemberAvatar({
  name,
  color,
  profileEmoji,
  size = 6,
}: {
  name: string;
  color: string;
  profileEmoji?: string;
  size?: number;
}) {
  const px = size * 4;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden"
      style={{
        backgroundColor: color,
        width: px,
        height: px,
        fontSize: profileEmoji ? px * 0.55 : px * 0.45,
      }}
    >
      {profileEmoji || name[0]}
    </div>
  );
}

function formatCommentTime(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface TaskItemProps {
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

function TaskItem({
  task,
  memberColor,
  memberName,
  memberEmoji,
  isOwner,
  currentUserId,
  currentUserName,
  getMemberColor,
  getMemberEmoji,
  onStatusChange,
}: TaskItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDate, setEditDate] = useState(task.date);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const isDone = task.status === "완료";
  const isInProgress = task.status === "진행 중";

  return (
    <div className="group/item">
      {/* 메인 행 */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
        {/* 상태 체크박스 */}
        <button
          onClick={() => onStatusChange(task.id, STATUS_CYCLE[task.status])}
          className="shrink-0 transition-transform hover:scale-110"
          title={`상태: ${task.status} → ${STATUS_CYCLE[task.status]}`}
        >
          {isDone ? (
            <CheckCircle2 size={20} className="text-emerald-400" />
          ) : isInProgress ? (
            <Clock size={20} className="text-amber-400" />
          ) : (
            <Circle size={20} className="text-slate-300 hover:text-slate-400" />
          )}
        </button>

        {/* 왼쪽 멤버 컬러 바 */}
        <div
          className="w-0.5 h-5 rounded-full shrink-0 opacity-60"
          style={{ backgroundColor: memberColor }}
        />

        {/* 할 일 텍스트 */}
        <p
          className={`flex-1 text-sm leading-snug min-w-0 truncate ${
            isDone ? "line-through text-slate-300" : "text-slate-700"
          }`}
        >
          {task.text}
        </p>

        {/* 오른쪽 액션 영역 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 수정/삭제 — 본인만, 호버 시 노출 */}
          {isOwner && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-sky-400 hover:bg-sky-50 transition-all"
                title="수정"
              >
                <Pencil size={11} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-all"
                title="삭제"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )}

          {/* 댓글 버튼 */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className={`flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs transition-all ${
              showComments
                ? "bg-sky-100 text-sky-500"
                : "text-slate-300 hover:text-sky-400 hover:bg-sky-50 opacity-0 group-hover/item:opacity-100"
            }`}
          >
            <MessageCircle size={12} />
            {comments.length > 0 && (
              <span
                className={`text-[10px] font-bold ${
                  showComments ? "text-sky-500" : "text-sky-400"
                }`}
              >
                {comments.length}
              </span>
            )}
            {showComments ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
          </button>

          {/* 멤버 아바타 */}
          <MemberAvatar
            name={memberName}
            color={memberColor}
            profileEmoji={memberEmoji}
            size={6}
          />
        </div>
      </div>

      {/* 인라인 수정 폼 */}
      {isEditing && (
        <div className="mx-3 mb-2 space-y-2 bg-sky-50 rounded-xl p-3 border border-sky-100">
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-sky-200 text-xs text-slate-600 focus:outline-none focus:border-sky-400 bg-white"
          />
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-sky-200 text-sm text-slate-700 focus:outline-none focus:border-sky-400 bg-white resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleEditSave}
              disabled={saving || !editText.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 disabled:opacity-50 transition-all"
            >
              <Check size={11} /> 저장
            </button>
            <button
              onClick={handleEditCancel}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white text-slate-500 text-xs font-bold hover:bg-slate-100 border border-slate-200 transition-all"
            >
              <X size={11} /> 취소
            </button>
          </div>
        </div>
      )}

      {/* 삭제 확인 */}
      {showDeleteConfirm && (
        <div className="mx-3 mb-2 p-3 rounded-xl bg-rose-50 border border-rose-100">
          <p className="text-xs font-semibold text-rose-500 mb-2">정말 삭제할까요?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all"
            >
              삭제
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

      {/* 댓글 영역 */}
      {showComments && (
        <div className="mx-3 mb-2 pt-2 space-y-2">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-1.5">아직 댓글이 없어요</p>
          ) : (
            comments.map((comment) => {
              const avatarColor = getMemberColor(comment.authorId);
              const avatarEmoji = getMemberEmoji(comment.authorId);
              return (
                <div key={comment.id} className="flex gap-2">
                  <MemberAvatar
                    name={comment.authorName}
                    color={avatarColor}
                    profileEmoji={avatarEmoji}
                    size={5}
                  />
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
          {/* 댓글 입력 */}
          <div className="flex gap-2 pb-1">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendComment(); }}
              placeholder="댓글 달기..."
              className="flex-1 bg-sky-50 text-xs text-slate-600 placeholder-slate-400 rounded-xl px-3 py-2 border border-sky-200 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
            />
            <button
              onClick={handleSendComment}
              disabled={!commentInput.trim() || commentSending}
              className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 disabled:opacity-50 transition-colors"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
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
  const inProgressCount = dayTasks.filter((t) => t.status === "진행 중").length;
  const achieveRate =
    dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

  return (
    <aside className="w-72 min-w-72 h-screen bg-white flex flex-col border-l border-sky-100 shadow-sm">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-sky-100 shrink-0">
        <h3 className="text-base font-bold text-slate-800 mb-0.5">
          {formatSelectedDate(selectedDate)}
        </h3>

        {dayTasks.length > 0 ? (
          <>
            {/* 카운트 요약 */}
            <div className="flex items-center gap-3 mb-3 mt-1">
              <span className="text-xs text-slate-400">
                전체 <span className="font-bold text-slate-600">{dayTasks.length}</span>
              </span>
              {inProgressCount > 0 && (
                <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                  <Clock size={10} /> {inProgressCount}
                </span>
              )}
              <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 size={10} /> {completedCount}
              </span>
            </div>

            {/* 달성률 바 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">달성률</span>
                <span className="text-sky-500 font-bold">{achieveRate}%</span>
              </div>
              <div className="h-1.5 bg-sky-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${achieveRate}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-400 mt-0.5">등록된 일정이 없어요</p>
        )}
      </div>

      {/* To-do 리스트 */}
      <div className="flex-1 overflow-y-auto py-2">
        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-16">
            <div className="w-14 h-14 rounded-3xl bg-sky-50 border-2 border-sky-100 flex items-center justify-center text-2xl">
              📅
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">이 날엔 일정이 없어요</p>
              <p className="text-xs text-slate-400">아래 버튼으로 추가해보세요</p>
            </div>
          </div>
        ) : (
          <div className="px-2">
            {/* 예정 */}
            {dayTasks.filter((t) => t.status === "예정").length > 0 && (
              <div className="mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                  예정
                </p>
                {dayTasks
                  .filter((t) => t.status === "예정")
                  .map((task) => {
                    const member = getMember(task.memberId);
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        memberColor={member?.color ?? "#94a3b8"}
                        memberName={member?.name ?? "멤버"}
                        memberEmoji={member?.profileEmoji}
                        isOwner={task.memberId === currentUserId}
                        currentUserId={currentUserId}
                        currentUserName={getMember(currentUserId)?.name ?? "나"}
                        getMemberColor={getMemberColor}
                        getMemberEmoji={getMemberEmoji}
                        onStatusChange={onStatusChange}
                      />
                    );
                  })}
              </div>
            )}

            {/* 진행 중 */}
            {dayTasks.filter((t) => t.status === "진행 중").length > 0 && (
              <div className="mb-1">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-3 py-1.5">
                  진행 중
                </p>
                {dayTasks
                  .filter((t) => t.status === "진행 중")
                  .map((task) => {
                    const member = getMember(task.memberId);
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        memberColor={member?.color ?? "#94a3b8"}
                        memberName={member?.name ?? "멤버"}
                        memberEmoji={member?.profileEmoji}
                        isOwner={task.memberId === currentUserId}
                        currentUserId={currentUserId}
                        currentUserName={getMember(currentUserId)?.name ?? "나"}
                        getMemberColor={getMemberColor}
                        getMemberEmoji={getMemberEmoji}
                        onStatusChange={onStatusChange}
                      />
                    );
                  })}
              </div>
            )}

            {/* 완료 */}
            {dayTasks.filter((t) => t.status === "완료").length > 0 && (
              <div className="mb-1">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-3 py-1.5">
                  완료
                </p>
                {dayTasks
                  .filter((t) => t.status === "완료")
                  .map((task) => {
                    const member = getMember(task.memberId);
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        memberColor={member?.color ?? "#94a3b8"}
                        memberName={member?.name ?? "멤버"}
                        memberEmoji={member?.profileEmoji}
                        isOwner={task.memberId === currentUserId}
                        currentUserId={currentUserId}
                        currentUserName={getMember(currentUserId)?.name ?? "나"}
                        getMemberColor={getMemberColor}
                        getMemberEmoji={getMemberEmoji}
                        onStatusChange={onStatusChange}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 할 일 추가 버튼 */}
      <div className="px-4 py-4 border-t border-sky-100 shrink-0">
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white text-sm font-bold transition-all duration-150 shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5"
        >
          <Plus size={15} />
          할 일 추가
        </button>
      </div>
    </aside>
  );
}
