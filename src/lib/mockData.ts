import { Group, Task } from "./types";

export const MOCK_GROUPS: Group[] = [
  {
    id: "g1",
    name: "새벽 스터디",
    profileEmoji: "📚",
    ownerId: "mock-owner-1",
    inviteCode: "STUDY01",
    createdAt: 1700000000000,
  },
  {
    id: "g2",
    name: "운동 크루",
    profileEmoji: "💪",
    ownerId: "mock-owner-2",
    inviteCode: "GYM001",
    createdAt: 1700000001000,
  },
  {
    id: "g3",
    name: "사이드 프로젝트",
    profileEmoji: "🚀",
    ownerId: "mock-owner-3",
    inviteCode: "SIDE01",
    createdAt: 1700000002000,
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    groupId: "g1",
    authorId: "m1",
    text: "알고리즘 문제 3개 풀기",
    date: "2026-02-27",
    status: "완료",
    createdAt: 1700000010000,
  },
  {
    id: "t2",
    groupId: "g1",
    authorId: "m2",
    text: "React 공식 문서 정리",
    date: "2026-02-27",
    status: "진행 중",
    createdAt: 1700000011000,
  },
  {
    id: "t3",
    groupId: "g1",
    authorId: "m3",
    text: "운동 1시간",
    date: "2026-02-27",
    status: "예정",
    createdAt: 1700000012000,
  },
  {
    id: "t4",
    groupId: "g1",
    authorId: "m4",
    text: "영어 단어 50개 암기",
    date: "2026-02-27",
    status: "예정",
    createdAt: 1700000013000,
  },
];
