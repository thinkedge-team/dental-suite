# CONNECT Module Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the final three operational features of the CONNECT module: WhatsApp notification engine with reminder tracking, patient self-service cancellation with a 2-hour cutoff rule, and doctor schedule blocking integrated into the public booking API and staff portal.

**Architecture:** A pure helper library for WhatsApp URL generation with database tracking; a token-based public cancellation route at `/cancel` with server-validated cutoff rules; and a staff schedule management module backed by `ScheduleBlock` Prisma records with automatic collision detection in the public booking API.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Prisma 6 (PostgreSQL), Tailwind CSS v4, Lucide React icons.

## Global Constraints

- Tech stack: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, Prisma 6.
- Copy rule: Strictly zero em-dashes (U+2014) across all UI strings, labels, and placeholders. Use `-` or `·`.
- Timezone: All day boundaries and display dates must use `Asia/Jakarta` (WIB = UTC+7).
- Type safety: No `as any`, no `@ts-ignore`, no empty catch blocks.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: WhatsApp Notification Engine & Reminder Server Action

**Files:**
- Create: `src/lib/whatsapp.ts`
- Modify: `src/lib/actions/appointments.ts`
- Create: `tests/whatsapp.test.ts`

**Interfaces:**
- Produces:
  - `formatPhoneForWhatsapp(phone: string): string`
  - `getConfirmationWaLink(apt: WaAppointmentData, baseUrl: string): string`
  - `getReminderWaLink(apt: WaAppointmentData, type: "1day" | "2hour", baseUrl: string): string`
  - `markReminderSent(appointmentId: string, type: "1day" | "2hour"): Promise<{ success: boolean }>`

- [ ] **Step 1: Write unit tests for WhatsApp URL and phone formatting**

Create `tests/whatsapp.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatPhoneForWhatsapp, getReminderWaLink, getConfirmationWaLink } from "../src/lib/whatsapp";

describe("WhatsApp helpers", () => {
  it("normalizes Indonesian phone numbers correctly", () => {
    expect(formatPhoneForWhatsapp("08123456789")).toBe("628123456789");
    expect(formatPhoneForWhatsapp("+628123456789")).toBe("628123456789");
    expect(formatPhoneForWhatsapp("628123456789")).toBe("628123456789");
    expect(formatPhoneForWhatsapp("0812-3456-7890")).toBe("6281234567890");
  });

  it("generates valid wa.me links with cancelToken included", () => {
    const data = {
      patientName: "Budi Santoso",
      patientPhone: "08123456789",
      doctorName: "drg. Sarah Amanda",
      branchName: "Cabang Pluit",
      branchAddress: "Jl. Pluit Raya No. 10",
      service: "Pembersihan Gigi",
      scheduledAt: new Date("2026-09-10T09:00:00.000Z"),
      cancelToken: "abcd1234token5678",
    };
    const link = getConfirmationWaLink(data, "http://localhost:3000");
    expect(link).toContain("https://wa.me/628123456789?text=");
    expect(link).toContain(encodeURIComponent("abcd1234token5678"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/whatsapp.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement WhatsApp helpers in `src/lib/whatsapp.ts`**

```ts
export interface WaAppointmentData {
  readonly patientName: string;
  readonly patientPhone: string;
  readonly doctorName?: string | null;
  readonly branchName: string;
  readonly branchAddress?: string | null;
  readonly service?: string | null;
  readonly scheduledAt: Date;
  readonly cancelToken?: string | null;
}

export function formatPhoneForWhatsapp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "62" + digits.slice(1);
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  return "62" + digits;
}

function formatWibDateTime(date: Date): string {
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " WIB";
}

export function getConfirmationWaLink(apt: WaAppointmentData, baseUrl: string): string {
  const phone = formatPhoneForWhatsapp(apt.patientPhone);
  const timeStr = formatWibDateTime(apt.scheduledAt);
  const cancelUrl = apt.cancelToken ? `${baseUrl}/cancel?token=${apt.cancelToken}` : "";

  const lines = [
    `Halo ${apt.patientName},`,
    "",
    "Terima kasih telah melakukan reservasi di Klinik Gigi Senyum Sehat.",
    "",
    "Detail Janji Temu Anda:",
    `* Cabang: ${apt.branchName}${apt.branchAddress ? " (" + apt.branchAddress + ")" : ""}`,
    `* Dokter: ${apt.doctorName ?? "Dokter Jaga"}`,
    `* Layanan: ${apt.service ?? "Pemeriksaan Umum"}`,
    `* Waktu: ${timeStr}`,
    "",
    "Mohon hadir 10 menit sebelum jadwal untuk verifikasi berkas rekam medis.",
  ];

  if (cancelUrl) {
    lines.push(
      "",
      "Jika berhalangan, Anda dapat membatalkan janji secara mandiri melalui tautan berikut:",
      cancelUrl,
    );
  }

  lines.push("", "Salam hangat,", "Tim Resepsionis Klinik Gigi Senyum Sehat");

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function getReminderWaLink(
  apt: WaAppointmentData,
  type: "1day" | "2hour",
  baseUrl: string,
): string {
  const phone = formatPhoneForWhatsapp(apt.patientPhone);
  const timeStr = formatWibDateTime(apt.scheduledAt);
  const cancelUrl = apt.cancelToken ? `${baseUrl}/cancel?token=${apt.cancelToken}` : "";

  let header = "";
  if (type === "1day") {
    header = `Halo ${apt.patientName}, ini pengingat janji temu perawatan gigi Anda besok:`;
  } else {
    header = `Halo ${apt.patientName}, janji temu perawatan gigi Anda akan dimulai dalam 2 jam:`;
  }

  const lines = [
    header,
    "",
    `* Cabang: ${apt.branchName}`,
    `* Dokter: ${apt.doctorName ?? "Dokter Jaga"}`,
    `* Waktu: ${timeStr}`,
    "",
    "Mohon konfirmasi kehadiran Anda dengan membalas pesan ini.",
  ];

  if (type === "1day" && cancelUrl) {
    lines.push(
      "",
      "Jika berhalangan, silakan batalkan jadwal Anda melalui tautan mandiri berikut:",
      cancelUrl,
    );
  }

  lines.push("", "Terima kasih,", "Klinik Gigi Senyum Sehat");

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
```

- [ ] **Step 4: Implement `markReminderSent` in `src/lib/actions/appointments.ts`**

Append to `src/lib/actions/appointments.ts`:
```ts
export async function markReminderSent(
  id: string,
  type: "1day" | "2hour",
): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.organizationId) throw new Error("Unauthorized");

  const appointment = await prisma.appointment.findFirst({
    where: { id, organizationId: session.user.organizationId },
    select: { id: true },
  });

  if (!appointment) {
    throw new Error("Janji temu tidak ditemukan");
  }

  await prisma.appointment.update({
    where: { id },
    data: type === "1day" ? { reminderSentAt: new Date() } : { reminder2hSentAt: new Date() },
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  return { success: true };
}
```

- [ ] **Step 5: Run tests and verify**

Run: `npx vitest run tests/whatsapp.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/whatsapp.ts src/lib/actions/appointments.ts tests/whatsapp.test.ts
GIT_MASTER=1 git commit -m "feat(connect): add WhatsApp notification engine and reminder tracking"
```

---

### Task 2: Patient Self-Service Cancellation (`/cancel`)

**Files:**
- Create: `src/app/(marketing)/cancel/cancel-form.tsx`
- Create: `src/app/(marketing)/cancel/page.tsx`
- Modify: `src/lib/actions/appointments.ts`
- Modify: `src/auth.config.ts`

**Interfaces:**
- Produces:
  - `cancelWithToken(token: string, reason: string): Promise<{ ok: boolean; error?: string }>`
  - Public route `/cancel?token=...`

- [ ] **Step 1: Whitelist `/cancel` in `src/auth.config.ts`**

Update `src/auth.config.ts` authorized callback:
Add `/cancel` to the public path prefixes:
```ts
const isPublicPath =
  pathname === "/" ||
  pathname === "/login" ||
  pathname === "/book" ||
  pathname.startsWith("/book/") ||
  pathname === "/cancel" ||
  pathname.startsWith("/cancel/") ||
  pathname === "/asuransi" ||
  pathname.startsWith("/dokter") ||
  pathname.startsWith("/layanan") ||
  pathname.startsWith("/lokasi");
```

- [ ] **Step 2: Add `cancelWithToken` server action in `src/lib/actions/appointments.ts`**

```ts
export async function cancelWithToken(
  token: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!token || typeof token !== "string") {
    return { ok: false, error: "Token pembatalan tidak valid." };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      reasonForVisit: true,
    },
  });

  if (!appointment) {
    return { ok: false, error: "Janji temu tidak ditemukan atau token kedaluwarsa." };
  }

  if (appointment.status === AppointmentStatus.CANCELLED) {
    return { ok: false, error: "Janji temu ini sudah dibatalkan sebelumnya." };
  }

  if (appointment.status === AppointmentStatus.COMPLETED) {
    return { ok: false, error: "Janji temu ini sudah selesai dan tidak dapat dibatalkan." };
  }

  // 2-hour cutoff rule: cannot cancel within 2 hours of scheduled time
  const msUntilAppointment = appointment.scheduledAt.getTime() - Date.now();
  if (msUntilAppointment < 2 * 60 * 60 * 1000) {
    return {
      ok: false,
      error: "Pembatalan mandiri ditutup 2 jam sebelum jadwal. Silakan hubungi nomor WhatsApp klinik secara langsung.",
    };
  }

  const cleanReason = reason.trim().slice(0, 200) || "Tidak ada alasan spesifik";
  const updatedReason = appointment.reasonForVisit
    ? `${appointment.reasonForVisit} [Batal mandiri: ${cleanReason}]`
    : `[Batal mandiri: ${cleanReason}]`;

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
      reasonForVisit: updatedReason,
    },
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointment.id}`);
  return { ok: true };
}
```

- [ ] **Step 3: Implement client confirmation component `cancel-form.tsx`**

Create `src/app/(marketing)/cancel/cancel-form.tsx`:
Interactive form rendering reason radio pills ("Perubahan jadwal mendadak", "Kondisi kesehatan membaik", "Kendala transportasi", "Biaya / faktor finansial", "Lainnya"), optional notes textarea, and submitting to `cancelWithToken`.

- [ ] **Step 4: Implement Server Component `page.tsx`**

Create `src/app/(marketing)/cancel/page.tsx`:
Awaits `searchParams`, queries `prisma.appointment` by `cancelToken`, and renders:
- Invalid token banner if token missing or not found.
- Completed status if `status === COMPLETED`.
- Already cancelled status if `status === CANCELLED`.
- Cutoff warning with branch WhatsApp hotline if `< 2 hours`.
- `CancelForm` if eligible for cancellation.

- [ ] **Step 5: Verify build & typecheck**

Run: `npx tsc --noEmit && npm run build`
Expected: Clean build, `/cancel` appears as dynamic route.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/auth.config.ts src/lib/actions/appointments.ts src/app/\(marketing\)/cancel/
GIT_MASTER=1 git commit -m "feat(connect): add patient self-service cancellation page with 2h cutoff"
```

---

### Task 3: Doctor Schedule Blocking (`/portal/schedule`)

**Files:**
- Create: `src/lib/actions/schedule.ts`
- Create: `src/app/(portal)/schedule/schedule-block-form.tsx`
- Create: `src/app/(portal)/schedule/page.tsx`
- Modify: `src/components/portal/sidebar.tsx` or navigation links

**Interfaces:**
- Produces:
  - `createScheduleBlock(data: { doctorId: string; branchId: string; startAt: Date; endAt: Date; reason?: string }): Promise<{ ok: boolean; error?: string }>`
  - `deleteScheduleBlock(id: string): Promise<{ ok: boolean; error?: string }>`
  - Portal page `/schedule`

- [ ] **Step 1: Implement `src/lib/actions/schedule.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createScheduleBlock(data: {
  doctorId: string;
  branchId: string;
  startAt: Date;
  endAt: Date;
  reason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  if (data.startAt >= data.endAt) {
    return { ok: false, error: "Waktu selesai harus lebih besar dari waktu mulai." };
  }

  // Verify doctor and branch belong to session org
  const [doctor, branch] = await Promise.all([
    prisma.doctor.findFirst({
      where: { id: data.doctorId, organizationId: session.user.organizationId },
      select: { id: true },
    }),
    prisma.branch.findFirst({
      where: { id: data.branchId, organizationId: session.user.organizationId },
      select: { id: true },
    }),
  ]);

  if (!doctor || !branch) {
    return { ok: false, error: "Dokter atau cabang tidak valid untuk organisasi ini." };
  }

  await prisma.scheduleBlock.create({
    data: {
      doctorId: data.doctorId,
      branchId: data.branchId,
      startAt: data.startAt,
      endAt: data.endAt,
      reason: data.reason?.trim() || null,
    },
  });

  revalidatePath("/schedule");
  return { ok: true };
}

export async function deleteScheduleBlock(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const block = await prisma.scheduleBlock.findFirst({
    where: { id, doctor: { organizationId: session.user.organizationId } },
    select: { id: true },
  });

  if (!block) {
    return { ok: false, error: "Blokir jadwal tidak ditemukan." };
  }

  await prisma.scheduleBlock.delete({ where: { id } });
  revalidatePath("/schedule");
  return { ok: true };
}
```

- [ ] **Step 2: Implement `schedule-block-form.tsx` client modal/drawer**

Create `src/app/(portal)/schedule/schedule-block-form.tsx`:
Interactive form selecting Doctor, Branch, Start Date & Time, End Date & Time, Reason (e.g. Cuti, Operasi, Workshop, Pribadi), and executing `createScheduleBlock`.

- [ ] **Step 3: Implement `src/app/(portal)/schedule/page.tsx`**

Server Component fetching:
- All active doctors with regular `Schedule` templates
- All `ScheduleBlock` records starting from today onwards
- Action button to trigger `ScheduleBlockForm`
- List of active blocks with a delete button calling `deleteScheduleBlock`

- [ ] **Step 4: Add "Jadwal Praktik" navigation item in portal sidebar**

Ensure `/schedule` is accessible from the portal navigation.

- [ ] **Step 5: Verify build & typecheck**

Run: `npx tsc --noEmit && npm run build`
Expected: Clean build.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/actions/schedule.ts src/app/\(portal\)/schedule/ src/components/
GIT_MASTER=1 git commit -m "feat(connect): add doctor schedule blocking interface and server actions"
```

---

### Task 4: Integrate ScheduleBlock Guard into Public Booking & Wire Portal WA Action Button

**Files:**
- Modify: `src/app/api/public/book/route.ts`
- Create: `src/components/portal/appointment-wa-button.tsx`
- Modify: `src/app/(portal)/appointments/page.tsx`
- Modify: `src/app/(portal)/appointments/[id]/page.tsx`

**Interfaces:**
- Connects: `ScheduleBlock` check inside `/api/public/book` POST
- Connects: `getReminderWaLink` and `markReminderSent` in appointments UI

- [ ] **Step 1: Add `ScheduleBlock` check in `src/app/api/public/book/route.ts`**

In `POST /api/public/book`, after validating `validDoctorId`:
```ts
if (validDoctorId) {
  const activeBlock = await prisma.scheduleBlock.findFirst({
    where: {
      doctorId: validDoctorId,
      branchId,
      startAt: { lte: scheduledDate },
      endAt: { gte: scheduledDate },
    },
    select: { reason: true },
  });

  if (activeBlock) {
    return Response.json(
      {
        error: `Dokter sedang tidak bertugas pada jadwal yang dipilih: ${activeBlock.reason ?? "Jadwal diblokir"}`,
      },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 2: Implement `src/components/portal/appointment-wa-button.tsx`**

Client component taking `appointment`, `baseUrl`, rendering:
- WhatsApp icon button
- Dropdown menu with:
  - "Kirim Konfirmasi Jadwal" (opens wa.me with confirmation template)
  - "Kirim Pengingat H-1" (opens wa.me with 1-day reminder template)
  - "Kirim Pengingat H-2 Jam" (opens wa.me with 2-hour reminder template)
- Calls `markReminderSent(id, type)` on click to update database timestamp.
- Shows subtle checkmark badge if reminder was already sent.

- [ ] **Step 3: Wire WA button into `appointments/page.tsx` and `appointments/[id]/page.tsx`**

Add `AppointmentWaButton` to the table action column and detail card.

- [ ] **Step 4: Verify build & lint**

Run: `npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit && npm run build`
Expected: Exit code 0, all static and dynamic routes compiled.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add src/app/api/public/book/route.ts src/components/portal/appointment-wa-button.tsx src/app/\(portal\)/appointments/
GIT_MASTER=1 git commit -m "feat(connect): enforce schedule blocks in booking API and add WA reminder button"
```

---

### Task 5: End-to-End Verification & Documentation

- [ ] **Step 1: Check for em-dashes (zero em-dash rule)**

Run: `git grep "—" src/`
Expected: 0 matches.

- [ ] **Step 2: Run full build and linter**

Run: `npm run build && npx eslint "src/**/*.{ts,tsx}"`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Final verification commit**

```bash
GIT_MASTER=1 git commit -m "chore(connect): verify and complete CONNECT module polish"
```
