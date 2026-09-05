"use server";

export interface WaAppointmentData {
  patientName: string;
  branchName: string;
  branchAddress: string;
  doctorName: string;
  service: string;
  scheduledAt: Date;
  cancelToken: string;
  patientPhone: string;
}

export function formatPhoneForWhatsapp(phone: string): string {
  let cleaned = phone.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  return cleaned;
}

function formatWibDateTime(date: Date): string {
  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);

  return `${formatted} WIB`;
}

export function getConfirmationWaLink(apt: WaAppointmentData, baseUrl: string): string {
  const phone = formatPhoneForWhatsapp(apt.patientPhone);
  const formattedDate = formatWibDateTime(apt.scheduledAt);
  const cancelLink = `${baseUrl}/cancel?token=${apt.cancelToken}`;

  const message = `Halo Kak ${apt.patientName},

Berikut adalah konfirmasi janji temu Anda di Klinik Gigi:
- Cabang: ${apt.branchName}
- Alamat: ${apt.branchAddress}
- Dokter: ${apt.doctorName}
- Layanan: ${apt.service}
- Waktu: ${formattedDate}

Jika ingin membatalkan atau mengubah jadwal, silakan akses tautan mandiri berikut:
${cancelLink}

Terima kasih atas kepercayaan Anda.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getReminderWaLink(
  apt: WaAppointmentData,
  type: "1day" | "2hour",
  baseUrl: string,
): string {
  const phone = formatPhoneForWhatsapp(apt.patientPhone);
  const formattedDate = formatWibDateTime(apt.scheduledAt);
  const cancelLink = `${baseUrl}/cancel?token=${apt.cancelToken}`;

  let message: string;

  if (type === "1day") {
    message = `Halo Kak ${apt.patientName},

Pengingat jadwal janji temu Anda besok (H-1):
- Cabang: ${apt.branchName}
- Alamat: ${apt.branchAddress}
- Dokter: ${apt.doctorName}
- Layanan: ${apt.service}
- Waktu: ${formattedDate}

Jika berhalangan hadir dan perlu membatalkan jadwal, silakan gunakan tautan berikut:
${cancelLink}

Sampai jumpa di klinik!`;
  } else {
    message = `Halo Kak ${apt.patientName},

Pengingat jadwal janji temu Anda dalam 2 jam ke depan:
- Cabang: ${apt.branchName}
- Alamat: ${apt.branchAddress}
- Dokter: ${apt.doctorName}
- Layanan: ${apt.service}
- Waktu: ${formattedDate}

Mohon hadir 10-15 menit sebelum waktu kunjungan. Sampai jumpa di klinik!`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}