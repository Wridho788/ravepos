# RavaPOS

RavaPOS adalah aplikasi kasir Android native berbasis React Native untuk toko kecil dan UMKM. Aplikasi dirancang offline-first: transaksi dan data operasional disimpan lokal di perangkat, tanpa akun, backend, langganan, atau sinkronisasi cloud pada MVP.

Dokumen produk masih berstatus draft untuk validasi. Harga Rp119.000 adalah hipotesis. Fitur, lisensi, minimum Android, dan dukungan perangkat perlu divalidasi sebelum rilis.

## Implementasi saat ini

- React Native Community CLI, React Native 0.87.1, TypeScript; Android menjadi platform MVP.
- Database SQLite lokal memakai API SQLite Android melalui native module proyek (`RavaSqliteModule`); tidak ada data transaksi yang dikirim ke server.
- Tersedia setup/demo, produk dan stok, POS/checkout atomik, pelanggan/piutang, pengeluaran, ringkasan harian, serta ekspor produk, transaksi, pelanggan, dan pengeluaran ke Excel atau CSV melalui Android document picker.
- Status implementasi dan bagian yang belum siap dijual ada di [Implementation status](docs/IMPLEMENTATION_STATUS.md).

## Jalankan aplikasi

Persyaratan lokal: Node.js 22.11 atau lebih baru, JDK 17, Android Studio, Android SDK, dan emulator atau perangkat Android.

```powershell
npm install
npm start
```

Di terminal lain:

```powershell
npm run android
```

Buka `android/` di Android Studio bila ingin mengelola SDK/emulator. Pastikan `ANDROID_HOME` mengarah ke lokasi Android SDK dan `platform-tools` ada di `PATH`.

Untuk menghasilkan APK release lokal:

```powershell
cd android
./gradlew.bat assembleRelease
```

APK tersalin ke `build/releases/`. Konfigurasi release saat ini memakai debug keystore proyek dan hanya untuk uji/sideload; sebelum distribusi, ganti dengan keystore rilis yang dikelola pemilik aplikasi.

Pada Windows, bila build CMake gagal karena path terlalu panjang, gunakan junction folder pendek supaya Gradle dan Metro tetap melihat satu root:

```powershell
New-Item -ItemType Junction -Path C:\rava -Target (Resolve-Path .).Path
Set-Location C:\rava\android
./gradlew.bat assembleRelease
```

Setelah selesai, lepaskan junction dengan `cmd /c rmdir C:\rava` (perintah ini menghapus junction, bukan folder target).

## Dokumentasi

- [PRD](docs/PRD.md) — pengguna, ruang lingkup MVP, alur dan kriteria penerimaan.
- [TRD](docs/TRD.md) — stack, aturan teknis, model data, serta pengujian.
- [Architecture](docs/ARCHITECTURE.md) — komponen, alur checkout, dan keputusan arsitektur.
- [Milestones](docs/MILESTONES.md) — tahapan dan gerbang validasi.
- [Panduan validasi M0](docs/VALIDATION_M0.md) — wawancara, uji harga, dan catatan peserta.
- [Uji prototipe M1](docs/UX_TEST_M1.md) — skenario usability dan ambang pengujian.
- [Status sprint](docs/IMPLEMENTATION_STATUS.md) — hasil implementasi, QA, dan batasan.
- [Panduan pilot](docs/PILOT_AND_LAUNCH.md) — demo, FAQ, catatan pilot, dan checklist sebelum penjualan.
- [Rancangan template usaha](docs/BUSINESS_TEMPLATES.md) — batas kemampuan saat ini dan arsitektur untuk retail, F&B, laundry, barbershop, dan bengkel.

## Cakupan MVP

P0 mencakup setup toko/demo, katalog produk, POS dan checkout atomik, stok dasar, pelanggan/piutang, pengeluaran, laporan sederhana, serta ekspor produk, transaksi, pelanggan, dan pengeluaran dalam format Excel/CSV. Backup dan pemulihan JSON tidak termasuk. Cloud sync, multi-device, multi-cabang, akuntansi penuh, integrasi QRIS, dan dukungan printer universal berada di luar MVP.

## Prinsip data

SQLite lokal menjadi sumber data operasional. Checkout menyimpan transaksi, snapshot item, dan mutasi stok dalam transaksi atomik. Nominal uang disimpan sebagai integer rupiah. File Excel/CSV hanya salinan untuk dibaca dan tidak dapat dipakai untuk memulihkan data; data tidak otomatis tersinkron ke cloud.
