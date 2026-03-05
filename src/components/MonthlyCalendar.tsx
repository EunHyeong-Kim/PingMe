"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UIGroup, UITask } from "@/lib/ui-types";
import { getHoliday } from "@/lib/koreanHolidays";

interface MonthlyCalendarProps {
  group: UIGroup;
  tasks: UITask[];
  currentDate: Date;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMemberClick?: (memberId: string) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function MonthlyCalendar({
  group,
  tasks,
  currentDate,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onMemberClick,
}: MonthlyCalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = useMemo(() => {
    const d = new Date();
    return formatDate(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { day: number; currentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      days.push({ day: d, currentMonth: false, dateStr: formatDate(year, month - 1, d) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, currentMonth: true, dateStr: formatDate(year, month, d) });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, currentMonth: false, dateStr: formatDate(year, month + 1, d) });
    }
    return days;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, { task: UITask; isContinuation: boolean }[]> = {};

    tasks.forEach((task) => {
      const start = task.date;
      const end = task.endDate ?? task.date;

      // 시작일~종료일 사이 모든 날짜에 등록
      const cur = new Date(start + "T00:00:00");
      const endD = new Date(end + "T00:00:00");
      let first = true;
      while (cur <= endD) {
        const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
        if (!map[key]) map[key] = [];
        map[key].push({ task, isContinuation: !first });
        first = false;
        cur.setDate(cur.getDate() + 1);
      }
    });

    Object.keys(map).forEach((date) => {
      map[date].sort((a, b) => (a.task.status === "완료" ? 1 : 0) - (b.task.status === "완료" ? 1 : 0));
    });
    return map;
  }, [tasks]);

  const getMemberColor = (memberId: string) =>
    group.members.find((m) => m.id === memberId)?.color ?? "#94a3b8";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-sky-50/50">
      {/* 캘린더 헤더 */}
      <div className="px-4 md:px-6 py-3 md:py-5 bg-white border-b border-sky-100 shrink-0 shadow-sm">
        {/* 1행: 년월 + 이전/다음 */}
        <div className="flex items-center justify-between mb-2 md:mb-0">
          <div>
            <h2 className="text-base md:text-xl font-bold text-slate-800">
              {year}년 {month + 1}월
            </h2>
            <p className="text-xs text-sky-500 font-medium mt-0.5 hidden md:block">{group.name}의 일정</p>
          </div>

          <div className="flex items-center gap-2">
            {/* 투두 탭 — 모바일에서는 이모지+이름 생략하고 아이콘만 */}
            <div className="flex items-center gap-0.5 md:gap-1 bg-sky-50 rounded-xl px-2 md:px-3 py-1.5 border border-sky-100 overflow-x-auto max-w-[55vw] md:max-w-none">
              <button
                onClick={() => onMemberClick?.("__group__")}
                className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 rounded-lg hover:bg-white hover:shadow-sm transition-all shrink-0"
                title={`${group.name} 공용 투두리스트`}
              >
                <span className="text-sm leading-none">{group.profileImg || group.name[0]}</span>
                <span className="hidden md:inline text-xs text-slate-600 font-semibold">{group.name}</span>
              </button>

              <div className="w-px h-4 bg-slate-200 mx-0.5 md:mx-1 shrink-0" />

              {group.members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onMemberClick?.(m.id)}
                  className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 rounded-lg hover:bg-white hover:shadow-sm transition-all shrink-0"
                  title={`${m.name}의 투두리스트`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="hidden md:inline text-xs text-slate-500 font-medium">{m.name}</span>
                  <span className="md:hidden text-[10px] text-slate-600 font-semibold">{m.name[0]}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button onClick={onPrevMonth} className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-500 hover:bg-sky-100 transition-all shadow-sm">
                <ChevronLeft size={14} />
              </button>
              <button onClick={onNextMonth} className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-500 hover:bg-sky-100 transition-all shadow-sm">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-2 md:px-5 pt-2 md:pt-4 shrink-0">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-xs font-bold py-1.5 ${
              i === 0 ? "text-rose-400" : i === 6 ? "text-sky-400" : "text-slate-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1 md:gap-2 px-2 md:px-5 pb-2 md:pb-5 pt-1 md:pt-2">
        {calendarDays.map(({ day, currentMonth, dateStr }, idx) => {
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dayEntries = tasksByDate[dateStr] ?? [];
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;
          const isSunday = idx % 7 === 0;
          const holiday = currentMonth ? getHoliday(dateStr) : undefined;
          const isHolidayDay = !!holiday;

          return (
            <button
              key={dateStr + idx}
              onClick={() => onSelectDate(dateStr)}
              className={`relative flex flex-col p-1 md:p-2 text-left transition-all duration-150 rounded-xl md:rounded-2xl min-h-0 ${
                isSelected
                  ? "bg-white ring-2 ring-sky-400 shadow-lg shadow-sky-100"
                  : isToday
                  ? "bg-white shadow-md shadow-sky-100"
                  : isHolidayDay && currentMonth
                  ? "bg-rose-50/60 hover:bg-rose-50 hover:shadow-md"
                  : "bg-white/60 hover:bg-white hover:shadow-md hover:shadow-sky-50"
              }`}
            >
              {/* 날짜 숫자 + 공휴일 이름 */}
              <div className="flex items-center gap-0.5 md:gap-1 w-full min-w-0 shrink-0">
                <span
                  className={`text-[10px] md:text-xs font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full shrink-0 ${
                    isToday
                      ? "bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-md shadow-sky-200"
                      : !currentMonth
                      ? "text-slate-300"
                      : isHolidayDay
                      ? "text-rose-500"
                      : isSunday
                      ? "text-rose-400"
                      : isWeekend
                      ? "text-sky-500"
                      : "text-slate-700"
                  }`}
                >
                  {day}
                </span>
                {isHolidayDay && currentMonth && (
                  <span
                    className="hidden md:block text-[9px] text-rose-400 truncate leading-tight min-w-0"
                    title={holiday.name}
                  >
                    {holiday.name}
                  </span>
                )}
              </div>

              {/* 할 일 목록 */}
              {dayEntries.length > 0 && currentMonth && (
                <div className="mt-0.5 md:mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                  {dayEntries.slice(0, 3).map(({ task }) => {
                    const color = getMemberColor(task.memberId);
                    return (
                      <div
                        key={task.id}
                        className="rounded px-1 py-0.5 w-full md:rounded-md md:px-1.5"
                        style={{ backgroundColor: color + "20" }}
                      >
                        <span
                          className="block text-[9px] md:text-[11px] truncate leading-tight font-semibold"
                          style={{ color }}
                        >
                          {task.status === "완료" ? "✓ " : ""}{task.text}
                        </span>
                      </div>
                    );
                  })}
                  {dayEntries.length > 3 && (
                    <span className="text-[8px] md:text-[10px] text-slate-400 font-medium pl-0.5 md:pl-1">+{dayEntries.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
