export type TaskStatus = "예정" | "진행 중" | "완료";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
}

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
  date: string; // "YYYY-MM-DD"
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

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface TodoCategory {
  id: string;
  name: string;
  items: TodoItem[];
}

export interface PersonalTodoList {
  userId: string;
  groupId: string;
  categories: TodoCategory[];
}
