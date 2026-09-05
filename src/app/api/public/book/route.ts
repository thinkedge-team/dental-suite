import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@/generated/prisma";

// ponytail: in-memory rate limiter — resets on cold start; replace with Upstash Redis when traffic justifies it
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// GET /api/public/book?orgSlug=senyum-sehat
// Returns branches, doctors, and services for the booking form.
// ---------------------------------------------------------------------------

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const orgSlug = searchParams.get("orgSlug");

    if (!orgSlug) {
      return Response.json({ error: "orgSlug required" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: { id: true, name: true, moduleConnect: true },
    });

    if (!org || !org.moduleConnect) {
      return Response.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    const [branches, doctors, services] = await Promise.all([
      prisma.branch.findMany({
        where: { organizationId: org.id, isActive: true },
        select: { id: true, name: true, address: true, whatsapp: true },
      }),
      prisma.doctor.findMany({
        where: { organizationId: org.id, isActive: true },
        select: {
          id: true,
          name: true,
          specialty: true,
          photoUrl: true,
          branches: { select: { branchId: true } },
        },
      }),
      prisma.service.findMany({
        where: { organizationId: org.id, isActive: true },
        select: { id: true, name: true, durationMin: true },
      }),
    ]);

    return Response.json({
      org: { id: org.id, name: org.name },
      branches,
      doctors,
      services,
    });
  } catch (error) {
    console.error("GET /api/public/book failed:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/public/book
// Creates a patient self-booking appointment.
// ---------------------------------------------------------------------------

interface BookingBody {
  readonly orgSlug: string;
  readonly branchId: string;
  readonly doctorId?: string;
  readonly serviceId?: string;
  readonly scheduledAt: string;
  readonly patientName: string;
  readonly patientPhone: string;
  readonly patientEmail?: string;
  readonly notes?: string;
}

type ParseResult =
  | { readonly ok: true; readonly value: BookingBody }
  | { readonly ok: false; readonly error: string };

function parseBookingBody(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "JSON body must be an object" };
  }

  const fields = new Map(Object.entries(body));
  const orgSlug = fields.get("orgSlug");
  const branchId = fields.get("branchId");
  const scheduledAt = fields.get("scheduledAt");
  const patientName = fields.get("patientName");
  const patientPhone = fields.get("patientPhone");
  const doctorId = fields.get("doctorId");
  const serviceId = fields.get("serviceId");
  const patientEmail = fields.get("patientEmail");
  const notes = fields.get("notes");

  if (
    typeof orgSlug !== "string" ||
    !orgSlug ||
    typeof branchId !== "string" ||
    !branchId ||
    typeof scheduledAt !== "string" ||
    !scheduledAt ||
    typeof patientName !== "string" ||
    !patientName ||
    typeof patientPhone !== "string" ||
    !patientPhone
  ) {
    return {
      ok: false,
      error:
        "Missing required fields: orgSlug, branchId, scheduledAt, patientName, patientPhone",
    };
  }

  if (
    (doctorId !== undefined && typeof doctorId !== "string") ||
    (serviceId !== undefined && typeof serviceId !== "string") ||
    (patientEmail !== undefined && typeof patientEmail !== "string") ||
    (notes !== undefined && typeof notes !== "string")
  ) {
    return { ok: false, error: "Optional fields must be strings" };
  }

  return {
    ok: true,
    value: {
      orgSlug,
      branchId,
      scheduledAt,
      patientName,
      patientPhone,
      doctorId,
      serviceId,
      patientEmail,
      notes,
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Terlalu banyak permintaan. Coba lagi dalam 1 menit." }, { status: 429 });
  }

  // --- Parse body --------------------------------------------------------
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseBookingBody(rawBody);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const {
    orgSlug,
    branchId,
    doctorId,
    serviceId,
    scheduledAt,
    patientName,
    patientPhone,
    patientEmail,
  } = parsed.value;

  // --- Field validation --------------------------------------------------
  if (patientPhone.length < 8) {
    return Response.json(
      { error: "patientPhone must be at least 8 characters" },
      { status: 400 },
    );
  }

  try {
    // --- Organization lookup ---------------------------------------------
    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: { id: true, moduleConnect: true },
    });

    if (!org || !org.moduleConnect) {
      return Response.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // --- Branch validation ------------------------------------------------
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, organizationId: org.id, isActive: true },
      select: { id: true },
    });

    if (!branch) {
      return Response.json({ error: "Invalid branch" }, { status: 400 });
    }

    // --- Date validation --------------------------------------------------
    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return Response.json(
        { error: "scheduledAt must be a valid ISO date" },
        { status: 400 },
      );
    }
    if (scheduledDate <= new Date()) {
      return Response.json(
        { error: "scheduledAt must be in the future" },
        { status: 400 },
      );
    }

    // --- Patient upsert ---------------------------------------------------
    const patient = await prisma.patient.upsert({
      where: {
        organizationId_phone: {
          organizationId: org.id,
          phone: patientPhone,
        },
      },
      update: { name: patientName },
      create: {
        organizationId: org.id,
        name: patientName,
        phone: patientPhone,
        email: patientEmail ?? null,
      },
    });

    // --- Appointment creation ---------------------------------------------
    const appointment = await prisma.appointment.create({
      data: {
        organizationId: org.id,
        branchId,
        doctorId: doctorId ?? null,
        patientId: patient.id,
        patientName,
        patientPhone,
        service: serviceId ?? null,
        scheduledAt: scheduledDate,
        walkin: false,
        status: AppointmentStatus.CONFIRMED,
      },
    });

    return Response.json(
      { success: true, appointmentId: appointment.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/public/book failed:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
