"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, User } from "lucide-react";

import { ShiftAssignModal, ShiftModalData } from "./shift-assign-modal";

export interface RosterStaff {
  readonly id: string;
  readonly name: string;
  readonly role: string;
}

export interface RosterShift {
  readonly id: string;
  readonly userId: string;
  readonly branchId: string;
  readonly date: string; // YYYY-MM-DD
  readonly startTime: string; // HH:MM
  readonly endTime: string; // HH:MM
  readonly shiftType: string; // "PAGI", "SIANG", "FULLDAY", "CUSTOM"
  readonly notes?: string | null;
}

export interface DayColumn {
  readonly dateIso: string; // YYYY-MM-DD
  readonly dayName: string; // "Senin", "Selasa", dst.
  readonly formattedDate: string; // "7 Sep"
  readonly isToday: boolean;
}

interface WeeklyRosterGridProps {
  readonly branchId: string;
  readonly branchName?: string;
  readonly days: readonly DayColumn[];
  readonly staffList: readonly RosterStaff[];
  readonly shifts: readonly RosterShift[];
  readonly onWeekChange?: (direction: "prev" | "next" | "today") => void;
  readonly currentWeekLabel?: string;
}

function getShiftBadgeStyle(shiftType: string): { badgeClass: string; label: string } {
  switch (shiftType.toUpperCase()) {
    case "PAGI":
      return {
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
        label: "Pagi",
      };
    case "SIANG":
      return {
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50",
        label: "Siang",
      };
    case "FULLDAY":
      return {
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
        label: "Fullday",
      };
    default:
      return {
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        label: shiftType || "Custom",
      };
  }
}

export function WeeklyRosterGrid({
  branchId,
  branchName,
  days,
  staffList,
  shifts,
  onWeekChange,
  currentWeekLabel,
}: WeeklyRosterGridProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeModalData, setActiveModalData] = useState<ShiftModalData | null>(null);

  function handleOpenCreate(staff: RosterStaff, day: DayColumn) {
    setActiveModalData({
      userId: staff.id,
      userName: staff.name,
      userRole: staff.role,
      branchId,
      branchName,
      date: day.dateIso,
      shiftType: "PAGI",
      startTime: "08:00",
      endTime: "15:00",
      notes: "",
    });
    setModalOpen(true);
  }

  function handleOpenEdit(staff: RosterStaff, shift: RosterShift) {
    setActiveModalData({
      id: shift.id,
      userId: staff.id,
      userName: staff.name,
      userRole: staff.role,
      branchId: shift.branchId,
      branchName,
      date: shift.date,
      shiftType: shift.shiftType,
      startTime: shift.startTime,
      endTime: shift.endTime,
      notes: shift.notes,
    });
    setModalOpen(true);
  }

  // Quick lookup map: `${userId}_${dateIso}` -> RosterShift
  const shiftMap = new Map<string, RosterShift>();
  for (const s of shifts) {
    // Normalise date string to YYYY-MM-DD if ISO timestamp
    const dateKey = s.date.includes("T") ? s.date.split("T")[0] : s.date;
    shiftMap.set(`${s.userId}_${dateKey}`, s);
  }

  return (
    <div className="space-y-4">
      {/* Navigation Header if onWeekChange is provided */}
      {onWeekChange && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <span>Matriks Jadwal Mingguan</span>
            </h3>
            {currentWeekLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{currentWeekLabel}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onWeekChange("prev")}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onWeekChange("today")}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => onWeekChange("next")}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Roster Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
        <table className="w-full min-w-[800px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-56 p-3.5 font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  Staf / Tenaga Medis
                </span>
              </th>
              {days.map((day) => (
                <th
                  key={day.dateIso}
                  className={`p-3 text-center font-semibold transition-colors ${
                    day.isToday
                      ? "bg-primary/10 text-primary border-x border-primary/20"
                      : "text-foreground"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-medium uppercase tracking-wider">
                      {day.dayName}
                    </span>
                    <span className={`text-xs ${day.isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {day.formattedDate}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={days.length + 1} className="p-8 text-center text-muted-foreground">
                  Belum ada data staf terdaftar pada cabang ini.
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} className="transition-colors hover:bg-muted/20">
                  {/* Staff Info Cell */}
                  <td className="p-3.5 align-middle border-r border-border/60">
                    <div className="font-semibold text-foreground">{staff.name}</div>
                    <div className="mt-0.5 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {staff.role}
                    </div>
                  </td>

                  {/* Day Cells */}
                  {days.map((day) => {
                    const shift = shiftMap.get(`${staff.id}_${day.dateIso}`);
                    return (
                      <td
                        key={day.dateIso}
                        className={`p-2 align-middle text-center transition-colors ${
                          day.isToday ? "bg-primary/5 border-x border-primary/15" : ""
                        }`}
                      >
                        {shift ? (
                          (() => {
                            const { badgeClass, label } = getShiftBadgeStyle(shift.shiftType);
                            return (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(staff, shift)}
                                className={`group flex w-full flex-col rounded-xl border p-2 text-left transition-all hover:scale-[1.02] hover:shadow-xs focus:outline-none focus:ring-1 focus:ring-primary ${badgeClass}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {label}
                                  </span>
                                  <span className="text-[10px] opacity-80 flex items-center gap-0.5">
                                    <Clock className="size-2.5" />
                                    {shift.startTime} - {shift.endTime}
                                  </span>
                                </div>
                                {shift.notes && (
                                  <div className="mt-1 line-clamp-1 text-[10px] italic opacity-75">
                                    {shift.notes}
                                  </div>
                                )}
                              </button>
                            );
                          })()
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenCreate(staff, day)}
                            className="group flex size-full min-h-[48px] items-center justify-center rounded-xl border border-dashed border-transparent transition-all hover:border-border hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
                            title={`Tetapkan shift untuk ${staff.name} pada ${day.dayName}, ${day.formattedDate}`}
                          >
                            <span className="flex size-6 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                              <Plus className="size-3.5" />
                            </span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Shift Assign / Edit Modal */}
      <ShiftAssignModal
        isOpen={modalOpen}
        shiftData={activeModalData}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
