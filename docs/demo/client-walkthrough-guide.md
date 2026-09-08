# Panduan Demo & Pitching Klien: Think Edge Dental Suite

> **Target Audiens:** Pemilik Klinik (Owner), Direktur Medis, dan Kepala Operasional Jaringan Klinik Gigi (3+ cabang).  
> **Durasi Demo:** 15 Menit Interaktif + 15 Menit Tanya Jawab.  
> **Tujuan Demo:** Memperlihatkan bagaimana Think Edge Dental Suite menggantikan proses manual berbasis Excel dan grup WhatsApp yang terfragmentasi dengan satu sistem digital terpadu 4 modul (*GROW, CONNECT, OPERATE, INTELLIGENCE*).  

---

## 1. Narasi Utama Pitching (The Core Hook)

> *"Banyak jaringan klinik gigi berkembang pesat membuka cabang baru, namun operasionalnya tertinggal: pasien mengeluh antre lama karena booking lewat chat WhatsApp manual, obat anestesi mendadak habis di cabang tanpa peringatan, dokter berhalangan tanpa sistem pembatalan otomatis, dan Direktur harus menunggu akhir bulan untuk tahu omzet riil tiap cabang dari rekapan Excel.*
> 
> *Think Edge Dental Suite menyatukan seluruh proses ini dalam satu platform terpadu: dari saat pasien pertama kali menemukan klinik di Google, memesan slot dokter secara mandiri, check-in di meja resepsionis, pengelolaan stok obat dan shift dinas, hingga grafik pendapatan real-time di meja Direktur."*

---

## 2. Persiapan Sebelum Demo Dimulai

Pastikan lingkungan demo lokal atau staging telah aktif dengan data seed komprehensif:
1. Pastikan server aplikasi berjalan di browser (`http://localhost:3000` atau URL Vercel).
2. Siapkan 2 tab browser terpisah:
   - **Tab 1 (Incognito/Private Window):** Untuk memperlihatkan sudut pandang publik pasien (`/book` dan `/tentang`).
   - **Tab 2 (Normal Window):** Untuk memperlihatkan portal internal staf dan direktur (`/login`).
3. Akun demo yang digunakan:
   - **Direktur:** `director@demo.com` / `demo123456`
   - **Manajer Cabang:** `manager@demo.com` / `demo123456`
   - **Resepsionis:** `staff@demo.com` / `demo123456`

---

## 3. Skenario Demo Interaktif 15 Menit (Langkah demi Langkah)

### Babak 1: Pengalaman Pasien Mandiri (Menit 0:00 - 3:30)
**Fokus Modul:** GROW & CONNECT  
**Permukaan:** Halaman Publik Pasien (`/` dan `/book`)

1. **Buka Beranda (`/`):**
   - Tunjukkan desain modern (*clinical luxury*), waktu muat instan tanpa patahan visual, katalog layanan unggulan, dan kredensial dokter spesialis lengkap dengan nomor SIP/STR aktif.
   - *Pesan kunci:* "Website ini bukan sekadar profil statis, melainkan mesin pertumbuhan pasien yang ramah ponsel dan terindeks Google secara otomatis."
2. **Klik Tombol "Buat Janji Temu" (`/book`):**
   - **Langkah 1 (Pilih Lokasi & Layanan):** Pilih **Cabang Kelapa Gading** dan layanan **Pembersihan Gigi (Scaling Ultrasonic)**. Perlihatkan bagaimana dokter spesialis tersaring secara otomatis sesuai cabang yang dipilih.
   - **Langkah 2 (Pilih Waktu):** Geser carousel horizontal tanggal 14 hari. Tekan salah satu tanggal yang tersedia, lalu pilih chip slot jam (misal: **10:00 WIB**).
     - *Sorot:* Tidak ada input teks tanggal manual yang rawan salah. Sistem memeriksa ketersediaan dokter dan blok cuti secara real-time sehingga mustahil terjadi bentrok jadwal (*anti double-booking*).
   - **Langkah 3 (Data Diri & Kepatuhan UU PDP):** Isi nama pasien dan nomor WhatsApp.
     - *Sorot:* Tunjukkan kotak persetujuan UU PDP No. 27/2022. Pasien memberikan persetujuan eksplisit yang dicatat waktu dan IP address-nya ke database.
3. **Konfirmasi Reservasi:**
   - Tekan "Konfirmasi Janji". Muncul layar sukses dengan ID Reservasi unik dan tautan langsung untuk konfirmasi instan ke WhatsApp klinik.
   - *Pesan kunci:* "Pasien langsung mendapatkan kepastian jadwal dalam waktu kurang dari 60 detik tanpa menunggu balasan admin chat yang lambat."

---

### Babak 2: Efisiensi Meja Resepsionis & Dokter (Menit 3:30 - 7:00)
**Fokus Modul:** CONNECT  
**Permukaan:** Portal Staf Resepsionis (`/appointments`)  
**Akun:** Masuk sebagai `staff@demo.com`

1. **Buka Jadwal Janji Hari Ini (`/appointments`):**
   - Perlihatkan daftar antrean pasien yang terstruktur rapi berdasarkan jam kunjungan.
   - Pasien yang baru saja melakukan booking online di Babak 1 telah muncul secara instan di tabel dengan status `CONFIRMED`.
2. **Simulasi Pasien Datang (Check-In 1-Klik):**
   - Klik tombol **Detail** pada janji temu pasien, lalu tekan tombol hijau **Check In**.
   - Status seketika berubah menjadi `CHECKED_IN` (*Menunggu Tindakan*) dan waktu kedatangan tercatat otomatis.
3. **Simulasi Dokter Menyelesaikan Tindakan:**
   - Pada halaman detail yang sama, isi catatan tindakan klinis singkat pada form (misal: *"Pembersihan karang gigi regio anterior selesai tanpa komplikasi"*), lalu tekan **Selesaikan Kunjungan**.
   - Status janji temu berubah menjadi `COMPLETED` dan rekam kunjungan otomatis tercatat ke riwayat medis pasien.
4. **Pasien Datang Langsung (Walk-In):**
   - Buka menu `/appointments/new`. Buat janji temu pasien darurat sakit gigi yang datang langsung tanpa booking sebelumnya.
   - *Pesan kunci:* "Resepsionis tidak lagi mencatat di buku tamu kertas. Antrean rapi, status kehadiran transparan, dan rekam medis pasien aman terintegrasi."

---

### Babak 3: Kendali Operasional Cabang & Disiplin Staf (Menit 7:00 - 11:00)
**Fokus Modul:** OPERATE  
**Permukaan:** Portal Operasional Manajer Cabang (`/operate`)  
**Akun:** Masuk sebagai `manager@demo.com`

1. **Inventaris Medis & Peringatan Stok Kritis (`/operate/inventory`):**
   - Tunjukkan 4 kartu KPI: Total Barang, Stok Menipis, Stok Habis, dan Mutasi Hari Ini.
   - Buka baris obat yang memiliki badge merah (misal: *Lidocaine HCl 2%*).
   - Tekan tombol **Catat Mutasi**: Masukkan mutasi pemakaian 2 ampul dengan catatan tindakan bedah minor. Stok otomatis berkurang dan histori log tercatat permanen.
   - Tekan tombol **Riwayat** untuk membuka *drawer timeline* pergerakan stok: siapa yang mencatat, jenis mutasi (Restock, Pemakaian, Rusak, Penyesuaian), dan waktu pencatatan.
   - *Pesan kunci:* "Manajer cabang tahu persis sisa stok bahan medis tanpa perlu opname manual setiap malam. Risiko kehabisan obat bius saat operasi berhasil dihilangkan."
2. **Jadwal Shift Mingguan Staf (`/operate/shifts`):**
   - Perlihatkan kisi kalender mingguan Senin s.d. Minggu. Tunjukkan pemetaan shift Pagi, Siang, dan Fullday untuk dokter dan staf perawat.
   - Klik salah satu sel kosong untuk menambahkan penugasan staf baru.
3. **Presensi Staf Real-Time (`/operate/attendance`):**
   - Tunjukkan jam digital presensi WIB dengan deteksi toleransi keterlambatan 15 menit otomatis.
   - Tunjukkan **Live Attendance Board** di bagian bawah: Manajer dapat melihat siapa saja staf yang sedang bertugas hari ini, siapa yang hadir tepat waktu, dan siapa yang terlambat secara real-time.
4. **Pengajuan & Persetujuan Berjenjang (`/operate/approvals`):**
   - Tunjukkan pengajuan pengadaan alat atau perbaikan dental unit kursi yang diajukan oleh staf dan dapat disetujui atau ditolak oleh manajer dalam hitungan detik.

---

### Babak 4: Kendali Eksekutif Seluruh Cabang & Intelijen Bisnis (Menit 11:00 - 14:00)
**Fokus Modul:** INTELLIGENCE & Tata Kelola  
**Permukaan:** Konsol Manajemen Direktur (`/dashboard` & `/operate/analytics`)  
**Akun:** Masuk sebagai `director@demo.com`

1. **Dasbor Eksekutif & Switcher Cabang Global (`/dashboard`):**
   - Perhatikan header atas: Klik tombol **Branch Switcher**.
   - Pilih **Cabang Pluit** -> seluruh data metrik, peringatan sistem, dan jadwal otomatis berubah menampilkan Cabang Pluit.
   - Pilih kembali **Semua Cabang (Konsolidasi)** -> data seketika terkonsolidasi menampilkan performa seluruh jaringan klinik.
   - *Pesan kunci:* "Direktur dapat memantau satu cabang tertentu atau melihat gambaran besar seluruh jaringan hanya dengan 1 klik, tanpa perlu login berganti-ganti akun."
2. **Analitik Pendapatan & Kinerja Klinis (`/operate/analytics`):**
   - Tunjukkan **Grafik Tren Pendapatan Harian (SVG)** yang interaktif.
   - Tunjukkan metrik kunci bisnis: Total Pendapatan Klinis, Kunjungan Selesai, Tingkat Pembatalan/No-Show, dan Rata-rata Pembayaran per Pasien.
   - Gulir ke bawah untuk menunjukkan:
     - **Tabel Peringkat Dokter:** Dokter mana yang paling produktif menangani pasien dan menyumbang kunjungan terbanyak.
     - **Kontribusi Layanan Gigi:** Layanan apa yang paling diminati (Scaling vs Tambal vs Bleaching vs Implan).
3. **Pusat Laporan & Ekspor CSV (`/operate/reports`):**
   - Pilih laporan Pendapatan atau Kunjungan, tentukan rentang tanggal, lalu klik **Unduh CSV**.
   - File `.csv` langsung terunduh, siap diimpor ke software akuntansi (seperti Jurnal.id/Accurate) atau dianalisis tim keuangan.

---

### Babak 5: Kepatuhan Regulasi UU PDP & Penutup (Menit 14:00 - 15:00)
**Fokus:** Keamanan & Kepatuhan Hukum  
**Permukaan:** Detail Pasien (`/patients/[id]`) & Pengaturan Lisensi (`/settings/organization`)

1. **Kepatuhan Privasi Pasien (UU PDP No. 27/2022):**
   - Buka salah satu profil pasien di `/patients/[id]`.
   - Tunjukkan tombol merah **Hapus Data Pribadi (UU PDP)**: Jika pasien mengajukan hak untuk dilupakan (*Right to Erasure*), sistem akan menganonimkan nama, nomor telepon, dan email pasien, namun **tetap mempertahankan** riwayat transaksi dan medis sesuai kewajiban retensi 5 tahun Permenkes No. 269/2008.
2. **Lisensi Modul Dinamis (`/settings/organization`):**
   - Tunjukkan bagaimana modul klinik (GROW, CONNECT, OPERATE, INTELLIGENCE) dapat disesuaikan dengan paket berlangganan klinik.
3. **Closing Statement:**
   > *"Think Edge Dental Suite bukan sekadar aplikasi pencatatan, melainkan infrastruktur pertumbuhan klinik gigi Anda. Sistem ini membuat pasien senang karena layanan cepat, staf bekerja efisien tanpa stres, dan Direktur memegang kendali penuh atas laba serta kepatuhan regulasi di setiap cabang."*

---

## 4. Panduan Menjawab Keraguan Klien (Objection Handling)

| Keberatan Klien | Jawaban & Pembuktian Solusi |
|---|---|
| *"Staf kami terbiasa pakai Excel dan grup WhatsApp, takut staf bingung belajar sistem baru."* | Tunjukkan antarmuka yang sangat bersih dan berbahasa Indonesia alami. Tidak ada istilah teknis rumit. Alur check-in hanya butuh 1 kali klik, dan jadwal dokter disajikan dalam bentuk kartu visual yang intuitif. |
| *"Apakah data antar cabang bisa tertukar atau bocor?"* | Setiap cabang memiliki isolasi data ketat berbasis peran (*RBAC*). Staf Cabang Kelapa Gading tidak bisa melihat atau mengedit data Cabang Pluit. Hanya Direktur yang memiliki akses konsolidasi. |
| *"Bagaimana jika dokter kami tiba-tiba ada urusan mendadak?"* | Dokter atau manajer cukup membuka menu `/schedule` dan memblokir jam yang bersangkutan. Slot tersebut seketika hilang dari pilihan booking pasien online secara real-time. |
| *"Apakah kami harus beli server komputer mahal di tiap cabang?"* | Tidak perlu. Think Edge adalah cloud native SaaS yang dapat diakses dari browser laptop, tablet, maupun iPad yang sudah ada di klinik tanpa instalasi hardware khusus. |
| *"Apakah aman dari segi hukum perlindungan data medis pasien?"* | Sangat aman. Sistem telah memenuhi seluruh parameter UU PDP No. 27/2022 (persetujuan eksplisit & hak dilupakan) serta mematuhi aturan retensi rekam medis Permenkes No. 269/2008. |
