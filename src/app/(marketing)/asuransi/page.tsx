import { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  HelpCircle,
  Clock,
  FileCheck,
  UserCheck,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { InsuranceGrid } from "@/components/grow/insurance-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mitra Asuransi & Pembayaran | Klinik Gigi Senyum Sehat",
  description:
    "Klaim asuransi gigi cashless dan reimbursement mudah di Klinik Gigi Senyum Sehat. Mitra resmi AdMedika, Prudential, BCA Life, Mandiri Inhealth, dan Sinarmas.",
};

const CLAIM_STEPS = [
  {
    step: "01",
    title: "Verifikasi Kepesertaan di Resepsionis",
    description:
      "Tunjukkan kartu fisik asuransi, e-card via aplikasi, atau nomor polis bersama KTP Anda kepada staf front office kami sebelum tindakan dimulai.",
    icon: UserCheck,
  },
  {
    step: "02",
    title: "Perawatan Sesuai Plafon & Indikasi Medis",
    description:
      "Dokter spesialis kami akan melakukan pemeriksaan awal, menyampaikan estimasi biaya serta tindakan yang masuk dalam cakupan manfaat polis Anda.",
    icon: FileCheck,
  },
  {
    step: "03",
    title: "Swipe Cashless / Dokumen Lengkap Instan",
    description:
      "Untuk asuransi cashless, transaksi diproses langsung via mesin EDC / web portal. Untuk skema reimbursement, berkas medis dan kuitansi bermaterai siap seketika.",
    icon: CreditCard,
  },
];

const INSURANCE_FAQS = [
  {
    q: "Apakah seluruh perawatan gigi dapat ditanggung asuransi?",
    a: "Cakupan perawatan tergantung pada ketentuan polis asuransi Anda. Umumnya tindakan pencegahan dan kuratif seperti scaling karang gigi, tambal gigi komposit, dan pencabutan gigi bungsu ditanggung. Sedangkan tindakan murni estetika seperti veneer dan bleaching gigi biasanya memerlukan persetujuan khusus atau merupakan tanggungan pribadi.",
  },
  {
    q: "Bagaimana cara penggunaan BPJS Kesehatan di Klinik Gigi Senyum Sehat?",
    a: "Untuk pasien BPJS Kesehatan, kami menerima pasien dengan rujukan Faskes Tingkat 1 ke dokter gigi spesialis kami (skema reimbursement / rujukan terkoordinasi). Mohon bawa surat rujukan aktif dari faskes pertama Anda.",
  },
  {
    q: "Apakah bisa melakukan koordinasi manfaat (Coordination of Benefits / COB)?",
    a: "Ya, kami melayani sistem koordinasi manfaat antara BPJS Kesehatan dan Asuransi Swasta, atau antara dua asuransi swasta yang berbeda. Tim administrasi kami akan menerbitkan salinan legalisir berkas medis dan kuitansi penagihan.",
  },
  {
    q: "Bagaimana jika biaya perawatan melebihi limit plafon tahunan asuransi saya?",
    a: "Jika tagihan melebihi plafon polis (excess claim), selisih biaya dapat dibayarkan secara langsung menggunakan QRIS, kartu debit, kartu kredit, maupun cicilan 0% yang tersedia di kasir kami.",
  },
  {
    q: "Apakah asuransi perusahaan / corporate insurance dapat digunakan?",
    a: "Tentu. Kami bermitra dengan asuransi korporasi terkemuka dan Third Party Administrator (TPA) seperti AdMedika, Prudential, BCA Life, Mandiri Inhealth, dan Sinarmas. Silakan konsultasikan kepesertaan Anda ke tim WhatsApp kami.",
  },
];

export default async function InsurancePage() {
  const partners = await prisma.insurancePartner.findMany({
    where: {
      organization: { slug: "senyum-sehat" },
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const mappedPartners = partners.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: "CASHLESS" as const,
    logoText: p.slug.toUpperCase(),
    logoUrl: p.logoUrl,
    coverageDetails: p.coverageDetails,
    claimProcess: p.claimProcess,
    supportedBranches: ["Kelapa Gading", "Pluit"],
  }));

  return (
    <div className="py-12 md:py-20 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 font-sans">
      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <CreditCard className="w-3.5 h-3.5" /> Jaminan & Kemudahan Pembayaran
        </div>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Mitra Asuransi & <span className="font-bold">Pembayaran Fleksibel</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Nikmati kemudahan perawatan gigi tanpa beban finansial mendadak. Kami
          bekerja sama dengan puluhan perusahaan asuransi terkemuka untuk fasilitas
          klaim cashless maupun reimbursement cepat.
        </p>
      </div>

      {/* Insurance Grid Section */}
      <section className="mb-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              Daftar Rekanan
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Perusahaan Asuransi Rekanan Kami
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            *Daftar rekanan diperbarui secara berkala
          </span>
        </div>

        <InsuranceGrid insurances={mappedPartners} />
      </section>

      {/* 3-Step Illustrated Guide for Claiming */}
      <section className="mb-20 rounded-3xl bg-muted/30 border border-border/70 p-8 md:p-12 shadow-xs space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> Alur Cepat & Transparan
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            3 Langkah Mudah Klaim Asuransi Tanpa Ribet
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Proses administrasi yang ringkas dan didukung tim khusus asuransi agar Anda
            dapat fokus sepenuhnya pada pemulihan kesehatan gigi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLAIM_STEPS.map((stepItem) => {
            const Icon = stepItem.icon;
            return (
              <div
                key={stepItem.step}
                className="relative rounded-2xl bg-card border border-border/70 p-6 sm:p-7 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-primary/30">
                      {stepItem.step}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    {stepItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Didampingi Front Office</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section Regarding Insurance Claims */}
      <section className="mb-20 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
            Bantuan Klaim
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Pertanyaan Seputar Asuransi & Pembayaran
          </h2>
        </div>

        <div className="space-y-4">
          {INSURANCE_FAQS.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-card border border-border/70 p-6 shadow-xs space-y-2"
            >
              <h3 className="text-base font-semibold text-foreground flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Consultation Banner */}
      <div className="rounded-3xl bg-foreground text-background p-8 md:p-12 relative overflow-hidden shadow-lg border border-border/30">
        <div
          className="absolute inset-0 opacity-10 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: 'url("/images/dashboard-hero.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Verifikasi Polis Cepat
            </span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
              Cek Plafon & Manfaat Asuransi <span className="font-bold">Sebelum Tindakan</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Kirimkan foto kartu asuransi Anda ke WhatsApp front office kami untuk
              pengecekan limit plafon dan eligibilitas tindakan tanpa biaya.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Klinik%20Senyum%20Sehat,%20saya%20ingin%20cek%20eligibilitas%20asuransi%20saya%20sebelum%20tindakan."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:shadow-primary/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Verifikasi Polis via WhatsApp</span>
            </a>
            <Link
              href="/layanan"
              className="inline-flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 text-white font-medium px-6 py-3.5 text-sm transition-colors"
            >
              Katalog Layanan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
