import { BookingWizard } from "./booking-wizard";

interface BranchDto {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly whatsapp: string | null;
}

interface DoctorDto {
  readonly id: string;
  readonly name: string;
  readonly specialty: string | null;
  readonly photoUrl: string | null;
  readonly branches: { readonly branchId: string }[];
}

interface ServiceDto {
  readonly id: string;
  readonly name: string;
  readonly durationMin: number | null;
}

interface OrgDto {
  readonly id: string;
  readonly name: string;
}

interface BookingPayload {
  readonly org: OrgDto;
  readonly branches: BranchDto[];
  readonly doctors: DoctorDto[];
  readonly services: ServiceDto[];
}

interface EmptyPayload {
  readonly org: OrgDto | null;
  readonly branches: BranchDto[];
  readonly doctors: DoctorDto[];
  readonly services: ServiceDto[];
  readonly error?: string;
}

async function loadBookingData(): Promise<EmptyPayload> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(
      `${baseUrl}/api/public/book?orgSlug=senyum-sehat`,
      { cache: "no-store" },
    );
    if (!res.ok) {
      return {
        org: null,
        branches: [],
        doctors: [],
        services: [],
        error: `Gagal memuat data pemesanan (${res.status})`,
      };
    }
    const data = (await res.json()) as BookingPayload;
    return {
      org: data.org,
      branches: data.branches,
      doctors: data.doctors,
      services: data.services,
    };
  } catch (error) {
    console.error("Failed to load booking data:", error);
    return {
      org: null,
      branches: [],
      doctors: [],
      services: [],
      error: "Layanan pemesanan sedang tidak tersedia. Silakan coba lagi.",
    };
  }
}

export default async function BookingPage() {
  const { org, branches, doctors, services, error } = await loadBookingData();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <header className="max-w-2xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            Reservasi Kunjungan Klinik
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Buat Janji Temu
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Pilih cabang, dokter, dan waktu yang paling sesuai. Tim resepsionis akan mengonfirmasi jadwal Anda melalui WhatsApp dalam 15 menit setelah reservasi terkirim.
          </p>
        </header>

        <div className="mt-10 sm:mt-14 flex justify-center">
          {org && branches.length > 0 ? (
            <BookingWizard
              org={org}
              branches={branches}
              doctors={doctors}
              services={services}
            />
          ) : (
            <div className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                {error ?? "Belum ada cabang aktif untuk pemesanan saat ini."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Silakan hubungi resepsionis melalui kanal WhatsApp resmi klinik untuk konfirmasi jadwal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
