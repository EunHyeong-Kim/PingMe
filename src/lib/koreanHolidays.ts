// 대한민국 공휴일 데이터 (행정안전부 고시 기준)
// 음력 기반 명절은 매년 재계산 필요

export interface KoreanHoliday {
  date: string; // "YYYY-MM-DD"
  name: string;
  type: "공휴일" | "명절" | "대체휴일";
}

export const KOREAN_HOLIDAYS: KoreanHoliday[] = [
  // ─── 2024 ───
  { date: "2024-01-01", name: "신정", type: "공휴일" },
  { date: "2024-02-09", name: "설날 연휴", type: "명절" },
  { date: "2024-02-10", name: "설날", type: "명절" },
  { date: "2024-02-11", name: "설날 연휴", type: "명절" },
  { date: "2024-02-12", name: "대체 휴일", type: "대체휴일" },
  { date: "2024-03-01", name: "삼일절", type: "공휴일" },
  { date: "2024-05-05", name: "어린이날", type: "공휴일" },
  { date: "2024-05-06", name: "대체 휴일", type: "대체휴일" },
  { date: "2024-05-15", name: "부처님 오신 날", type: "공휴일" },
  { date: "2024-06-06", name: "현충일", type: "공휴일" },
  { date: "2024-08-15", name: "광복절", type: "공휴일" },
  { date: "2024-09-16", name: "추석 연휴", type: "명절" },
  { date: "2024-09-17", name: "추석", type: "명절" },
  { date: "2024-09-18", name: "추석 연휴", type: "명절" },
  { date: "2024-10-03", name: "개천절", type: "공휴일" },
  { date: "2024-10-09", name: "한글날", type: "공휴일" },
  { date: "2024-12-25", name: "성탄절", type: "공휴일" },

  // ─── 2025 ───
  { date: "2025-01-01", name: "신정", type: "공휴일" },
  { date: "2025-01-28", name: "설날 연휴", type: "명절" },
  { date: "2025-01-29", name: "설날", type: "명절" },
  { date: "2025-01-30", name: "설날 연휴", type: "명절" },
  { date: "2025-03-01", name: "삼일절", type: "공휴일" },
  { date: "2025-03-03", name: "대체 휴일 (삼일절)", type: "대체휴일" },
  { date: "2025-05-05", name: "어린이날", type: "공휴일" },
  { date: "2025-05-06", name: "대체 휴일 (부처님 오신 날)", type: "대체휴일" },
  { date: "2025-06-06", name: "현충일", type: "공휴일" },
  { date: "2025-08-15", name: "광복절", type: "공휴일" },
  { date: "2025-10-03", name: "개천절", type: "공휴일" },
  { date: "2025-10-05", name: "추석 연휴", type: "명절" },
  { date: "2025-10-06", name: "추석", type: "명절" },
  { date: "2025-10-07", name: "추석 연휴", type: "명절" },
  { date: "2025-10-08", name: "대체 휴일 (추석)", type: "대체휴일" },
  { date: "2025-10-09", name: "한글날", type: "공휴일" },
  { date: "2025-12-25", name: "성탄절", type: "공휴일" },

  // ─── 2026 ───
  { date: "2026-01-01", name: "신정", type: "공휴일" },
  { date: "2026-02-16", name: "설날 연휴", type: "명절" },
  { date: "2026-02-17", name: "설날", type: "명절" },
  { date: "2026-02-18", name: "설날 연휴", type: "명절" },
  { date: "2026-03-01", name: "삼일절", type: "공휴일" },
  { date: "2026-03-02", name: "대체 휴일 (삼일절)", type: "대체휴일" },
  { date: "2026-05-05", name: "어린이날", type: "공휴일" },
  { date: "2026-05-23", name: "부처님 오신 날", type: "공휴일" },
  { date: "2026-05-25", name: "대체 휴일 (부처님 오신 날)", type: "대체휴일" },
  { date: "2026-06-06", name: "현충일", type: "공휴일" },
  { date: "2026-06-08", name: "대체 휴일 (현충일)", type: "대체휴일" },
  { date: "2026-08-15", name: "광복절", type: "공휴일" },
  { date: "2026-08-17", name: "대체 휴일 (광복절)", type: "대체휴일" },
  { date: "2026-09-24", name: "추석 연휴", type: "명절" },
  { date: "2026-09-25", name: "추석", type: "명절" },
  { date: "2026-09-26", name: "추석 연휴", type: "명절" },
  { date: "2026-09-28", name: "대체 휴일 (추석)", type: "대체휴일" },
  { date: "2026-10-03", name: "개천절", type: "공휴일" },
  { date: "2026-10-05", name: "대체 휴일 (개천절)", type: "대체휴일" },
  { date: "2026-10-09", name: "한글날", type: "공휴일" },
  { date: "2026-12-25", name: "성탄절", type: "공휴일" },

  // ─── 2027 ───
  { date: "2027-01-01", name: "신정", type: "공휴일" },
  { date: "2027-02-06", name: "설날 연휴", type: "명절" },
  { date: "2027-02-07", name: "설날", type: "명절" },
  { date: "2027-02-08", name: "설날 연휴", type: "명절" },
  { date: "2027-03-01", name: "삼일절", type: "공휴일" },
  { date: "2027-05-05", name: "어린이날", type: "공휴일" },
  { date: "2027-05-13", name: "부처님 오신 날", type: "공휴일" },
  { date: "2027-06-06", name: "현충일", type: "공휴일" },
  { date: "2027-06-07", name: "대체 휴일 (현충일)", type: "대체휴일" },
  { date: "2027-08-15", name: "광복절", type: "공휴일" },
  { date: "2027-08-16", name: "대체 휴일 (광복절)", type: "대체휴일" },
  { date: "2027-09-14", name: "추석 연휴", type: "명절" },
  { date: "2027-09-15", name: "추석", type: "명절" },
  { date: "2027-09-16", name: "추석 연휴", type: "명절" },
  { date: "2027-10-03", name: "개천절", type: "공휴일" },
  { date: "2027-10-04", name: "대체 휴일 (개천절)", type: "대체휴일" },
  { date: "2027-10-09", name: "한글날", type: "공휴일" },
  { date: "2027-10-11", name: "대체 휴일 (한글날)", type: "대체휴일" },
  { date: "2027-12-25", name: "성탄절", type: "공휴일" },
  { date: "2027-12-27", name: "대체 휴일 (성탄절)", type: "대체휴일" },
];

// 날짜 문자열로 공휴일 조회
const holidayMap = new Map<string, KoreanHoliday>(
  KOREAN_HOLIDAYS.map((h) => [h.date, h])
);

export function getHoliday(dateStr: string): KoreanHoliday | undefined {
  return holidayMap.get(dateStr);
}

export function isHoliday(dateStr: string): boolean {
  return holidayMap.has(dateStr);
}
