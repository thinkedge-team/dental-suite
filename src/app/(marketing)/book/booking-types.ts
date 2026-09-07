export interface Branch {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly whatsapp: string | null;
}

export interface Doctor {
  readonly id: string;
  readonly name: string;
  readonly specialty: string | null;
  readonly photoUrl: string | null;
  readonly branches: { readonly branchId: string }[];
  readonly schedules?: { readonly dayOfWeek: number; readonly isActive: boolean }[];
}

export interface Service {
  readonly id: string;
  readonly name: string;
  readonly durationMin: number | null;
}

export interface Org {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface BookingForm {
  branchId: string;
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  notes: string;
}

export type Step = 0 | 1 | 2;

export const STEPS = [
  { label: "Pilih Lokasi", short: "Lokasi" },
  { label: "Pilih Waktu", short: "Waktu" },
  { label: "Data Diri", short: "Konfirmasi" },
] as const;

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateId(iso: string): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const monthName = months[Number(m) - 1];
  if (!monthName) return iso;
  return `${Number(d)} ${monthName} ${y}`;
}

export function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase();
}
