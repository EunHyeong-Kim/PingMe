export type TaskStatus = "예정" | "진행 중" | "완료";

export interface Group {
  id: string;
  name: string;
  profileEmoji: string;
  ownerId: string;
  inviteCode: string;
  createdAt: number;
}

export interface MemberConfig {
  userId: string;
  groupId: string;
  displayName: string;
  chosenColor: string;
  role: "owner" | "member";
  profileEmoji?: string;
}

export interface Task {
  id: string;
  groupId: string;
  authorId: string;
  text: string;
  date: string;      // 시작일 "YYYY-MM-DD"
  endDate?: string;  // 종료일 (없으면 단일 날짜)
  status: TaskStatus;
  createdAt: number;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
}

export type ReactionType = "좋아요" | "슬퍼요" | "응원해요" | "웃겨요" | "화나요";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number; // 완료 처리된 시각 (미완료 시 undefined)
  reactions?: Partial<Record<ReactionType, string[]>>;
}

export interface TodoCategory {
  id: string;
  name: string;
  items: TodoItem[];
  pinned?: boolean;
  pinnedAt?: number;
}

export interface PersonalTodoList {
  userId: string;
  groupId: string;
  categories: TodoCategory[];
}

export interface GroupTodoList {
  groupId: string;
  categories: TodoCategory[];
}
