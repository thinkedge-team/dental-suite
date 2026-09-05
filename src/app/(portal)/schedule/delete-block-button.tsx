"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { deleteScheduleBlock } from "@/lib/actions/schedule";

interface DeleteBlockButtonProps {
  id: string;
  doctorName: string;
}

export function DeleteBlockButton({ id, doctorName }: DeleteBlockButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteScheduleBlock(id);
        if (!res.ok) {
          setError(res.error || "Gagal menghapus blokir jadwal.");
        } else {
          setConfirmOpen(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
    });
  }

  if (confirmOpen) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="inline-flex h-8 items-center justify-center rounded-md bg-destructive px-2.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="size-3 animate-spin" /> : "Ya, Hapus"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setConfirmOpen(false);
            setError(null);
          }}
          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          Batal
        </button>
        {error && <span className="text-[10px] text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmOpen(true)}
      title={`Hapus blokir untuk ${doctorName}`}
      className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="size-3.5" />
      <span>Hapus</span>
    </button>
  );
}
