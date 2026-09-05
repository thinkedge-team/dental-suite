"use client";

import { CheckCircle2 } from "lucide-react";
import { STEPS, type Step } from "./booking-types";

export function StepIndicator({ current }: { readonly current: Step }) {
  return (
    <nav aria-label="Langkah pemesanan" className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < current;
        const isActive = idx === current;
        return (
          <div key={step.label} className="flex items-center">
            {idx > 0 && (
              <div className={`hidden sm:block h-px w-10 mx-1 ${isCompleted ? "bg-primary" : "bg-border"}`} />
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
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </span>
              <span className={`hidden sm:inline text-xs font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              <span className={`sm:hidden text-[11px] font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.short}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
