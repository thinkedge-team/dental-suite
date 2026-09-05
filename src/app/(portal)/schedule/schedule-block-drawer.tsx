"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { ScheduleBlockForm } from "./schedule-block-form";

interface ScheduleBlockDrawerProps {
  doctors: { id: string; name: string; specialty: string | null }[];
  branches: { id: string; name: string }[];
}

export function ScheduleBlockDrawer({ doctors, branches }: ScheduleBlockDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
      >
        <Plus className="size-4" />
        Blokir Praktik Dokter
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <ScheduleBlockForm
              doctors={doctors}
              branches={branches}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
