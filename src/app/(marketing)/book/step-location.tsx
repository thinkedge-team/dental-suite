"use client";

import Image from "next/image";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { type Branch, type Doctor, type Service, type BookingForm, initials } from "./booking-types";

interface Props {
  form: BookingForm;
  branches: readonly Branch[];
  filteredDoctors: readonly Doctor[];
  services: readonly Service[];
  selectBranch: (id: string) => void;
  updateField: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  canAdvance: boolean;
  onNext: () => void;
}

export function StepLocation({ form, branches, filteredDoctors, services, selectBranch, updateField, canAdvance, onNext }: Props) {
  return (
    <div className="space-y-6">
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
                  isSelected ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-bold text-foreground">{branch.name}</p>
                {branch.address && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{branch.address}</p>}
                {isSelected && <span className="absolute top-3 right-3"><CheckCircle2 className="h-5 w-5 text-primary" /></span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      {services.length > 0 && (
        <div>
          <label htmlFor="service-select" className="block text-sm font-bold text-foreground mb-2">
            Pilih Layanan <span className="font-normal text-muted-foreground">(opsional)</span>
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
                {s.name}{s.durationMin ? ` (${s.durationMin} menit)` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {form.branchId && filteredDoctors.length > 0 && (
        <div>
          <p className="text-sm font-bold text-foreground mb-2">
            Pilih Dokter <span className="font-normal text-muted-foreground">(opsional)</span>
          </p>
          <div className="grid gap-3">
            {filteredDoctors.map((doc) => {
              const isSelected = form.doctorId === doc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => updateField("doctorId", isSelected ? "" : doc.id)}
                  className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                    isSelected ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border/70 bg-card hover:border-primary/40"
                  }`}
                >
                  {doc.photoUrl ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-primary/20">
                      <Image src={doc.photoUrl} alt={doc.name} fill sizes="40px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {initials(doc.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{doc.name}</p>
                    {doc.specialty && <p className="text-xs text-primary font-semibold truncate">{doc.specialty}</p>}
                  </div>
                  {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!canAdvance}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
        >
          Lanjutkan <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
