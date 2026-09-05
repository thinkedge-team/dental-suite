"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Clock, MessageSquare, Send } from "lucide-react";

import { markReminderSent } from "@/lib/actions/appointments";
import {
  getConfirmationWaLink,
  getReminderWaLink,
  type WaAppointmentData,
} from "@/lib/whatsapp";

export interface AppointmentWaButtonProps {
  appointment: {
    id: string;
    patientName: string;
    patientPhone: string;
    doctorName?: string | null;
    branchName: string;
    branchAddress?: string | null;
    service?: string | null;
    scheduledAt: Date | string;
    cancelToken?: string | null;
    reminderSentAt?: Date | string | null;
    reminder2hSentAt?: Date | string | null;
  };
  baseUrl?: string;
}

export function AppointmentWaButton({
  appointment,
  baseUrl,
}: AppointmentWaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  const [optimistic1d, setOptimistic1d] = useState(false);
  const [optimistic2h, setOptimistic2h] = useState(false);

  const reminderSentAt = appointment.reminderSentAt || optimistic1d;
  const reminder2hSentAt = appointment.reminder2hSentAt || optimistic2h;

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const effectiveBaseUrl =
    baseUrl ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const scheduledDate =
    typeof appointment.scheduledAt === "string"
      ? new Date(appointment.scheduledAt)
      : appointment.scheduledAt;

  const aptData: WaAppointmentData = {
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone,
    doctorName: appointment.doctorName ?? "-",
    branchName: appointment.branchName,
    branchAddress: appointment.branchAddress ?? "-",
    service: appointment.service ?? "-",
    scheduledAt: scheduledDate,
    cancelToken: appointment.cancelToken ?? "",
  };

  const handleSendConfirmation = () => {
    setIsOpen(false);
    const link = getConfirmationWaLink(aptData, effectiveBaseUrl);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleSendReminder = (type: "1day" | "2hour") => {
    setIsOpen(false);
    const link = getReminderWaLink(aptData, type, effectiveBaseUrl);
    window.open(link, "_blank", "noopener,noreferrer");

    startTransition(async () => {
      try {
        const res = await markReminderSent(appointment.id, type);
        if (res.success) {
          if (type === "1day") {
            setOptimistic1d(true);
          } else {
            setOptimistic2h(true);
          }
        }
      } catch (err) {
        console.error("Failed to mark reminder sent:", err);
      }
    });
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/80 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          title="WhatsApp Action & Pengingat"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
          <span>WA</span>
          <ChevronDown className="h-3 w-3 text-emerald-600 opacity-70" />
        </button>

        {/* Status badges */}
        {reminderSentAt && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800"
            title="Pengingat H-1 terkirim"
          >
            <Check className="h-2.5 w-2.5 text-emerald-600" />
            <span>H-1</span>
          </span>
        )}
        {reminder2hSentAt && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800"
            title="Pengingat H-2 jam terkirim"
          >
            <Check className="h-2.5 w-2.5 text-emerald-600" />
            <span>H-2h</span>
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-60 origin-top-right rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
            WhatsApp Template
          </div>

          <button
            type="button"
            onClick={handleSendConfirmation}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted text-left"
          >
            <Send className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Kirim Konfirmasi Jadwal</p>
              <p className="text-[10px] text-muted-foreground truncate">
                Format konfirmasi janji temu
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSendReminder("1day")}
            disabled={isPending}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted text-left"
          >
            <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium">Kirim Pengingat H-1</span>
                {reminderSentAt && (
                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {reminderSentAt
                  ? "Sudah pernah dikirim"
                  : "Pengingat jadwal besok"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSendReminder("2hour")}
            disabled={isPending}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted text-left"
          >
            <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium">Kirim Pengingat H-2 Jam</span>
                {reminder2hSentAt && (
                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {reminder2hSentAt
                  ? "Sudah pernah dikirim"
                  : "Pengingat 2 jam lagi"}
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
