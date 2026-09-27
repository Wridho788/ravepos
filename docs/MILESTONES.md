# Milestones — RavaPOS

**Status implementasi (27 September 2026):** M0–M1 dokumen/UX prototipe; M2–M6 fondasi dan fitur inti sekarang diimplementasikan; M7 pemeriksaan perangkat dan pilot harus ditutup; M8 materi kesiapan produk disiapkan, sedangkan penjualan/pengujian harga menunggu pilot nyata. Rincian serta batasan ada di [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

Estimasi untuk satu developer; bukan komitmen tanggal. Karena targetnya aplikasi native Android, lakukan spike integrasi dan uji perangkat lebih awal.

**Urutan build proyek ini:** setelah M0–M1, kerjakan M2 lalu M3–M4. Build APK berikutnya dilakukan setelah M4 selesai agar APK memuat alur katalog dan checkout yang sudah terintegrasi.

## M0 — Product framing & validation (2–3 hari)
- Tetapkan segmen awal dan skenario satu perangkat Android.
- Wawancarai 5–10 calon pengguna.
- Uji minat harga Rp100k/Rp119k/Rp120k.
- Tentukan lisensi, update, dukungan, refund.
- **Gate:** kebutuhan inti konsisten dan ada minat nyata.

## M1 — UX prototype (3–5 hari)
- Rancang setup, katalog, POS, checkout, struk, laporan, backup pada layar ponsel.
- Uji alur dengan calon pengguna dan ukuran layar Android kecil.
- **Gate:** transaksi pertama dapat diselesaikan tanpa arahan besar.

## M2 — Technical spike & foundation (4–7 hari)
- Bandingkan Expo vs React Native CLI berdasarkan SQLite, file picker, printer, barcode, dan build Android.
- Buat prototipe SQLite: transaksi atomik, rollback, migrasi, dan ekspor data.
- Kunci library dan minimum Android setelah uji perangkat.
- Siapkan fondasi React Native + TypeScript, lint/test, navigation, dan design tokens.
- Demo seed/reset.
- **Gate:** pilihan stack dan library tercatat; rancangan skema/migrasi, seed/reset, serta strategi transaksi siap diuji. APK tidak dibangun pada M2.

## M3 — Catalog & inventory (4–6 hari)
- CRUD produk/kategori, stok awal, penyesuaian, stock movement, low-stock indicator, pencarian.
- **Gate:** mutasi stok tercatat dan dapat ditelusuri.

## M4 — POS & transaction integrity (5–8 hari)
- Cart, diskon sederhana, pembayaran tunai/non-tunai manual.
- Checkout atomik, receipt, riwayat, void.
- Test kegagalan checkout dan stok tidak cukup.
- Setelah M4 selesai, buat APK debug pertama yang memuat katalog, checkout, dan alur transaksi terintegrasi.
- **Gate:** tidak ada transaksi parsial/duplikat dan APK debug berhasil dibuat setelah integrasi M3–M4.

## M5 — Customers, receivables & expenses (4–6 hari)
- Pelanggan, piutang, pembayaran sebagian/pelunasan, pengeluaran.
- **Gate:** saldo dan histori konsisten.

## M6 — Reports & data portability (4–6 hari)
- Laporan penjualan, produk terlaris, metode bayar, pengeluaran.
- Ekspor Excel (`.xlsx`) dan CSV untuk produk, transaksi, pelanggan, serta pengeluaran.
- Uji file picker/share sheet di Android target.
- **Gate:** file Excel/CSV valid, dapat dibuka, dan isi ekspor konsisten dengan data lokal.

## M7 — Device integration, QA & pilot (5–8 hari, tergantung hardware)
- Uji offline, relaunch, ekspor file, dan performa.
- Uji printer thermal/barcode hanya jika diputuskan masuk rilis; dokumentasikan model yang teruji.
- Pilot dengan 5–10 usaha/pengguna.
- **Gate:** tidak ada blocker kehilangan data; pengguna memahami batas single-device.

## M8 — Paid launch (setelah pilot)
- Siapkan halaman produk, demo, panduan, FAQ, lisensi, dan kanal support.
- Uji harga Rp119.000; ukur konversi dan permintaan support.
- Prioritaskan fitur P1 berdasarkan bukti penggunaan.

## M9 — Reusable template foundation (setelah keputusan produk)
- Putuskan satu aplikasi multi-usaha atau template dasar yang menghasilkan aplikasi vertikal terpisah.
- Susun registry profil usaha: istilah, kategori awal, satuan, halaman awal, dan modul aktif.
- Jaga alur retail sebagai profil pertama dan jangan tampilkan workflow vertikal yang belum dibangun.
- **Gate:** konfigurasi vertikal terpisah dari business logic dan dapat diuji tanpa mengubah transaksi retail.

## M10 — Catalog and service model
- Migrasi katalog agar membedakan barang yang melacak stok dan jasa yang tidak mengubah stok.
- Tentukan representasi satuan/kuantitas presisi (misalnya gram laundry) dan jaga nominal IDR tetap integer.
- Uji migrasi database versi 1 dengan transaksi retail yang sudah tersimpan.
- **Gate:** retail lama tetap akurat; item jasa dan kuantitas pecahan dapat diuji aman.

## M11 — Pilot satu vertical module
- Pilih satu usaha pertama berdasarkan kebutuhan pengguna dan prioritas bisnis.
- Implementasikan workflow khusus, lifecycle status, laporan/ekspor, dan pengujian perangkat untuk vertikal terpilih.
- Jangan mengembangkan empat workflow penuh sekaligus.
- **Gate:** pemilik usaha target dapat menyelesaikan alur utama tanpa kembali ke proses manual yang kritis.

## Definisi selesai MVP
- Fitur P0 di PRD berfungsi pada Android target.
- Release build dan test inti lulus.
- Checkout, void, migrasi, ekspor Excel/CSV tervalidasi.
- Alur inti berfungsi dalam mode pesawat dan setelah relaunch.
- Batasan penyimpanan lokal, hardware, dan lisensi dijelaskan sebelum pembelian.
