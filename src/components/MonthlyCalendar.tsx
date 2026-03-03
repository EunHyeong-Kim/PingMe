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
    const map: Record<string, UITask[]> = {};
    tasks.forEach((task) => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  const getMemberColor = (memberId: string) =>
    group.members.find((m) => m.id === memberId)?.color ?? "#94a3b8";

  return (
    <div className="flex-1 flex flex-col h-screen bg-sky-50/50 overflow-hidden">
      {/* 캘린더 헤더 */}
      <div className="px-6 py-5 bg-white border-b border-sky-100 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {year}년 {month + 1}월
          </h2>
          <p className="text-xs text-sky-500 font-medium mt-0.5">{group.name}의 일정</p>
        </div>

        <div className="flex items-center gap-3">
          {/* 멤버 컬러 범례 */}
          <div className="flex items-center gap-4 mr-2 bg-sky-50 rounded-xl px-4 py-2 border border-sky-100">
            {group.members.map((m) => (
              <div key={m.id} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: m.color }} />
                <span className="text-xs text-slate-500 font-medium">{m.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onPrevMonth}
              className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-500 hover:bg-sky-100 hover:text-sky-700 transition-all shadow-sm"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={onNextMonth}
              className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-500 hover:bg-sky-100 hover:text-sky-700 transition-all shadow-sm"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-5 pt-4 shrink-0">
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
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-2 px-5 pb-5 pt-2">
        {calendarDays.map(({ day, currentMonth, dateStr }, idx) => {
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dayTasks = tasksByDate[dateStr] ?? [];
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;
          const isSunday = idx % 7 === 0;
          const holiday = currentMonth ? getHoliday(dateStr) : undefined;
          const isHolidayDay = !!holiday;

          return (
            <button
              key={dateStr + idx}
              onClick={() => onSelectDate(dateStr)}
              className={`relative flex flex-col p-2 text-left transition-all duration-150 rounded-2xl min-h-0 ${
                isSelected
                  ? "bg-white ring-2 ring-sky-400 shadow-lg shadow-sky-100"
                  : isToday
                  ? "bg-white shadow-md shadow-sky-100"
                  : isHolidayDay && currentMonth
                  ? "bg-rose-50/60 hover:bg-rose-50 hover:shadow-md"
                  : "bg-white/60 hover:bg-white hover:shadow-md hover:shadow-sky-50"
              }`}
            >
              {/* 날짜 숫자 + 공휴일 이름 (같은 행) */}
              <div className="flex items-center gap-1 w-full min-w-0 shrink-0">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${
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
                    className="text-[9px] text-rose-400 truncate leading-tight min-w-0"
                    title={holiday.name}
                  >
                    {holiday.name}
                  </span>
                )}
              </div>

              {/* 할 일 목록 */}
              {dayTasks.length > 0 && currentMonth && (
                <div className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-md px-1.5 py-0.5 w-full"
                      style={{ backgroundColor: getMemberColor(task.memberId) + "20" }}
                    >
                      <span
                        className="block text-[11px] truncate leading-tight font-semibold"
                        style={{ color: getMemberColor(task.memberId) }}
                      >
                        {task.status === "완료" ? "✓ " : ""}{task.text}
                      </span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-medium pl-1">+{dayTasks.length - 3}개 더</span>
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
