"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, MessageCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Branch {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly whatsapp: string | null;
}

interface Doctor {
  readonly id: string;
  readonly name: string;
  readonly specialty: string | null;
  readonly photoUrl: string | null;
  readonly branches: { readonly branchId: string }[];
}

interface Service {
  readonly id: string;
  readonly name: string;
  readonly durationMin: number | null;
}

interface Org {
  readonly id: string;
  readonly name: string;
}

interface Props {
  readonly org: Org;
  readonly branches: readonly Branch[];
  readonly doctors: readonly Doctor[];
  readonly services: readonly Service[];
}

interface FormData {
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

type Step = 0 | 1 | 2;

const STEPS = [
  { label: "Pilih Lokasi", short: "Lokasi" },
  { label: "Pilih Waktu", short: "Waktu" },
  { label: "Data Diri", short: "Konfirmasi" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateId(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const monthIdx = Number(m) - 1;
  return `${Number(d)} ${months[monthIdx]} ${y}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { readonly current: Step }) {
  return (
    <nav aria-label="Langkah pemesanan" className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < current;
        const isActive = idx === current;
        return (
          <div key={step.label} className="flex items-center">
            {idx > 0 && (
              <div
                className={`hidden sm:block h-px w-10 mx-1 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "border border-border bg-card text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </span>
              <span
                className={`hidden sm:inline text-xs font-semibold ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              <span
                className={`sm:hidden text-[11px] font-semibold ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.short}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function BookingWizard({ org, branches, doctors, services }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormData>({
    branchId: "",
    serviceId: "",
    doctorId: "",
    date: "",
    time: "",
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  // -- Derived data -------------------------------------------------------

  const selectedBranch = branches.find((b) => b.id === form.branchId) ?? null;

  const filteredDoctors = form.branchId
    ? doctors.filter((d) =>
        d.branches.some((db) => db.branchId === form.branchId),
      )
    : [];

  const selectedDoctor = doctors.find((d) => d.id === form.doctorId) ?? null;
  const selectedService = services.find((s) => s.id === form.serviceId) ?? null;

  // -- Navigation ---------------------------------------------------------

  function canAdvanceStep0(): boolean {
    return form.branchId.length > 0;
  }

  function canAdvanceStep1(): boolean {
    return form.date.length > 0 && form.time.length > 0;
  }

  function canSubmit(): boolean {
    return (
      form.patientName.trim().length > 0 &&
      form.patientPhone.trim().length >= 8
    );
  }

  function goNext() {
    if (step < 2) setStep((step + 1) as Step);
  }

  function goBack() {
    if (step > 0) setStep((step - 1) as Step);
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // When branch changes, reset doctor if the selected doctor is not at the new branch
  function selectBranch(branchId: string) {
    const doctorAtBranch = doctors
      .find((d) => d.id === form.doctorId)
      ?.branches.some((db) => db.branchId === branchId);

    setForm((prev) => ({
      ...prev,
      branchId,
      doctorId: doctorAtBranch ? prev.doctorId : "",
    }));
  }

  // -- Submit -------------------------------------------------------------

  async function handleSubmit() {
    if (!canSubmit()) return;

    setSubmitting(true);
    setSubmitError(null);

    const scheduledAt = new Date(`${form.date}T${form.time}:00`).toISOString();

    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgSlug: "senyum-sehat",
          branchId: form.branchId,
          doctorId: form.doctorId || undefined,
          serviceId: form.serviceId || undefined,
          scheduledAt,
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
        setSubmitError(
          err.error ?? "Terjadi kesalahan saat mengirim reservasi.",
        );
      }
    } catch {
      setSubmitError("Koneksi gagal. Periksa jaringan Anda dan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  // -- Success screen -----------------------------------------------------

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
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Janji Temu Berhasil Dibuat
          </h2>
          <p className="text-sm text-muted-foreground">
            Tim resepsionis akan menghubungi Anda melalui WhatsApp untuk konfirmasi akhir.
          </p>
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

  // -- Wizard shell -------------------------------------------------------

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card shadow-sm">
      {/* Step indicator */}
      <div className="flex justify-center border-b border-border/50 px-6 py-5">
        <StepIndicator current={step} />
      </div>

      <div className="p-6 sm:p-8">
        {/* ----------------------------------------------------------------
            STEP 0 - Pilih Cabang & Layanan
        ----------------------------------------------------------------- */}
        {step === 0 && (
          <div className="space-y-6">
            {/* Branch selection */}
            <fieldset>
              <legend className="text-sm font-bold text-foreground mb-3">
                Pilih Cabang Klinik <span className="text-primary">*</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {branches.map((branch) => {
                  const isSelected = form.branchId === branch.id;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => selectBranch(branch.id)}
                      className={`relative rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary bg-primary/5"
                          : "border-border/70 bg-card hover:border-primary/40"
                      }`}
                    >
                      <p className="text-sm font-bold text-foreground">
                        {branch.name}
                      </p>
                      {branch.address && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {branch.address}
                        </p>
                      )}
                      {isSelected && (
                        <span className="absolute top-3 right-3">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Service selection */}
            {services.length > 0 && (
              <div>
                <label
                  htmlFor="service-select"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Pilih Layanan{" "}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </label>
                <select
                  id="service-select"
                  value={form.serviceId}
                  onChange={(e) => updateField("serviceId", e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                >
                  <option value="">Belum dipilih</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.durationMin ? ` (${s.durationMin} menit)` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Doctor selection (filtered by branch) */}
            {form.branchId && filteredDoctors.length > 0 && (
              <div>
                <label
                  htmlFor="doctor-select"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Pilih Dokter{" "}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </label>
                <div className="grid gap-3">
                  {filteredDoctors.map((doc) => {
                    const isSelected = form.doctorId === doc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() =>
                          updateField("doctorId", isSelected ? "" : doc.id)
                        }
                        className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary bg-primary/5"
                            : "border-border/70 bg-card hover:border-primary/40"
                        }`}
                      >
                        {doc.photoUrl ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-primary/20">
                            <Image
                              src={doc.photoUrl}
                              alt={doc.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {initials(doc.name)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground truncate">
                            {doc.name}
                          </p>
                          {doc.specialty && (
                            <p className="text-xs text-primary font-semibold truncate">
                              {doc.specialty}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!canAdvanceStep0()}
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              >
                Lanjutkan
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------
            STEP 1 - Pilih Tanggal & Waktu
        ----------------------------------------------------------------- */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Selection summary */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground font-medium">Cabang:</span>{" "}
                <span className="font-semibold text-foreground">{selectedBranch?.name}</span>
              </p>
              {selectedDoctor && (
                <p>
                  <span className="text-muted-foreground font-medium">Dokter:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedDoctor.name}</span>
                </p>
              )}
              {selectedService && (
                <p>
                  <span className="text-muted-foreground font-medium">Layanan:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedService.name}</span>
                </p>
              )}
            </div>

            {/* Date picker */}
            <div>
              <label
                htmlFor="date-input"
                className="block text-sm font-bold text-foreground mb-2"
              >
                Tanggal Kunjungan <span className="text-primary">*</span>
              </label>
              <input
                id="date-input"
                type="date"
                min={todayString()}
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>

            {/* Time picker */}
            <div>
              <label
                htmlFor="time-input"
                className="block text-sm font-bold text-foreground mb-2"
              >
                Waktu Kunjungan <span className="text-primary">*</span>
              </label>
              <input
                id="time-input"
                type="time"
                step={1800}
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>

            {/* Nav buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali
              </button>
              <button
                type="button"
                disabled={!canAdvanceStep1()}
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              >
                Lanjutkan
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------
            STEP 2 - Data Pasien & Konfirmasi
        ----------------------------------------------------------------- */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Patient info */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="patient-name"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Nama Lengkap <span className="text-primary">*</span>
                </label>
                <input
                  id="patient-name"
                  type="text"
                  placeholder="Nama sesuai KTP"
                  value={form.patientName}
                  onChange={(e) => updateField("patientName", e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-phone"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Nomor Telepon / WhatsApp <span className="text-primary">*</span>
                </label>
                <input
                  id="patient-phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.patientPhone}
                  onChange={(e) => updateField("patientPhone", e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-email"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Alamat Email{" "}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </label>
                <input
                  id="patient-email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={form.patientEmail}
                  onChange={(e) => updateField("patientEmail", e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-notes"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Catatan Tambahan{" "}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </label>
                <textarea
                  id="patient-notes"
                  rows={3}
                  placeholder="Keluhan, alergi obat, atau informasi khusus lainnya"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>

            {/* Booking summary */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-5 space-y-2.5 text-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Ringkasan Janji Temu
              </p>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Cabang</span>
                <span className="font-semibold text-foreground">
                  {selectedBranch?.name ?? "-"}
                </span>
              </div>
              {selectedDoctor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Dokter</span>
                  <span className="font-semibold text-foreground">
                    {selectedDoctor.name}
                  </span>
                </div>
              )}
              {selectedService && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Layanan</span>
                  <span className="font-semibold text-foreground">
                    {selectedService.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Tanggal</span>
                <span className="font-semibold text-foreground">
                  {form.date ? formatDateId(form.date) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Waktu</span>
                <span className="font-semibold text-foreground">
                  {form.time ? `${form.time} WIB` : "-"}
                </span>
              </div>
            </div>

            {/* Error */}
            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
                {submitError}
              </div>
            )}

            {/* Nav & submit */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali
              </button>
              <button
                type="button"
                disabled={!canSubmit() || submitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Konfirmasi Janji"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
