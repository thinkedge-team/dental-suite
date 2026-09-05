"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Building2, Calendar as CalendarIcon, ClipboardList, Loader2, Phone, Stethoscope, User as UserIcon } from "lucide-react";

import { createAppointment } from "@/lib/actions/appointments";

interface DoctorOption { readonly id: string; readonly name: string; readonly specialty: string | null; }
interface BranchOption { readonly id: string; readonly name: string; }
interface ServiceOption { readonly id: string; readonly name: string; readonly durationMin: number | null; }
interface NewAppointmentFormProps {
  readonly doctors: readonly DoctorOption[];
  readonly branches: readonly BranchOption[];
  readonly services: readonly ServiceOption[];
}

const inputCls = "h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60";
const selectCls = `${inputCls} appearance-none pr-8`;

function isRedirectError(error: unknown): error is Error & { digest: string } {
  return error instanceof Error && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");
}

export function NewAppointmentForm({ doctors, branches, services }: NewAppointmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [walkin, setWalkin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minDate, setMinDate] = useState("");

  useEffect(() => setMinDate(new Date().toISOString().slice(0, 10)), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    if (!branchId) return setError("Silakan pilih cabang.");
    if (!date || !time) return setError("Tanggal dan waktu wajib diisi.");

    const scheduledAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(scheduledAt.getTime())) return setError("Tanggal atau waktu tidak valid.");

    startTransition(async () => {
      try {
        await createAppointment({ patientName: patientName.trim(), patientPhone: patientPhone.trim(), branchId, doctorId: doctorId || undefined, scheduledAt, service: serviceName || undefined, walkin });
      } catch (caught) {
        if (isRedirectError(caught)) throw caught;
        setError(caught instanceof Error ? caught.message : "Terjadi kesalahan saat menyimpan janji temu.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Janji Temu Baru</p>
        <h1 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">Buat Janji Temu</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">Isi detail pasien dan pilih waktu kunjungan. Data pasien lama akan diperbarui otomatis berdasarkan nomor telepon.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Nama Pasien" htmlFor="patientName" icon={<UserIcon className="h-3.5 w-3.5" />} required><input id="patientName" type="text" required value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="Nama lengkap pasien" className={inputCls} /></FormField>
          <FormField label="Nomor Telepon" htmlFor="patientPhone" icon={<Phone className="h-3.5 w-3.5" />} required><input id="patientPhone" type="tel" required value={patientPhone} onChange={(event) => setPatientPhone(event.target.value)} placeholder="08xx-xxxx-xxxx" className={inputCls} /></FormField>

          <FormField label="Cabang" htmlFor="branchId" icon={<Building2 className="h-3.5 w-3.5" />} required>
            <select id="branchId" required value={branchId} onChange={(event) => setBranchId(event.target.value)} className={selectCls}>
              {branches.length === 0 ? <option value="">Belum ada cabang aktif</option> : branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </FormField>
          <FormField label="Dokter" htmlFor="doctorId" icon={<Stethoscope className="h-3.5 w-3.5" />}>
            <select id="doctorId" value={doctorId} onChange={(event) => setDoctorId(event.target.value)} className={selectCls}>
              <option value="">Pilih Dokter (Opsional)</option>
              {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.specialty ? `${doctor.name} — ${doctor.specialty}` : doctor.name}</option>)}
            </select>
          </FormField>

          <FormField label="Tanggal" htmlFor="date" icon={<CalendarIcon className="h-3.5 w-3.5" />} required><input id="date" type="date" required min={minDate} value={date} onChange={(event) => setDate(event.target.value)} className={inputCls} /></FormField>
          <FormField label="Waktu" htmlFor="time" icon={<CalendarIcon className="h-3.5 w-3.5" />} required><input id="time" type="time" required step={1800} value={time} onChange={(event) => setTime(event.target.value)} className={inputCls} /></FormField>

          <FormField label="Layanan" htmlFor="service" icon={<ClipboardList className="h-3.5 w-3.5" />}>
            <select id="service" value={serviceName} onChange={(event) => setServiceName(event.target.value)} className={selectCls}>
              <option value="">Pilih Layanan (Opsional)</option>
              {services.map((service) => <option key={service.id} value={service.name}>{service.durationMin !== null ? `${service.name} · ${service.durationMin} menit` : service.name}</option>)}
            </select>
          </FormField>

          <div className="flex items-center md:col-span-2">
            <label htmlFor="walkin" className="inline-flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
              <input id="walkin" type="checkbox" checked={walkin} onChange={(event) => setWalkin(event.target.checked)} className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring/50" />
              <span className="font-medium">Pasien Walk-in</span><span className="text-xs text-muted-foreground">Datang tanpa reservasi</span>
            </label>
          </div>
        </div>

        {error !== null && <div role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 md:flex-row md:items-center md:justify-end">
          <Link href="/appointments" className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary">Batal</Link>
          <button type="submit" disabled={isPending} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : "Buat Janji Temu"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, htmlFor, icon, required, children }: { readonly label: string; readonly htmlFor: string; readonly icon: ReactNode; readonly required?: boolean; readonly children: ReactNode }) {
  return <div className="space-y-1.5"><label htmlFor={htmlFor} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground"><span className="text-muted-foreground/70">{icon}</span>{label}{required && <span className="text-destructive">*</span>}</label>{children}</div>;
}
