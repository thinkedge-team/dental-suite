"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { type Branch, type Doctor, type Service, type Org, type BookingForm, type Step, formatDateId } from "./booking-types";
import { StepIndicator } from "./step-indicator";
import { StepLocation } from "./step-location";
import { StepSchedule } from "./step-schedule";
import { StepPatient } from "./step-patient";

interface Props {
  readonly org: Org;
  readonly branches: readonly Branch[];
  readonly doctors: readonly Doctor[];
  readonly services: readonly Service[];
}

export function BookingWizard({ org, branches, doctors, services }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<BookingForm>({
    branchId: "", serviceId: "", doctorId: "",
    date: "", time: "",
    patientName: "", patientPhone: "", patientEmail: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const selectedBranch = branches.find((b) => b.id === form.branchId) ?? null;
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId) ?? null;
  const selectedService = services.find((s) => s.id === form.serviceId) ?? null;
  const filteredDoctors = form.branchId
    ? doctors.filter((d) => d.branches.some((db) => db.branchId === form.branchId))
    : [];

  function updateField<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectBranch(branchId: string) {
    const doctorAtBranch = doctors
      .find((d) => d.id === form.doctorId)
      ?.branches.some((db) => db.branchId === branchId);
    setForm((prev) => ({ ...prev, branchId, doctorId: doctorAtBranch ? prev.doctorId : "" }));
  }

  function goNext() { if (step < 2) setStep((step + 1) as Step); }
  function goBack() { if (step > 0) setStep((step - 1) as Step); }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgSlug: org.slug,
          branchId: form.branchId,
          doctorId: form.doctorId || undefined,
          serviceId: form.serviceId || undefined,
          scheduledAt: new Date(`${form.date}T${form.time}:00`).toISOString(),
          patientName: form.patientName.trim(),
          patientPhone: form.patientPhone.trim(),
          patientEmail: form.patientEmail.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      if (res.status === 201) {
        const data = (await res.json()) as { success: boolean; appointmentId: string };
        setAppointmentId(data.appointmentId);
      } else {
        const err = (await res.json()) as { error?: string };
        setSubmitError(err.error ?? "Terjadi kesalahan saat mengirim reservasi.");
      }
    } catch {
      setSubmitError("Koneksi gagal. Periksa jaringan Anda dan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (appointmentId) {
    const waNumber = selectedBranch?.whatsapp ?? "6281234567890";
    const waText = encodeURIComponent(
      `Halo, saya telah membuat janji temu online dengan ID ${appointmentId}. Mohon konfirmasi jadwal saya. Terima kasih.`,
    );
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card p-8 sm:p-10 text-center shadow-sm space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Janji Temu Berhasil Dibuat</h2>
          <p className="text-sm text-muted-foreground">Tim resepsionis akan menghubungi Anda melalui WhatsApp untuk konfirmasi akhir.</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 p-5 space-y-3 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">ID Reservasi</span>
            <span className="font-bold text-foreground font-mono text-xs">{appointmentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Cabang</span>
            <span className="font-semibold text-foreground">{selectedBranch?.name ?? "-"}</span>
          </div>
          {selectedDoctor && (
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Dokter</span>
              <span className="font-semibold text-foreground">{selectedDoctor.name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Tanggal</span>
            <span className="font-semibold text-foreground">{formatDateId(form.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Waktu</span>
            <span className="font-semibold text-foreground">{form.time} WIB</span>
          </div>
        </div>
        <a
          href={`https://wa.me/${waNumber}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-12 px-6 shadow-md text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" />
          Konfirmasi via WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex justify-center border-b border-border/50 px-6 py-5">
        <StepIndicator current={step} />
      </div>
      <div className="p-6 sm:p-8">
        {step === 0 && (
          <StepLocation
            form={form}
            branches={branches}
            filteredDoctors={filteredDoctors}
            services={services}
            selectBranch={selectBranch}
            updateField={updateField}
            canAdvance={form.branchId.length > 0}
            onNext={goNext}
          />
        )}
        {step === 1 && (
          <StepSchedule
            form={form}
            selectedBranch={selectedBranch}
            selectedDoctor={selectedDoctor}
            selectedService={selectedService}
            updateField={updateField}
            canAdvance={form.date.length > 0 && form.time.length > 0}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 2 && (
          <StepPatient
            form={form}
            selectedBranch={selectedBranch}
            selectedDoctor={selectedDoctor}
            selectedService={selectedService}
            updateField={updateField}
            submitting={submitting}
            submitError={submitError}
            canSubmit={form.patientName.trim().length > 0 && form.patientPhone.trim().length >= 8}
            onSubmit={handleSubmit}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}
