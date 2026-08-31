# API Design

> **Phase 3.4 Deliverable**
> Internal API surface conventions: Server Actions, Route Handlers, error format, rate limiting.

---

## Architecture Decision

**Server Actions for all authenticated internal operations. Route Handlers only for public endpoints and webhooks.**

| Operation | Approach | Why |
|---|---|---|
| Public booking | `POST /api/appointments` (Route Handler) | Unauthenticated, needs rate limiting |
| Slot availability | `GET /api/slots` (Route Handler) | Unauthenticated, cacheable |
| WA cancel link | `POST /api/cancel` (Route Handler) | Unauthenticated, token-based |
| All portal CRUD | Server Actions (`'use server'`) | Auth enforced, no REST needed |
| Reminder generation | Server Action | Auth required (staff only) |
| Analytics data | Server Action | Auth + RBAC enforced |

**Why Server Actions for internal (not REST)?**
- Auth.js session available in Server Actions via `await auth()` — no middleware to write
- Type-safe end-to-end (same TypeScript types for action params + return)
- Automatic CSRF protection (built into Next.js Server Actions)
- No serialization overhead (direct DB query, return typed result)
- Zod validation co-located with business logic

---

## Public API Routes (Route Handlers)

### 1. `POST /api/appointments` — Create Booking

**Who calls it:** Patient booking widget (public, unauthenticated)

**Rate limiting:** 10 requests per IP per minute (prevents abuse, spam bookings)

```ts
// app/api/appointments/route.ts

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { nanoid } from 'nanoid';

const BookingSchema = z.object({
  organizationId: z.string().cuid(),
  branchId: z.string().cuid(),
  doctorId: z.string().cuid().optional(),
  scheduledAt: z.string().datetime(), // ISO 8601
  patientName: z.string().min(2).max(100),
  patientPhone: z.string().regex(/^(\+62|62|0)8\d{8,11}$/, 'Format nomor WA tidak valid'),
  patientEmail: z.string().email().optional(),
  reasonForVisit: z.enum(['CLEANING', 'TOOTHACHE', 'CONSULTATION', 'BRACES', 'OTHER']).optional(),
  insurancePartnerId: z.string().cuid().optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: 'Persetujuan diperlukan' }) }),
});

export async function POST(request: NextRequest) {
  // Rate limit: 10 per IP per minute
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const limited = await rateLimit(ip, { limit: 10, window: '1m' });
  if (limited) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.', code: 'RATE_LIMITED' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON', code: 'BAD_REQUEST' }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const scheduledAt = new Date(data.scheduledAt);

  // Verify slot is in the future
  if (scheduledAt <= new Date()) {
    return NextResponse.json(
      { error: 'Waktu booking harus di masa depan', code: 'INVALID_SLOT_TIME' },
      { status: 422 }
    );
  }

  // Verify org + branch belong together (prevent IDOR)
  const branch = await prisma.branch.findFirst({
    where: { id: data.branchId, organizationId: data.organizationId, isActive: true },
  });
  if (!branch) {
    return NextResponse.json(
      { error: 'Cabang tidak ditemukan', code: 'BRANCH_NOT_FOUND' },
      { status: 404 }
    );
  }

  // Verify doctor is assigned to this branch (if specified)
  if (data.doctorId) {
    const assignment = await prisma.branchDoctor.findUnique({
      where: { branchId_doctorId: { branchId: data.branchId, doctorId: data.doctorId } },
    });
    if (!assignment) {
      return NextResponse.json(
        { error: 'Dokter tidak tersedia di cabang ini', code: 'DOCTOR_NOT_AT_BRANCH' },
        { status: 422 }
      );
    }
  }

  // Upsert patient (phone as unique key per org)
  const patient = await prisma.patient.upsert({
    where: { organizationId_phone: { organizationId: data.organizationId, phone: data.patientPhone } },
    update: { name: data.patientName, email: data.patientEmail ?? undefined },
    create: {
      organizationId: data.organizationId,
      name: data.patientName,
      phone: data.patientPhone,
      email: data.patientEmail,
      consentedAt: new Date(),
      consentIp: ip,
    },
  });

  // Create appointment (unique constraint on [doctorId, scheduledAt] prevents double-booking)
  try {
    const appointment = await prisma.appointment.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        doctorId: data.doctorId,
        patientId: patient.id,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        insurancePartnerId: data.insurancePartnerId,
        reasonForVisit: data.reasonForVisit,
        scheduledAt,
        status: 'CONFIRMED',
        cancelToken: nanoid(32), // one-time cancellation token
      },
      include: { doctor: true, branch: true },
    });

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      cancelToken: appointment.cancelToken,
      summary: {
        branch: appointment.branch.name,
        doctor: appointment.doctor?.name ?? 'Dokter Manapun',
        scheduledAt: appointment.scheduledAt.toISOString(),
        patientName: appointment.patientName,
      }
    }, { status: 201 });

  } catch (error: unknown) {
    // P2002 = Prisma unique constraint violation (double-booking)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slot sudah penuh. Silakan pilih waktu lain.', code: 'SLOT_TAKEN' },
        { status: 409 }
      );
    }
    // Unknown error — log and return generic 500
    console.error('[POST /api/appointments] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

---

### 2. `GET /api/slots` — Available Slot Availability

**Who calls it:** Booking widget (public, unauthenticated), polling for available times

**Caching:** Cache for 30 seconds (short TTL — balance freshness vs DB load)

```ts
// app/api/slots/route.ts

const SlotsQuerySchema = z.object({
  doctorId: z.string().cuid().optional(),
  branchId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = SlotsQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parameter tidak valid', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { doctorId, branchId, date } = parsed.data;
  const targetDate = parseISO(date); // date-fns
  const dayOfWeek = targetDate.getDay();

  // Get all active schedules for this branch/doctor/day
  const schedules = await prisma.schedule.findMany({
    where: {
      branchId,
      ...(doctorId ? { doctorId } : {}),
      dayOfWeek,
      isActive: true,
    },
    include: { doctor: { select: { id: true, name: true, photoUrl: true } } },
  });

  if (schedules.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  // Get existing appointments for this date
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      branchId,
      ...(doctorId ? { doctorId } : {}),
      scheduledAt: {
        gte: startOfDay(targetDate),
        lt: endOfDay(targetDate),
      },
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
    },
    select: { scheduledAt: true, doctorId: true },
  });

  // Get schedule blocks for this date
  const blocks = await prisma.scheduleBlock.findMany({
    where: {
      branchId,
      ...(doctorId ? { doctorId } : {}),
      startAt: { lt: endOfDay(targetDate) },
      endAt: { gt: startOfDay(targetDate) },
    },
  });

  // Generate available slots per schedule
  const bookedTimes = new Set(
    existingAppointments.map(a => `${a.doctorId}:${a.scheduledAt.toISOString()}`)
  );

  const slots = [];
  for (const schedule of schedules) {
    const generatedSlots = generateTimeSlots(
      targetDate,
      schedule.startTime,
      schedule.endTime,
      schedule.slotMinutes
    );

    for (const slot of generatedSlots) {
      if (slot <= new Date()) continue; // skip past slots

      // Check if booked
      const key = `${schedule.doctorId}:${slot.toISOString()}`;
      if (bookedTimes.has(key)) continue;

      // Check if blocked
      const isBlocked = blocks.some(
        b => b.doctorId === schedule.doctorId && b.startAt <= slot && b.endAt > slot
      );
      if (isBlocked) continue;

      slots.push({
        time: slot.toISOString(),
        doctorId: schedule.doctorId,
        doctorName: schedule.doctor.name,
        doctorPhoto: schedule.doctor.photoUrl,
      });
    }
  }

  return NextResponse.json({ slots }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    }
  });
}
```

---

### 3. `POST /api/cancel` — Patient Self-Cancellation

**Who calls it:** Patient clicking cancellation link in WA message (unauthenticated, token-based)

```ts
// app/api/cancel/route.ts

const CancelSchema = z.object({
  token: z.string().length(32),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = CancelSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Token tidak valid', code: 'INVALID_TOKEN' },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: parsed.data.token },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: 'Booking tidak ditemukan', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  if (appointment.status === 'CANCELLED') {
    return NextResponse.json({ success: true, message: 'Booking sudah dibatalkan sebelumnya.' });
  }

  if (['CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)) {
    return NextResponse.json(
      { error: 'Booking tidak dapat dibatalkan', code: 'CANNOT_CANCEL' },
      { status: 409 }
    );
  }

  // Enforce 2-hour cancellation window
  const hoursUntilAppointment = differenceInHours(appointment.scheduledAt, new Date());
  if (hoursUntilAppointment < 2) {
    return NextResponse.json(
      {
        error: 'Pembatalan hanya bisa dilakukan minimal 2 jam sebelum waktu janji.',
        code: 'CANCELLATION_WINDOW_PASSED'
      },
      { status: 409 }
    );
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelToken: null, // invalidate token after use
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Booking berhasil dibatalkan. Slot sudah tersedia untuk pasien lain.'
  });
}
```

---

## Server Actions (Internal/Authenticated)

### Convention

```ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// All actions:
// 1. Start with auth() check
// 2. Validate input with Zod
// 3. Check RBAC (can this role do this action?)
// 4. Execute DB operation
// 5. Return { success: true, data } or { success: false, error }
```

### Example: Check-In Action

```ts
// actions/connect/check-in.ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function checkInAppointment(appointmentId: string) {
  const session = await auth();
  if (!session) return { success: false, error: 'Tidak terautentikasi', code: 'UNAUTHENTICATED' };

  const { user } = session;

  // RBAC: only STAFF, MANAGER, DIRECTOR can check in patients
  if (!['STAFF', 'MANAGER', 'DIRECTOR', 'SUPER_ADMIN'].includes(user.role)) {
    return { success: false, error: 'Tidak diizinkan', code: 'FORBIDDEN' };
  }

  // Fetch appointment — enforce org isolation
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      organizationId: user.organizationId,
      // STAFF/MANAGER can only check in at their own branch
      ...(user.role === 'STAFF' || user.role === 'MANAGER'
        ? { branchId: user.branchId! }
        : {}),
    },
  });

  if (!appointment) {
    return { success: false, error: 'Booking tidak ditemukan', code: 'NOT_FOUND' };
  }

  if (appointment.status !== 'CONFIRMED') {
    return { success: false, error: `Status booking: ${appointment.status}`, code: 'INVALID_STATUS' };
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: 'CHECKED_IN', checkInAt: new Date() },
  });

  return { success: true, data: updated };
}
```

### Example: CMS Update Service Action

```ts
// actions/grow/update-service.ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const UpdateServiceSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function updateService(input: z.infer<typeof UpdateServiceSchema>) {
  const session = await auth();
  if (!session) return { success: false, error: 'Tidak terautentikasi', code: 'UNAUTHENTICATED' };

  // Only DIRECTOR and MANAGER can update CMS content
  if (!['DIRECTOR', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { success: false, error: 'Tidak diizinkan', code: 'FORBIDDEN' };
  }

  const parsed = UpdateServiceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Data tidak valid', code: 'VALIDATION_ERROR', details: parsed.error.flatten() };
  }

  // Ensure service belongs to user's org
  const service = await prisma.service.findFirst({
    where: { id: parsed.data.id, organizationId: session.user.organizationId },
  });
  if (!service) return { success: false, error: 'Layanan tidak ditemukan', code: 'NOT_FOUND' };

  const updated = await prisma.service.update({
    where: { id: service.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      durationMin: parsed.data.durationMin,
      isActive: parsed.data.isActive,
      updatedAt: new Date(),
    },
  });

  // Revalidate patient website pages showing this service
  revalidatePath(`/layanan/${service.slug}`);
  revalidatePath('/layanan');
  revalidatePath('/');

  return { success: true, data: updated };
}
```

---

## Error Response Format

**All API responses (both Route Handlers and Server Actions) use this format:**

```ts
// Success
{ success: true, data: T }

// Error
{
  success: false,
  error: string,      // Human-readable (Indonesian for patient-facing, English OK for internal)
  code: string,       // Machine-readable error code
  details?: unknown,  // Zod error details (validation errors only)
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHENTICATED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | Logged in but wrong role |
| `NOT_FOUND` | 404 | Resource doesn't exist or wrong org |
| `VALIDATION_ERROR` | 422 | Zod validation failed |
| `SLOT_TAKEN` | 409 | Double-booking attempt |
| `CANNOT_CANCEL` | 409 | Appointment can't be cancelled (wrong status) |
| `CANCELLATION_WINDOW_PASSED` | 409 | Within 2-hour cancellation window |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `BAD_REQUEST` | 400 | Malformed request body |
| `INVALID_TOKEN` | 400 | Invalid cancellation token |
| `BRANCH_NOT_FOUND` | 404 | Branch doesn't exist in this org |
| `DOCTOR_NOT_AT_BRANCH` | 422 | Doctor not assigned to requested branch |

---

## Rate Limiting Implementation

**Minimal implementation using in-memory LRU (no Redis needed for MVP):**

```ts
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, { count: number; reset: number }>({
  max: 10000,
  ttl: 60 * 1000, // 1 minute TTL
});

interface RateLimitOptions {
  limit: number;
  window: '1m' | '5m' | '1h';
}

const windowMs = { '1m': 60_000, '5m': 300_000, '1h': 3_600_000 };

export async function rateLimit(key: string, options: RateLimitOptions): Promise<boolean> {
  const now = Date.now();
  const window = windowMs[options.window];
  const entry = cache.get(key) ?? { count: 0, reset: now + window };

  if (now > entry.reset) {
    // Window expired, reset
    cache.set(key, { count: 1, reset: now + window });
    return false; // not limited
  }

  if (entry.count >= options.limit) {
    return true; // limited
  }

  cache.set(key, { count: entry.count + 1, reset: entry.reset });
  return false; // not limited
}
```

**Note:** In-memory rate limit doesn't work with multiple Vercel instances. Phase 2+: replace with Redis (Upstash) for distributed rate limiting. For MVP (single instance or low traffic), in-memory is sufficient.

---

## Caching Strategy

### Patient Website (GROW)

| Page | Cache | Invalidation |
|---|---|---|
| Homepage | `revalidate: 3600` (1 hour) | On CMS save (`revalidatePath('/')`) |
| Service pages | `revalidate: 3600` | On service update |
| Doctor pages | `revalidate: 3600` | On doctor update |
| Location pages | `revalidate: 3600` | On branch update |

### Booking Widget (CONNECT)

| Endpoint | Cache | TTL |
|---|---|---|
| `GET /api/slots` | CDN cache, `s-maxage=30` | 30 seconds |
| `POST /api/appointments` | No cache (write) | N/A |
| `POST /api/cancel` | No cache (write) | N/A |

### Staff Portal

- All portal pages: `no-cache` (always fresh — staff needs real-time data)
- Server Actions: no caching (mutations)

---

## API Versioning

**No versioning for MVP.**

**Rationale:** All consumers (patient website, staff portal) are our own code in the same repo. No external API consumers in MVP. When we add external API (Phase 3+ for partner integrations), add `/api/v1/` prefix.

---

## Security Headers

Applied via `next.config.js`:

```ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://pub-*.r2.dev", // Cloudflare R2 CDN
      "font-src 'self'",
      "connect-src 'self' https://plausible.io", // Analytics
    ].join('; '),
  },
];
```

---

## CORS Policy

**No wildcard CORS for API routes.** All API routes accessible only from own domain:

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,  // e.g., https://app.thinkedge.id
    'http://localhost:3000',           // local dev
  ];

  // For API routes: check origin
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(null, { status: 403 });
    }
  }

  // Auth check for portal routes
  // ... (existing auth middleware)
}
```

**Exception:** `GET /api/slots` and `POST /api/appointments` may be embedded in clinic's own website (different domain from `app.thinkedge.id`). For these routes, allow the clinic's domain via dynamic CORS:

```ts
// Per-org allowed origins stored in Organization.allowedOrigins (Phase 2+ field)
// MVP: no embedding — booking widget lives on thinkedge.id subdomain
```

---

## WA Reminder Link Generation (Helper)

Not an API endpoint — a utility function called in Server Actions:

```ts
// lib/whatsapp.ts
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function generateReminderWaLink(appointment: {
  patient: { name: string; phone: string };
  doctor: { name: string } | null;
  branch: { name: string; address: string | null };
  scheduledAt: Date;
  cancelToken: string | null;
}, type: '1day' | '2hour'): string {
  const phone = appointment.patient.phone.replace(/\D/g, '').replace(/^0/, '62');
  const formattedDate = format(appointment.scheduledAt, 'EEEE, d MMMM yyyy', { locale: id });
  const formattedTime = format(appointment.scheduledAt, 'HH:mm');
  const cancelUrl = appointment.cancelToken
    ? `${process.env.NEXT_PUBLIC_APP_URL}/cancel?token=${appointment.cancelToken}`
    : null;

  const doctorLine = appointment.doctor
    ? `dr. ${appointment.doctor.name}`
    : 'dokter kami';

  const body = type === '1day'
    ? `Halo ${appointment.patient.name},\n\nPengingat: Anda memiliki janji dengan ${doctorLine} besok, ${formattedDate} pukul ${formattedTime} di ${appointment.branch.name}.\n\nAlamat: ${appointment.branch.address ?? '-'}\n\n${cancelUrl ? `Jika tidak bisa hadir, batalkan via:\n${cancelUrl}\n\n` : ''}Terima kasih!`
    : `Halo ${appointment.patient.name},\n\nJanji Anda HARI INI pukul ${formattedTime} dengan ${doctorLine} di ${appointment.branch.name}.\n\nKami tunggu kedatangan Anda! 😊`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
}
```
