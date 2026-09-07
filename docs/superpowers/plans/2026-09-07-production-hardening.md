# Core Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver complete production-grade hardening: full multi-branch lifecycle management (`/branches`), clinical CMS for dental services (`/services`) and doctors (`/doctors`), staff user profile and secure password changer (`/settings/profile`, `/settings/security`), and database-driven organization entitlements and profile editing (`/settings/organization`).

**Architecture:** Server actions in `src/lib/actions/` (`branches.ts`, `services.ts`, `doctors.ts`, `account.ts`, `settings.ts`) enforcing multi-tenant isolation and RBAC; interactive modal dialogs and forms; pure validation helpers covered by Vitest; and header/sidebar navigation wiring.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Prisma 6 (PostgreSQL), bcryptjs, Tailwind CSS v4, Lucide React icons, Vitest.

## Global Constraints

- Tech stack: Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Prisma 6, bcryptjs.
- Copy rule: Strictly zero em-dashes (U+2014) across all UI strings, labels, and placeholders. Use `-` or `·`.
- Timezone: All dates in Indonesian locale (`id-ID`) and `Asia/Jakarta` (WIB = UTC+7).
- Multi-tenant security: All queries and mutations must verify `session.user.organizationId`.
- Type safety: No `as any`, no `@ts-ignore`, no empty catch blocks.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: Full Multi-Branch Lifecycle Management (`/branches`)

**Files:**
- Create: `src/lib/actions/branches.ts`
- Create: `src/app/(portal)/branches/branch-modal.tsx`
- Modify: `src/app/(portal)/branches/page.tsx`
- Create: `tests/branches.test.ts`

**Interfaces:**
- Produces:
  - `createBranch(data: { name: string; address?: string; city?: string; province?: string; whatsapp?: string; openingHours?: Record<string, string>; googleMapsUrl?: string }): Promise<{ ok: boolean; error?: string; branchId?: string }>`
  - `updateBranch(id: string, data: { name: string; address?: string; city?: string; province?: string; whatsapp?: string; openingHours?: Record<string, string>; googleMapsUrl?: string; isActive?: boolean }): Promise<{ ok: boolean; error?: string }>`
  - `generateBranchSlug(name: string): string`
  - Active "+ Tambah Cabang" button and "Edit" action buttons in `/branches`

- [ ] **Step 1: Write unit tests for slug generation and input validation**

Create `tests/branches.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { generateBranchSlug } from "../src/lib/actions/branches";

describe("Branch slug generation", () => {
  it("generates URL-friendly slugs from branch names", () => {
    expect(generateBranchSlug("Kelapa Gading")).toBe("kelapa-gading");
    expect(generateBranchSlug("Cabang Pluit Indah 2")).toBe("cabang-pluit-indah-2");
    expect(generateBranchSlug("Dr. Soetomo - Surabaya")).toBe("dr-soetomo-surabaya");
  });
});
```

- [ ] **Step 2: Implement `src/lib/actions/branches.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export function generateBranchSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createBranch(data: {
  name: string;
  address?: string;
  city?: string;
  province?: string;
  whatsapp?: string;
  openingHours?: Record<string, string>;
  googleMapsUrl?: string;
}): Promise<{ ok: boolean; error?: string; branchId?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const { organizationId, role } = session.user;
  if (role !== "DIRECTOR" && role !== "SUPER_ADMIN") {
    return { ok: false, error: "Hanya Direktur yang berwenang menambahkan cabang baru." };
  }

  const cleanName = data.name.trim();
  if (cleanName.length < 2) return { ok: false, error: "Nama cabang minimal 2 karakter." };

  let baseSlug = generateBranchSlug(cleanName);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.branch.findUnique({ where: { organizationId_slug: { organizationId, slug } } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  try {
    const branch = await prisma.branch.create({
      data: {
        organizationId,
        name: cleanName,
        slug,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        province: data.province?.trim() || "DKI Jakarta",
        whatsapp: data.whatsapp?.trim() || null,
        openingHours: data.openingHours || null,
        googleMapsUrl: data.googleMapsUrl?.trim() || null,
        isActive: true,
      },
    });

    revalidatePath("/branches");
    revalidatePath("/lokasi");
    revalidatePath("/book");
    return { ok: true, branchId: branch.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal membuat cabang." };
  }
}

export async function updateBranch(
  id: string,
  data: {
    name: string;
    address?: string;
    city?: string;
    province?: string;
    whatsapp?: string;
    openingHours?: Record<string, string>;
    googleMapsUrl?: string;
    isActive?: boolean;
  },
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const { organizationId, role } = session.user;
  if (role !== "DIRECTOR" && role !== "SUPER_ADMIN" && role !== "MANAGER") {
    return { ok: false, error: "Akses tidak diizinkan." };
  }

  const cleanName = data.name.trim();
  if (cleanName.length < 2) return { ok: false, error: "Nama cabang minimal 2 karakter." };

  const branch = await prisma.branch.findFirst({
    where: { id, organizationId },
    select: { id: true },
  });

  if (!branch) return { ok: false, error: "Cabang tidak ditemukan." };

  try {
    await prisma.branch.update({
      where: { id },
      data: {
        name: cleanName,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        province: data.province?.trim() || "DKI Jakarta",
        whatsapp: data.whatsapp?.trim() || null,
        openingHours: data.openingHours !== undefined ? data.openingHours : undefined,
        googleMapsUrl: data.googleMapsUrl?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });

    revalidatePath("/branches");
    revalidatePath("/lokasi");
    revalidatePath("/book");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui cabang." };
  }
}
```

- [ ] **Step 3: Implement `src/app/(portal)/branches/branch-modal.tsx`**

Create client component:
- Supports both Create mode ("Tambah Cabang Baru") and Edit mode ("Edit Cabang").
- Fields: Nama Cabang, Alamat, Kota, Provinsi, No. WhatsApp, Google Maps URL, Status Aktif switch.
- Jam Operasional input ringkas (Senin - Minggu).
- Dismissal with Escape key and outside click.
- Submits via `startTransition`.

- [ ] **Step 4: Update `/branches/page.tsx`**

Activate "+ Tambah Cabang" button and "Edit" button on each branch card, connecting them to `BranchModal`.

- [ ] **Step 5: Verify typecheck & tests**

Run: `npx vitest run tests/branches.test.ts && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/actions/branches.ts src/app/\(portal\)/branches/ tests/branches.test.ts
GIT_MASTER=1 git commit -m "feat(portal): add full multi-branch management actions and modal"
```

---

### Task 2: Clinical CMS Suite (Services Catalog & Doctor Assignment)

**Files:**
- Create: `src/lib/actions/services.ts`
- Create: `src/lib/actions/doctors.ts`
- Create: `src/app/(portal)/services/service-modal.tsx`
- Create: `src/app/(portal)/services/page.tsx`
- Create: `src/app/(portal)/doctors/doctor-modal.tsx`
- Modify: `src/app/(portal)/doctors/page.tsx`
- Modify: `src/components/portal/sidebar.tsx`

**Interfaces:**
- Produces:
  - `createService`, `updateService` server actions
  - `createDoctor`, `updateDoctor` server actions
  - Route `/services` for dental procedure pricing and catalog
  - Active "+ Tambah Dokter" and doctor edit modal in `/doctors`
  - Sidebar link "Layanan Gigi" under GROW module

- [ ] **Step 1: Implement `src/lib/actions/services.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createService(data: {
  name: string;
  price: number;
  durationMin: number;
  description?: string;
}): Promise<{ ok: boolean; error?: string; serviceId?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const { organizationId } = session.user;
  const cleanName = data.name.trim();
  if (cleanName.length < 2) return { ok: false, error: "Nama layanan minimal 2 karakter." };

  const slug = cleanName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  try {
    const service = await prisma.service.create({
      data: {
        organizationId,
        name: cleanName,
        slug,
        price: data.price,
        durationMin: data.durationMin,
        description: data.description?.trim() || null,
        isActive: true,
      },
    });

    revalidatePath("/services");
    revalidatePath("/layanan");
    revalidatePath("/book");
    return { ok: true, serviceId: service.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menambahkan layanan." };
  }
}

export async function updateService(
  id: string,
  data: {
    name: string;
    price: number;
    durationMin: number;
    description?: string;
    isActive?: boolean;
  },
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const existing = await prisma.service.findFirst({
    where: { id, organizationId: session.user.organizationId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Layanan tidak ditemukan." };

  try {
    await prisma.service.update({
      where: { id },
      data: {
        name: data.name.trim(),
        price: data.price,
        durationMin: data.durationMin,
        description: data.description?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });

    revalidatePath("/services");
    revalidatePath("/layanan");
    revalidatePath("/book");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui layanan." };
  }
}
```

- [ ] **Step 2: Implement `src/lib/actions/doctors.ts`**

Implement `createDoctor` and `updateDoctor`:
- Creates doctor with credentials: `name`, `title`, `specialty`, `sipNumber`, `strNumber`, `yearsExperience`, `bio`.
- Manages `BranchDoctor` relations for assigned branches in a `prisma.$transaction`.
- Revalidates `/doctors`, `/dokter`, `/schedule`, and `/book`.

- [ ] **Step 3: Implement `service-modal.tsx` & `/services/page.tsx`**

- `service-modal.tsx`: Dialog for creating/editing service (name, price in Rupiah, duration in minutes, description, active switch).
- `/services/page.tsx`: Server Component listing services with category, duration badge, price formatted in Rupiah, active badge, and "+ Tambah Layanan" button.

- [ ] **Step 4: Implement `doctor-modal.tsx` & update `/doctors/page.tsx`**

- `doctor-modal.tsx`: Dialog with doctor credentials, bio, and branch assignment checkboxes.
- Update `/doctors/page.tsx`: Enable "+ Tambah Dokter" and add "Edit" action on doctor cards.

- [ ] **Step 5: Add "Layanan Gigi" to sidebar navigation**

In `src/components/portal/sidebar.tsx`:
Add navigation item for Services under GROW module (`userModules.grow`).

- [ ] **Step 6: Verify typecheck & build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 errors.

- [ ] **Step 7: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/actions/services.ts src/lib/actions/doctors.ts src/app/\(portal\)/services/ src/app/\(portal\)/doctors/ src/components/portal/sidebar.tsx
GIT_MASTER=1 git commit -m "feat(cms): add dental services catalog, doctor management, and branch assignment"
```

---

### Task 3: User Profile & Account Security (`/settings/profile`, `/settings/security`)

**Files:**
- Create: `src/lib/actions/account.ts`
- Create: `src/app/(portal)/settings/profile/profile-form.tsx`
- Create: `src/app/(portal)/settings/profile/page.tsx`
- Create: `src/app/(portal)/settings/security/password-form.tsx`
- Create: `src/app/(portal)/settings/security/page.tsx`
- Modify: `src/components/portal/header.tsx`
- Create: `tests/account.test.ts`

**Interfaces:**
- Produces:
  - `updateUserProfile(data: { name: string }): Promise<{ ok: boolean; error?: string }>`
  - `changeUserPassword(data: { currentPassword: string; newPassword: string }): Promise<{ ok: boolean; error?: string }>`
  - Route `/settings/profile`
  - Route `/settings/security`
  - Working dropdown links in portal header

- [ ] **Step 1: Write unit tests for password verification logic**

Create `tests/account.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

describe("Account security hashing", () => {
  it("verifies and hashes passwords correctly with bcrypt", async () => {
    const password = "demoPassword123";
    const hash = await bcrypt.hash(password, 10);

    expect(await bcrypt.compare("demoPassword123", hash)).toBe(true);
    expect(await bcrypt.compare("wrongPassword", hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Implement `src/lib/actions/account.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateUserProfile(data: {
  name: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const cleanName = data.name.trim();
  if (cleanName.length < 2) return { ok: false, error: "Nama minimal 2 karakter." };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: cleanName },
    });

    revalidatePath("/settings/profile");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui profil." };
  }
}

export async function changeUserPassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  if (data.newPassword.length < 8) {
    return { ok: false, error: "Password baru minimal 8 karakter." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) return { ok: false, error: "Pengguna tidak ditemukan." };

  const isCurrentValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return { ok: false, error: "Password saat ini salah." };
  }

  const newHash = await bcrypt.hash(data.newPassword, 12);
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal mengubah password." };
  }
}
```

- [ ] **Step 3: Implement `/settings/profile` page and form**

- `profile-form.tsx`: Form editing display name with submit state and success toast.
- `page.tsx`: Server component displaying User ID, Email, Role badge, Branch badge, and `<ProfileForm />`.

- [ ] **Step 4: Implement `/settings/security` page and form**

- `password-form.tsx`: Form with Password Saat Ini, Password Baru, Konfirmasi Password Baru, validation, and error alert.
- `page.tsx`: Server component with security guidelines card and `<PasswordForm />`.

- [ ] **Step 5: Wire header dropdown links**

In `src/components/portal/header.tsx`:
Update dropdown:
- "Profil Pengguna" -> `href="/settings/profile"`
- "Keamanan Akun" -> `href="/settings/security"`

- [ ] **Step 6: Verify typecheck & tests**

Run: `npx vitest run tests/account.test.ts && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/actions/account.ts src/app/\(portal\)/settings/profile/ src/app/\(portal\)/settings/security/ src/components/portal/header.tsx tests/account.test.ts
GIT_MASTER=1 git commit -m "feat(account): add user profile page, password change flow, and header links"
```

---

### Task 4: Organization Entitlements Board & Clinic Profile (`/settings/organization`)

**Files:**
- Create: `src/lib/actions/settings.ts`
- Create: `src/app/(portal)/settings/organization/org-profile-form.tsx`
- Modify: `src/app/(portal)/settings/organization/page.tsx`

**Interfaces:**
- Produces:
  - `updateOrganizationProfile(data: { name: string }): Promise<{ ok: boolean; error?: string }>`
  - Real database-driven organization settings page
  - Subscription entitlement status board reflecting `moduleGrow`, `moduleConnect`, `moduleOperate`, `moduleIntelligence` from DB

- [ ] **Step 1: Implement `src/lib/actions/settings.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateOrganizationProfile(data: {
  name: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const { organizationId, role } = session.user;
  if (role !== "DIRECTOR" && role !== "SUPER_ADMIN") {
    return { ok: false, error: "Hanya Direktur yang berwenang mengubah profil klinik." };
  }

  const cleanName = data.name.trim();
  if (cleanName.length < 2) return { ok: false, error: "Nama klinik minimal 2 karakter." };

  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { name: cleanName },
    });

    revalidatePath("/settings/organization");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui profil klinik." };
  }
}
```

- [ ] **Step 2: Implement `org-profile-form.tsx`**

Client component with input for Organization Name, read-only URL Slug, submit button, and status feedback toast.

- [ ] **Step 3: Update `src/app/(portal)/settings/organization/page.tsx`**

Server Component:
- Queries `prisma.organization.findUnique` for active user's `organizationId`.
- Renders:
  - Header "Pengaturan Organisasi".
  - Left Card: `<OrgProfileForm initialName={org.name} slug={org.slug} />`.
  - Right Card: **"Paket & Lisensi Modul Terdaftar"**
    - Renders 4 module entitlement cards (*GROW, CONNECT, OPERATE, INTELLIGENCE*).
    - Checks boolean flags `moduleGrow`, `moduleConnect`, `moduleOperate`, `moduleIntelligence`.
    - If `true`: Emerald badge "Aktif · Berlisensi" with summary of included capabilities.
    - If `false`: Slate badge "Tidak Termasuk Paket".
    - Enterprise assistance footer: "Untuk penambahan modul atau cabang klinik baru, hubungi perwakilan Think Edge Enterprise."

- [ ] **Step 4: Verify typecheck & build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 errors.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/actions/settings.ts src/app/\(portal\)/settings/organization/
GIT_MASTER=1 git commit -m "feat(settings): connect organization profile to database and render entitlement board"
```

---

### Task 5: End-to-End Verification & Quality Polish

- [ ] **Step 1: Zero em-dash scan**

Run: `git grep "\u2014" src/`
Expected: 0 matches.

- [ ] **Step 2: Run all Vitest test suites**

Run: `npx vitest run`
Expected: All tests pass across branches, account, and prior suites.

- [ ] **Step 3: Run ESLint and TypeScript checks**

Run: `npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: 100% successful build with all routes recognized.

- [ ] **Step 5: Final verification commit**

```bash
GIT_MASTER=1 git commit -m "chore(release): complete and verify core production hardening"
```
