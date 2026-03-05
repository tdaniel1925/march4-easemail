import { create } from "zustand";
import type { CalEvent, CalendarView } from "@/lib/types/calendar";

interface CalendarStore {
  selectedEvent: CalEvent | null;
  setSelectedEvent: (event: CalEvent | null) => void;
  activeView: CalendarView;
  setActiveView: (view: CalendarView) => void;
  currentWeekStart: string;
  setCurrentWeekStart: (date: string) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  selectedEvent: null,
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  activeView: "week",
  setActiveView: (activeView) => set({ activeView }),
  currentWeekStart: "",
  setCurrentWeekStart: (currentWeekStart) => set({ currentWeekStart }),
}));
