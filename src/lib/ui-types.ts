import { TaskStatus } from "./types";

export interface UIMember {
  id: string;
  name: string;
  color: string;
  profileEmoji?: string;
}

export interface UIGroup {
  id: string;
  name: string;
  profileImg: string;
  members: UIMember[];
}

export interface UITask {
  id: string;
  memberId: string;
  text: string;
  date: string;
  endDate?: string;
  status: TaskStatus;
}
