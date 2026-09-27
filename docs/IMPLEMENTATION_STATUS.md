# Status implementasi dan rencana sprint

Tanggal pembaruan: 27 September 2026.

## Yang sudah dikerjakan

| Sprint | Cakupan | Hasil |
|---|---|---|
| M2 — fondasi | React Native CLI, TypeScript, SQLite lokal Android, skema awal, migrasi versi 1, seed/reset data contoh | Implementasi ada di `src/data/database.ts` dan jembatan Android `RavaSqliteModule.kt`. Operasi batch SQLite berjalan dalam transaksi. |
| M3–M4 — transaksi | Setup toko, CRUD dasar produk, pencarian kasir, keranjang, tunai/non-tunai manual, stok minimum, mutasi stok, checkout atomik | Checkout menyimpan sale, snapshot item, pergerakan stok, dan piutang dalam satu transaksi. Stok tidak boleh negatif. |
| M5 — pelanggan/biaya | Pelanggan, piutang transaksi, pembayaran parsial/pelunasan, pengeluaran | Saldo piutang diperbarui oleh trigger DB dan menolak pembayaran melebihi saldo. |
| M6 — laporan/data | Penjualan harian, jumlah transaksi, metode bayar, pengeluaran, produk terlaris, ekspor Excel/CSV produk, transaksi, pelanggan, pengeluaran | Android document picker dipakai untuk menyimpan `.xlsx` atau `.csv`. Pemulihan data dari file tidak disediakan. |
| M7 — perangkat | Build dan pemeriksaan APK Android | APK release terbaru terpasang dan dibuka di Samsung A12. Ikon navigasi Material Design tampil. Ekspor `.xlsx` dan `.csv` berhasil disimpan; isi, judul kolom, serta sel numerik Excel tervalidasi. Pembatalan ekspor kembali ke aplikasi tanpa alert teknis. Smoke test transaksi sebelumnya juga lulus. Printer tidak masuk rilis ini. |
| M8 — kesiapan rilis | Panduan produk, FAQ, checklist pilot, dan catatan batasan | Materi disiapkan di [PILOT_AND_LAUNCH.md](PILOT_AND_LAUNCH.md). Pilot 5–10 usaha dan harga Rp119.000 belum tervalidasi. |

## Perubahan UX dan ekspor

- Layar kegagalan pembukaan aplikasi tidak menampilkan detail exception teknis; pengguna melihat animasi identitas aplikasi, pesan umum, dan tombol coba lagi.
- Navigasi bawah memakai `@react-native-vector-icons/material-design-icons` dengan ikon kasir, paket produk, pelanggan, pengeluaran, grafik laporan, dan ekspor data.
- Menu Data menyediakan ekspor Excel dan CSV untuk produk, transaksi, pengeluaran, dan pelanggan. Backup/restore JSON dihapus dari alur produk.
- Ekspor Excel dibentuk sebagai workbook OpenXML `.xlsx`; ekspor CSV menggunakan UTF-8.

## Arah template lintas usaha

- Rancangan inti bersama dan kebutuhan F&B, laundry, barbershop, serta bengkel ada di [BUSINESS_TEMPLATES.md](BUSINESS_TEMPLATES.md).
- Ini masih rancangan produk/arsitektur. Workflow vertikal khusus belum diimplementasikan; aplikasi yang ada tetap POS umum dengan fokus retail.
- Tahap lanjutan yang diusulkan: tentukan bentuk distribusi template, migrasikan katalog barang/jasa dan kebijakan stok, lalu pilot satu vertikal.

## Sprint verifikasi sebelum rilis pilot

1. Bangun APK release dan pasang pada perangkat Android sasaran.
2. Uji mode pesawat: buka toko, tambah produk, checkout, catat pembayaran sebagian, catat pengeluaran, lalu tutup dan buka ulang aplikasi.
3. Ekspor masing-masing dataset dalam format Excel dan CSV. Buka file Excel di aplikasi spreadsheet dan periksa encoding CSV.
4. Uji stok tidak cukup, nominal tunai kurang, pembayaran piutang berlebih, pembatalan pemilih file, dan penyimpanan penuh.
5. Tutup blocker kehilangan data; setelah itu jalankan pilot 5–10 usaha dan evaluasi bahasa produk serta harga.

## Batasan versi ini

- Belum ada sinkronisasi cloud atau pemindahan otomatis antarperangkat.
- File Excel/CSV adalah salinan untuk dibaca dan tidak dapat diimpor kembali untuk memulihkan aplikasi.
- Pembayaran QRIS/transfer dicatat manual; tidak ada verifikasi pembayaran.
- Printer termal, kamera barcode, PIN, dan impor CSV belum didukung.
- Void transaksi dengan alasan dan histori/detail struk belum diselesaikan.
- Laporan yang ada adalah ringkasan hari ini, bukan filter rentang tanggal.
- APK lokal memakai debug signing config; perlu kunci rilis milik pemilik aplikasi sebelum distribusi berbayar.
- Harga Rp119.000, lisensi, refund, dukungan, dan kanal penjualan masih keputusan bisnis terbuka.

## Artefak build dan bukti perangkat

- APK rilis sebelumnya: `build/releases/RavaPOS-android-release-2026-09-27.apk` (release variant, empat ABI, debug-signed untuk sideload).
- Pemasangan ke perangkat uji sebelumnya berhasil melalui `adb install -r`; aplikasi berjalan tanpa Metro.
- Smoke test sebelumnya membuat satu transaksi tunai Rp5.000. Setelah force-stop dan buka ulang, laporan lokal tetap menampilkan satu transaksi dan produk terlaris.
- `node node_modules/typescript/bin/tsc --noEmit` dan `gradlew.bat assembleRelease` lulus untuk versi ini.
- APK terbaru terpasang dan aplikasi dibuka tanpa Metro. Ekspor produk `.xlsx` dan `.csv` tersimpan melalui Android document picker; isi, judul kolom, dan angka di Excel diperiksa. File uji dihapus dari perangkat.
