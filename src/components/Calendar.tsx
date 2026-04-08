import { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("calendarNotes");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("calendarNotes", JSON.stringify(notes));
  }, [notes]);

  const getNoteKey = () => {
    if (startDate && endDate) {
      return `range-${format(startDate, "yyyy-MM-dd")}-${format(endDate, "yyyy-MM-dd")}`;
    }
    if (startDate && !endDate) {
      return `date-${format(startDate, "yyyy-MM-dd")}`;
    }
    return `general-${format(currentDate, "yyyy-MM")}`;
  };

  const currentKey = getNoteKey();

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes((prev) => ({
      ...prev,
      [currentKey]: e.target.value,
    }));
  };

  const formatNoteLabel = (key: string) => {
    if (key.startsWith("range-")) {
      const dateTarget = key.replace("range-", "");
      const startStr = dateTarget.substring(0, 10);
      const endStr = dateTarget.substring(11, 21);

      const startParts = startStr.split('-');
      const start = new Date(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));

      const endParts = endStr.split('-');
      const end = new Date(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));

      return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
    } else if (key.startsWith("date-")) {
      const dateTarget = key.replace("date-", "");
      const parts = dateTarget.split('-');
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return format(date, "MMM d, yyyy");
    } else if (key.startsWith("general-")) {
      const dateTarget = key.replace("general-", "");
      const [year, month] = dateTarget.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return `${format(date, "MMMM yyyy")} (General)`;
    }
    return key;
  };

  const handleNoteClick = (key: string) => {
    if (key.startsWith("range-")) {
      const dateTarget = key.replace("range-", "");
      const startStr = dateTarget.substring(0, 10);
      const endStr = dateTarget.substring(11, 21);

      const startParts = startStr.split('-');
      const start = new Date(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));

      const endParts = endStr.split('-');
      const end = new Date(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));

      setStartDate(start);
      setEndDate(end);
      setCurrentDate(new Date(start.getFullYear(), start.getMonth(), 1));
    } else if (key.startsWith("date-")) {
      const dateTarget = key.replace("date-", "");
      const parts = dateTarget.split('-');
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

      setStartDate(date);
      setEndDate(null);
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    } else if (key.startsWith("general-")) {
      const dateTarget = key.replace("general-", "");
      const [year, month] = dateTarget.split("-");

      setStartDate(null);
      setEndDate(null);
      setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDateClick = (day: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  const handleDateHover = (day: Date) => {
    if (startDate && !endDate) {
      setHoverDate(day);
    }
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateView = startOfWeek(monthStart);
    const endDateView = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDateView, end: endDateView });

    return days.map((day) => {
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isStart = startDate && isSameDay(day, startDate);
      const isEnd = endDate && isSameDay(day, endDate);

      let isWithinSelection = false;
      let isPreview = false;

      if (startDate && endDate) {
        isWithinSelection = isWithinInterval(day, { start: startDate, end: endDate });
      } else if (startDate && hoverDate && hoverDate !== startDate) {
        const iStart = isBefore(startDate, hoverDate) ? startDate : hoverDate;
        const iEnd = isAfter(hoverDate, startDate) ? hoverDate : startDate;
        isPreview = isWithinInterval(day, { start: iStart, end: iEnd });
      }

      let containerClass = "relative w-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-200 select-none z-10 ";
      let highlightClass = "absolute inset-0 z-0 transition-all duration-200 ";
      let textClass = "z-10 text-sm font-medium transition-colors duration-200 ";

      if (!isCurrentMonth) {
        textClass += "text-slate-400 dark:text-slate-600";
      } else {
        textClass += "text-slate-700 dark:text-slate-300";
      }

      if (isStart || isEnd) {
        textClass = "z-10 text-white font-semibold";
        if (isStart && isEnd) {
          highlightClass += "bg-indigo-600 rounded-full scale-95 shadow-md shadow-indigo-500/30";
        } else if (isStart) {
          highlightClass += "bg-indigo-600 rounded-l-full scale-95 origin-right pr-2 shadow-md " + (endDate || hoverDate ? "rounded-r-none" : "rounded-r-full");
          containerClass += endDate || (hoverDate && isAfter(hoverDate, startDate)) ? "bg-indigo-100 dark:bg-indigo-900/40 rounded-l-full scale-x-105" : "";
        } else if (isEnd) {
          highlightClass += "bg-indigo-600 rounded-r-full scale-95 origin-left pl-2 shadow-md";
          containerClass += startDate ? "bg-indigo-100 dark:bg-indigo-900/40 rounded-r-full scale-x-105" : "";
        }
      } else if (isWithinSelection) {
        containerClass += "bg-indigo-100 dark:bg-indigo-900/40";
        textClass = "z-10 text-indigo-800 dark:text-indigo-200 font-medium";
      } else if (isPreview) {
        containerClass += "bg-indigo-50 dark:bg-indigo-900/20";
        textClass = "z-10 text-indigo-800/80 dark:text-indigo-200/80";
      } else {
        containerClass += "hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full scale-95";
      }

      const isToday = isSameDay(day, new Date());
      if (isToday && !isStart && !isEnd && !isWithinSelection && !isPreview) {
        textClass += " text-indigo-600 dark:text-indigo-400 font-bold";
        highlightClass += "border border-indigo-200 dark:border-indigo-800 rounded-full scale-95";
      }

      return (
        <div
          key={day.toString()}
          className={containerClass}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => handleDateHover(day)}
        >
          {(isStart || isEnd || (isToday && !isStart && !isEnd && !isWithinSelection && !isPreview)) && (
            <div className={highlightClass}></div>
          )}
          <span className={textClass}>{format(day, dateFormat)}</span>
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900 flex flex-col md:flex-row transition-colors duration-500">

      <div className="flex-1 flex flex-col relative w-full md:w-2/3 border-r border-slate-100 dark:border-slate-800">

        <div className="relative h-48 md:h-64 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
          <img
            src="/hero.jpg"
            alt="Wall Calendar Art"
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700 hover:scale-105 transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
            <div className="text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDate.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight">
                    {format(currentDate, "MMMM")}
                  </h2>
                  <p className="text-lg md:text-xl font-medium opacity-80 mt-1 font-inter">
                    {format(currentDate, "yyyy")}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 transition-colors duration-500 font-inter relative z-10">

          <div className="grid grid-cols-7 gap-y-6 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {d}
              </div>
            ))}
            {renderDays()}
          </div>

        </div>
      </div>

      <div className="w-full md:w-1/3 bg-slate-50/50 dark:bg-slate-800/20 p-6 md:p-8 flex flex-col font-inter">
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <StickyNote size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-outfit font-semibold text-xl text-slate-800 dark:text-slate-100">
              Notes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1.5">
              <CalendarIcon size={12} />
              {startDate && endDate
                ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
                : startDate
                  ? format(startDate, "MMMM d, yyyy")
                  : `${format(currentDate, "MMMM yyyy")} (General)`}
            </p>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-6 min-h-0">
          <div className="relative group shrink-0 h-[200px]">
            <textarea
              className="w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none shadow-sm group-hover:shadow-md py-4"
              placeholder={
                startDate && endDate
                  ? "Add notes for this date range..."
                  : startDate
                    ? "Add a note for this day..."
                    : "Add general notes for the month..."
              }
              value={notes[currentKey] || ""}
              onChange={handleNoteChange}
            />

          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider shrink-0">
              Saved Notes
            </h4>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {Object.entries(notes)
                  .filter(([_, value]) => value.trim() !== "")
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([key, value]) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      key={key}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group/note"
                      onClick={() => handleNoteClick(key)}
                    >
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1.5 flex items-center justify-between">
                        <span>{formatNoteLabel(key)}</span>
                        {currentKey === key && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 whitespace-pre-wrap group-hover/note:text-slate-800 dark:group-hover/note:text-slate-100 transition-colors">
                        {value}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>

              {Object.values(notes).every(v => v.trim() === "") && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700"
                >
                  No notes saved yet. Select a date to add one!
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
