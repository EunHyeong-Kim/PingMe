import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { Group, MemberConfig, Task, TaskStatus, Comment, PersonalTodoList } from "./types";

// 6자리 랜덤 초대 코드 생성
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ────────────────────────────────────────────
// 그룹
// ────────────────────────────────────────────

export async function createGroup(
  ownerId: string,
  ownerName: string,
  ownerColor: string,
  name: string,
  profileEmoji: string
): Promise<Group> {
  const inviteCode = generateInviteCode();
  const groupRef = doc(collection(db, "groups"));
  const group: Group = {
    id: groupRef.id,
    name,
    profileEmoji,
    ownerId,
    inviteCode,
    createdAt: Date.now(),
  };
  await setDoc(groupRef, group);

  // 그룹장 MemberConfig 자동 등록
  await setMemberConfig({
    userId: ownerId,
    groupId: groupRef.id,
    displayName: ownerName,
    chosenColor: ownerColor,
    role: "owner",
  });

  return group;
}

export async function joinGroupByCode(
  userId: string,
  userName: string,
  chosenColor: string,
  inviteCode: string
): Promise<Group> {
  const q = query(collection(db, "groups"), where("inviteCode", "==", inviteCode.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("존재하지 않는 초대 코드입니다.");

  const group = snap.docs[0].data() as Group;

  // 이미 가입했는지 확인
  const existing = await getMemberConfig(userId, group.id);
  if (existing) throw new Error("이미 참여 중인 그룹입니다.");

  await setMemberConfig({
    userId,
    groupId: group.id,
    displayName: userName,
    chosenColor,
    role: "member",
  });

  return group;
}

export async function getMyGroups(userId: string): Promise<Group[]> {
  const q = query(collection(db, "memberConfigs"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const groupIds = snap.docs.map((d) => d.data().groupId as string);
  if (groupIds.length === 0) return [];

  const groups: Group[] = [];
  for (const gid of groupIds) {
    const gSnap = await getDoc(doc(db, "groups", gid));
    if (gSnap.exists()) groups.push(gSnap.data() as Group);
  }
  return groups;
}

// ────────────────────────────────────────────
// 멤버 설정
// ────────────────────────────────────────────

export async function setMemberConfig(config: MemberConfig): Promise<void> {
  const id = `${config.groupId}_${config.userId}`;
  await setDoc(doc(db, "memberConfigs", id), config);
}

export async function getMemberConfig(
  userId: string,
  groupId: string
): Promise<MemberConfig | null> {
  const id = `${groupId}_${userId}`;
  const snap = await getDoc(doc(db, "memberConfigs", id));
  return snap.exists() ? (snap.data() as MemberConfig) : null;
}

export async function updateMemberColor(groupId: string, userId: string, chosenColor: string): Promise<void> {
  const id = `${groupId}_${userId}`;
  await updateDoc(doc(db, "memberConfigs", id), { chosenColor });
}

export async function updateMemberEmoji(groupId: string, userId: string, profileEmoji: string): Promise<void> {
  const id = `${groupId}_${userId}`;
  await updateDoc(doc(db, "memberConfigs", id), { profileEmoji });
}

export async function updateAllMemberDisplayNames(userId: string, displayName: string): Promise<void> {
  const q = query(collection(db, "memberConfigs"), where("userId", "==", userId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { displayName })));
}

export async function getGroupMembers(groupId: string): Promise<MemberConfig[]> {
  const q = query(collection(db, "memberConfigs"), where("groupId", "==", groupId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as MemberConfig);
}

export function subscribeGroupMembers(
  groupId: string,
  callback: (members: MemberConfig[]) => void
): Unsubscribe {
  const q = query(collection(db, "memberConfigs"), where("groupId", "==", groupId));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => d.data() as MemberConfig));
    },
    (error) => {
      console.error("[Ping] subscribeGroupMembers 오류:", error.code, error.message);
    }
  );
}

// ────────────────────────────────────────────
// 할 일 (Tasks)
// ────────────────────────────────────────────

export async function addTask(
  groupId: string,
  authorId: string,
  text: string,
  date: string
): Promise<Task> {
  const ref = doc(collection(db, "tasks"));
  const task: Task = {
    id: ref.id,
    groupId,
    authorId,
    text,
    date,
    status: "예정",
    createdAt: Date.now(),
  };
  await setDoc(ref, task);
  return task;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  await updateDoc(doc(db, "tasks", taskId), { status });
}

export async function editTask(taskId: string, text: string, date: string): Promise<void> {
  await updateDoc(doc(db, "tasks", taskId), { text, date });
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, "tasks", taskId));
}

export function subscribeGroupTasks(
  groupId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "tasks"),
    where("groupId", "==", groupId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs
        .map((d) => d.data() as Task)
        .sort((a, b) => a.createdAt - b.createdAt);
      callback(tasks);
    },
    (error) => {
      console.error("[Ping] subscribeGroupTasks 오류:", error.code, error.message);
    }
  );
}

// ────────────────────────────────────────────
// 댓글 (Comments)
// ────────────────────────────────────────────

export async function addComment(
  taskId: string,
  authorId: string,
  authorName: string,
  content: string
): Promise<void> {
  await addDoc(collection(db, "comments"), {
    taskId,
    authorId,
    authorName,
    content,
    createdAt: Date.now(),
  });
}

// ────────────────────────────────────────────
// 개인 투두 리스트
// ────────────────────────────────────────────

export function subscribePersonalTodoList(
  userId: string,
  groupId: string,
  callback: (list: PersonalTodoList | null) => void
): Unsubscribe {
  const id = `${userId}_${groupId}`;
  return onSnapshot(doc(db, "personalTodos", id), (snap) => {
    callback(snap.exists() ? (snap.data() as PersonalTodoList) : null);
  });
}

export async function savePersonalTodoList(list: PersonalTodoList): Promise<void> {
  const id = `${list.userId}_${list.groupId}`;
  await setDoc(doc(db, "personalTodos", id), list);
}

export function subscribeComments(
  taskId: string,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "comments"),
    where("taskId", "==", taskId)
  );
  return onSnapshot(q, (snap) => {
    const comments = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Comment))
      .sort((a, b) => a.createdAt - b.createdAt);
    callback(comments);
  });
}
