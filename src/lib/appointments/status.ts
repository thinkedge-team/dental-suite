import { AppointmentStatus } from "@/generated/prisma";

export const STATUS_STYLES: Record<
  AppointmentStatus,
  { className: string; label: string }
> = {
  CONFIRMED:  { className: "bg-emerald-100 text-emerald-800", label: "Terkonfirmasi" },
  CHECKED_IN: { className: "bg-orange-100 text-orange-800",  label: "Check-in" },
  COMPLETED:  { className: "bg-slate-100 text-slate-700",    label: "Selesai" },
  CANCELLED:  { className: "bg-red-100 text-red-800",        label: "Dibatalkan" },
  NO_SHOW:    { className: "bg-zinc-100 text-zinc-700",      label: "Tidak Hadir" },
};
