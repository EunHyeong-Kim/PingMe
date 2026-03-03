"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Plus, Trash2, Check, Pencil, Lock } from "lucide-react";
import { subscribePersonalTodoList, savePersonalTodoList } from "@/lib/firestore";
import { PersonalTodoList, TodoCategory, TodoItem, ReactionType } from "@/lib/types";

interface GroupMember {
  id: string;
  name: string;
  color: string;
  profileEmoji?: string;
}

interface PersonalTodoViewProps {
  targetUserId: string;
  targetUserName: string;
  targetUserColor: string;
  targetUserEmoji?: string;
  groupId: string;
  isOwner: boolean;
  currentUserId: string;
  members: GroupMember[];
  onMemberClick: (memberId: string) => void;
  onBack: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "좋아요",  emoji: "❤️",  label: "좋아요"  },
  { type: "슬퍼요",  emoji: "😢",  label: "슬퍼요"  },
  { type: "응원해요", emoji: "💪", label: "응원해요" },
  { type: "웃겨요",  emoji: "😂",  label: "웃겨요"  },
  { type: "화나요",  emoji: "😡",  label: "화나요"  },
];

// 반응 피커 컴포넌트 — Portal로 body에 마운트해 overflow clip / stacking context 문제 방지
function ReactionPicker({
  item,
  anchorRect,
  currentUserId,
  onToggle,
  onClose,
}: {
  item: TodoItem;
  anchorRect: DOMRect;
  currentUserId: string;
  onToggle: (type: ReactionType) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // 피커 높이 약 52px + 말풍선 꼬리 8px = 60px 위에 표시
  const PICKER_H = 60;
  const top = anchorRect.top + window.scrollY - PICKER_H;
  const centerX = anchorRect.left + anchorRect.width / 2 + window.scrollX;

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-100 px-3 py-2 flex items-center gap-1.5"
      style={{
        top,
        left: centerX,
        transform: "translateX(-50%)",
        filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.14))",
      }}
    >
      {/* 말풍선 꼬리 */}
      <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r border-b border-slate-100 rotate-45" />
      {REACTIONS.map(({ type, emoji, label }) => {
        const myReacted = (item.reactions?.[type] ?? []).includes(currentUserId);
        return (
          <button
            key={type}
            onClick={(e) => { e.stopPropagation(); onToggle(type); }}
            title={label}
            className={`text-2xl transition-transform hover:scale-125 active:scale-110 rounded-xl p-0.5 ${
              myReacted ? "bg-sky-50 ring-2 ring-sky-300" : ""
            }`}
          >
            {emoji}
          </button>
        );
      })}
    </div>,
    document.body
  );
}

// 반응 카운트 표시
function ReactionBar({ reactions, currentUserId }: { reactions: TodoItem["reactions"]; currentUserId: string }) {
  if (!reactions) return null;
  const entries = REACTIONS.map(({ type, emoji }) => ({
    type, emoji,
    users: reactions[type] ?? [],
  })).filter((r) => r.users.length > 0);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {entries.map(({ type, emoji, users }) => {
        const mine = users.includes(currentUserId);
        return (
          <span
            key={type}
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full border transition-all ${
              mine
                ? "bg-sky-50 border-sky-300 text-sky-600"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            {emoji} {users.length}
          </span>
        );
      })}
    </div>
  );
}

export default function PersonalTodoView({
  targetUserId,
  targetUserName,
  targetUserColor,
  targetUserEmoji,
  groupId,
  isOwner,
  currentUserId,
  members,
  onMemberClick,
  onBack,
}: PersonalTodoViewProps) {
  const [list, setList] = useState<PersonalTodoList | null>(null);
  const [loading, setLoading] = useState(true);

  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState("");

  // 반응 피커: id + 앵커 위치
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null);
  const [reactionAnchorRect, setReactionAnchorRect] = useState<DOMRect | null>(null);

  const newItemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribePersonalTodoList(targetUserId, groupId, (fetched) => {
      setList(fetched ?? { userId: targetUserId, groupId, categories: [] });
      setLoading(false);
    });
    return () => unsub();
  }, [targetUserId, groupId]);

  const save = async (updated: PersonalTodoList) => {
    setList(updated);
    await savePersonalTodoList(updated);
  };

  // ── 카테고리 ──────────────────────────

  const addCategory = async () => {
    if (!newCatName.trim() || !list) return;
    const cat: TodoCategory = { id: generateId(), name: newCatName.trim(), items: [] };
    await save({ ...list, categories: [...list.categories, cat] });
    setNewCatName("");
    setShowAddCat(false);
  };

  const deleteCategory = async (catId: string) => {
    if (!list) return;
    await save({ ...list, categories: list.categories.filter((c) => c.id !== catId) });
  };

  const renameCategory = async (catId: string) => {
    if (!editingCatName.trim() || !list) return;
    await save({
      ...list,
      categories: list.categories.map((c) =>
        c.id === catId ? { ...c, name: editingCatName.trim() } : c
      ),
    });
    setEditingCatId(null);
  };

  // ── 아이템 ──────────────────────────

  const addItem = async (catId: string) => {
    if (!newItemText.trim() || !list) return;
    const item: TodoItem = {
      id: generateId(),
      text: newItemText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    await save({
      ...list,
      categories: list.categories.map((c) =>
        c.id === catId ? { ...c, items: [...c.items, item] } : c
      ),
    });
    setNewItemText("");
    setAddingItemCatId(null);
  };

  const toggleItem = async (catId: string, itemId: string) => {
    if (!list || !isOwner) return;
    await save({
      ...list,
      categories: list.categories.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, completed: !i.completed } : i) }
          : c
      ),
    });
  };

  const deleteItem = async (catId: string, itemId: string) => {
    if (!list) return;
    await save({
      ...list,
      categories: list.categories.map((c) =>
        c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      ),
    });
  };

  const saveItemEdit = async (catId: string, itemId: string) => {
    if (!editingItemText.trim() || !list) return;
    await save({
      ...list,
      categories: list.categories.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, text: editingItemText.trim() } : i) }
          : c
      ),
    });
    setEditingItemId(null);
  };

  // ── 반응 ──────────────────────────

  const toggleReaction = async (catId: string, itemId: string, type: ReactionType) => {
    if (!list) return;
    await save({
      ...list,
      categories: list.categories.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          items: c.items.map((i) => {
            if (i.id !== itemId) return i;
            const prev = i.reactions?.[type] ?? [];
            const alreadyReacted = prev.includes(currentUserId);
            const updated = alreadyReacted
              ? prev.filter((uid) => uid !== currentUserId)
              : [...prev, currentUserId];
            return {
              ...i,
              reactions: { ...i.reactions, [type]: updated },
            };
          }),
        };
      }),
    });
    setReactionPickerId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-sky-50/50 overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-5 bg-white border-b border-sky-100 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-500 hover:bg-sky-100 transition-all"
            title="달력으로 돌아가기"
          >
            <ArrowLeft size={15} />
          </button>
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
            style={{ backgroundColor: targetUserColor, fontSize: targetUserEmoji ? "1.2rem" : "1rem" }}
          >
            {targetUserEmoji || targetUserName[0]}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">{targetUserName}의 투두리스트</h2>
            {!isOwner && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-xs font-semibold">
                <Lock size={10} />
                읽기 전용
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 그룹원 탭 — 클릭 시 해당 멤버 투두로 이동 */}
          {members.length > 0 && (
            <div className="flex items-center gap-1 bg-sky-50 rounded-xl px-3 py-1.5 border border-sky-100">
              {members.map((m) => {
                const isActive = m.id === targetUserId;
                return (
                  <button
                    key={m.id}
                    onClick={() => { if (!isActive) onMemberClick(m.id); }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all group/member ${
                      isActive
                        ? "bg-white shadow-sm cursor-default"
                        : "hover:bg-white hover:shadow-sm"
                    }`}
                    title={`${m.name}의 투두리스트`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: m.color }} />
                    <span
                      className={`text-xs font-medium transition-colors ${
                        isActive ? "text-slate-700 font-semibold" : "text-slate-500 group-hover/member:text-slate-700"
                      }`}
                    >
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 카테고리 추가 버튼 (오너만) */}
          {isOwner && !showAddCat && (
            <button
              onClick={() => setShowAddCat(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-500 hover:bg-sky-100 text-sm font-semibold transition-all"
            >
              <Plus size={14} />
              새 카테고리
            </button>
          )}
        </div>
      </div>

      {/* 컨텐츠 */}
      {loading ? (
        <div className="flex items-center justify-center flex-1 text-slate-400 text-sm">
          불러오는 중...
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-5 h-full items-start min-w-max">

            {/* 카테고리 컬럼들 */}
            {(list?.categories ?? []).map((cat) => {
              const doneCount = cat.items.filter((i) => i.completed).length;
              return (
                <div
                  key={cat.id}
                  className="w-64 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col"
                  style={{ maxHeight: "calc(100vh - 160px)" }}
                >
                  {/* 카테고리 헤더 */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    {editingCatId === cat.id && isOwner ? (
                      <input
                        autoFocus
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameCategory(cat.id);
                          if (e.key === "Escape") setEditingCatId(null);
                        }}
                        onBlur={() => renameCategory(cat.id)}
                        className="flex-1 text-sm font-bold text-slate-700 bg-sky-50 rounded-lg px-2 py-1 border border-sky-300 focus:outline-none"
                      />
                    ) : (
                      <button
                        className={`flex-1 text-left flex items-center gap-2 ${isOwner ? "hover:text-sky-500" : ""} transition-colors`}
                        onClick={() => {
                          if (!isOwner) return;
                          setEditingCatId(cat.id);
                          setEditingCatName(cat.name);
                        }}
                        disabled={!isOwner}
                      >
                        <span className="text-sm font-bold text-slate-700 truncate">{cat.name}</span>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5 shrink-0">
                          {cat.items.length}
                        </span>
                      </button>
                    )}

                    {isOwner && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setAddingItemCatId(cat.id);
                            setNewItemText("");
                            setTimeout(() => newItemRef.current?.focus(), 50);
                          }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-all"
                          title="항목 추가"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-400 transition-all"
                          title="카테고리 삭제"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 아이템 목록 */}
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                    {cat.items.map((item) => {
                      const pickerId = `${cat.id}:${item.id}`;
                      const isPickerOpen = reactionPickerId === pickerId;

                      return (
                        <div
                          key={item.id}
                          className="group/item relative bg-white rounded-xl border border-slate-100 px-3 py-2.5 hover:border-slate-200 hover:shadow-sm transition-all"
                        >
                          {/* 반응 피커 */}
                          {isPickerOpen && reactionAnchorRect && (
                            <ReactionPicker
                              item={item}
                              anchorRect={reactionAnchorRect}
                              currentUserId={currentUserId}
                              onToggle={(type) => toggleReaction(cat.id, item.id, type)}
                              onClose={() => { setReactionPickerId(null); setReactionAnchorRect(null); }}
                            />
                          )}

                          {editingItemId === item.id && isOwner ? (
                            <div className="flex gap-2">
                              <input
                                autoFocus
                                value={editingItemText}
                                onChange={(e) => setEditingItemText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveItemEdit(cat.id, item.id);
                                  if (e.key === "Escape") setEditingItemId(null);
                                }}
                                className="flex-1 text-xs text-slate-700 bg-sky-50 rounded-lg px-2 py-1 border border-sky-300 focus:outline-none"
                              />
                              <button
                                onClick={() => saveItemEdit(cat.id, item.id)}
                                className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600"
                              >
                                <Check size={11} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start gap-2">
                                <button
                                  onClick={() => toggleItem(cat.id, item.id)}
                                  disabled={!isOwner}
                                  className={`mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                    item.completed
                                      ? "bg-emerald-400 border-emerald-400"
                                      : "border-slate-300 hover:border-sky-400"
                                  }`}
                                >
                                  {item.completed && <Check size={9} className="text-white" strokeWidth={3} />}
                                </button>

                                {/* 텍스트: 비소유자는 클릭 시 반응 피커 */}
                                <button
                                  className={`flex-1 text-left text-xs leading-relaxed break-words ${
                                    item.completed ? "line-through text-slate-300" : "text-slate-700"
                                  } ${!isOwner ? "cursor-pointer hover:text-slate-500 transition-colors" : "cursor-default"}`}
                                  onClick={(e) => {
                                    if (isOwner) return;
                                    if (isPickerOpen) {
                                      setReactionPickerId(null);
                                      setReactionAnchorRect(null);
                                    } else {
                                      setReactionPickerId(pickerId);
                                      setReactionAnchorRect((e.currentTarget as HTMLElement).getBoundingClientRect());
                                    }
                                  }}
                                >
                                  {item.text}
                                </button>

                                {isOwner && (
                                  <div className="flex gap-0.5 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => { setEditingItemId(item.id); setEditingItemText(item.text); }}
                                      className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-sky-400 transition-colors"
                                    >
                                      <Pencil size={10} />
                                    </button>
                                    <button
                                      onClick={() => deleteItem(cat.id, item.id)}
                                      className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-rose-400 transition-colors"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* 반응 카운트 */}
                              <ReactionBar reactions={item.reactions} currentUserId={currentUserId} />
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* 아이템 추가 입력 */}
                    {addingItemCatId === cat.id && isOwner && (
                      <div className="bg-sky-50 rounded-xl border border-sky-200 px-3 py-2">
                        <input
                          ref={newItemRef}
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addItem(cat.id);
                            if (e.key === "Escape") setAddingItemCatId(null);
                          }}
                          placeholder="할 일 입력 후 Enter"
                          className="w-full text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-400"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => setAddingItemCatId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => addItem(cat.id)}
                            disabled={!newItemText.trim()}
                            className="text-xs text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-50 px-2.5 py-0.5 rounded-lg transition-all"
                          >
                            추가
                          </button>
                        </div>
                      </div>
                    )}

                    {cat.items.length === 0 && addingItemCatId !== cat.id && (
                      <p className="text-xs text-slate-300 text-center py-4">
                        {isOwner ? "+ 버튼으로 추가하세요" : "항목이 없어요"}
                      </p>
                    )}
                  </div>

                  {/* 완료 카운트 */}
                  {doneCount > 0 && (
                    <div className="px-4 py-2 border-t border-slate-100 shrink-0">
                      <span className="text-[10px] text-emerald-500 font-semibold">
                        {doneCount}/{cat.items.length} 완료
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 카테고리 추가 폼 */}
            {isOwner && showAddCat && (
              <div className="w-64 shrink-0 bg-white rounded-2xl border border-sky-200 shadow-sm px-4 py-3">
                <input
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCategory();
                    if (e.key === "Escape") { setShowAddCat(false); setNewCatName(""); }
                  }}
                  placeholder="카테고리 이름"
                  className="w-full text-sm text-slate-700 bg-sky-50 rounded-xl px-3 py-2 border border-sky-200 focus:outline-none focus:border-sky-400 mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCategory}
                    disabled={!newCatName.trim()}
                    className="flex-1 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 disabled:opacity-50 transition-all"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => { setShowAddCat(false); setNewCatName(""); }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold hover:bg-slate-200 transition-all"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 빈 상태 */}
            {(list?.categories ?? []).length === 0 && !showAddCat && (
              <div className="flex items-center justify-center w-full py-24 text-slate-400 text-sm">
                {isOwner ? "상단 '새 카테고리' 버튼으로 시작하세요" : "아직 투두리스트가 없어요"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
