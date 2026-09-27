# TRD — RavaPOS

**Versi:** 0.2 | **Status:** Draft | **Platform:** Android native dengan React Native + TypeScript

## 1. Tujuan teknis
Membangun aplikasi kasir Android local-first. Seluruh alur inti bekerja tanpa jaringan dan menyimpan data operasional di SQLite lokal. Backend tidak wajib pada MVP. Ini bukan PWA/web app.

## 2. Stack yang diusulkan
| Area | Pilihan awal | Catatan |
|---|---|---|
| Mobile UI | React Native + TypeScript | Android-first |
| Icons | `@react-native-vector-icons/material-design-icons` | Native Material Design icon font; packaged in Android release build |
| Workflow | Expo atau React Native CLI | Putuskan setelah uji native modules, printer, dan build |
| Database | SQLite melalui library RN yang terpelihara | Verifikasi transaksi, migrasi, dan kompatibilitas |
| UI state | Zustand | Cart dan state sementara, bukan sumber data permanen |
| Forms | React Hook Form + Zod | Validasi input |
| Navigation | React Navigation atau solusi kompatibel workflow | Putuskan saat bootstrap |
| File ekspor | Android Storage Access Framework/document picker | Uji simpan Excel/CSV pada Android target |
| Printer | Integrasi Bluetooth/USB khusus bila diperlukan | Spike terpisah; tidak dijanjikan di MVP sebelum validasi |
| Testing | Jest, React Native Testing Library; E2E dipilih sesuai workflow | Unit, integration, device E2E |
| Quality | ESLint, Prettier, TypeScript strict | CI |

Versi dependency dan pilihan library harus dikunci setelah memeriksa status pemeliharaan, kompatibilitas RN/Android, dan uji perangkat nyata.

## 3. Prinsip implementasi
1. Repository pattern: UI tidak mengakses database langsung.
2. Atomic checkout: sale, item snapshot, pembayaran, stock movement, dan update stok berada dalam satu transaksi SQLite.
3. Immutable sale history: koreksi melalui void/refund record dengan alasan.
4. Money as integer: simpan nominal rupiah sebagai integer.
5. Stable IDs: UUID atau ID lokal yang collision-safe.
6. Schema migrations: migrasi database berurutan dan teruji.
7. Ekspor data yang konsisten sebagai Excel (`.xlsx`) dan CSV (`.csv`).
8. No fake cloud sync: status koneksi tidak disamakan dengan status sinkronisasi.

## 4. Modul aplikasi
- `setup`, `catalog`, `pos`, `inventory`, `customers`, `receivables`, `expenses`, `reports`, `data-management`, `settings`, `shared`.

## 5. Skema data awal
Semua entitas memiliki ID stabil dan timestamp yang relevan.
- `settings`: `key`, `value`, `updatedAt`
- `products`: `id`, `name`, `sku?`, `barcode?`, `categoryId?`, `salePrice` integer, `costPrice?` integer, `stockQty`, `lowStockThreshold?`, `unit`, `isActive`, timestamps
- `categories`: `id`, `name`, timestamps
- `sales`: `id`, `receiptNumber`, `soldAt`, `subtotal`, `discountAmount`, `total`, `paymentMethod`, `amountPaid`, `changeAmount`, `status`, `customerId?`, `note?`, `voidReason?`, `createdAt`
- `saleItems`: `id`, `saleId`, `productId?`, product/SKU snapshot, `unitPrice`, `quantity`, `discountAmount`, `lineTotal`, `costPriceSnapshot?`
- `stockMovements`: `id`, `productId`, `type` (`SALE`, `VOID_RETURN`, `ADJUSTMENT`, `OPENING`), `quantityDelta`, reference, reason, timestamp
- `customers`: `id`, `name`, `phone?`, `note?`, timestamps
- `receivables`: `id`, `saleId`, `customerId?`, `originalAmount`, `paidAmount`, `status`, timestamps
- `receivablePayments`: `id`, `receivableId`, `amount`, `paidAt`, `method`, `note?`
- `expenses`: `id`, `category`, `amount`, `spentAt`, `note?`, `createdAt`
- `auditEvents`: `id`, `entityType`, `entityId`, `action`, `reason?`, `createdAt`

Kuantitas harus mengikuti aturan satuan yang eksplisit. Gunakan integer jika desimal tidak diperlukan; jika desimal dipakai, tentukan presisi dan pembulatan secara konsisten.

## 6. Aturan bisnis inti
### Checkout
- `subtotal = sum(unitPrice × quantity - itemDiscounts)`; `total = max(0, subtotal - transactionDiscount)`.
- Tunai: `change = max(0, amountPaid - total)`; tolak jika uang diterima kurang dari total.
- Pembayaran non-tunai dicatat manual dan tidak diverifikasi oleh aplikasi.
- Validasi stok di dalam transaksi database; tolak jika stok tidak cukup kecuali kebijakan stok negatif ditetapkan secara eksplisit.
- Simpan sale, items, movements, dan update stok secara atomik.
- Nomor struk unik di perangkat.

### Void
- Wajib alasan; tandai sale void, buat movement pengembalian, jangan hapus riwayat. Saldo piutang juga harus dikoreksi konsisten.

### Piutang
- Pembayaran tidak boleh melebihi saldo. Saldo = originalAmount − paidAmount. Status `UNPAID`, `PARTIAL`, `PAID`, `CANCELLED`.

### Ekspor data
- Ekspor tersedia untuk produk, transaksi, pelanggan, dan pengeluaran dalam format `.xlsx` dan `.csv`.
- File dibuat lokal dan disimpan melalui Android Storage Access Framework; tidak ada unggah ke server.
- MVP tidak menyediakan backup JSON atau pemulihan data dari file ekspor.
- Uji pembukaan `.xlsx` pada aplikasi spreadsheet dan CSV dengan encoding UTF-8 pada Android target.

## 7. Keamanan dan privasi
- Data bisnis disimpan lokal di perangkat; MVP tidak mengirimkannya ke server.
- PIN lokal hanya penghalang akses kasual, bukan enkripsi database.
- Minimalkan data pelanggan dan jangan menulis data sensitif ke log.
- Ingatkan bahwa ekspor adalah salinan untuk dibaca; data tidak dapat dipulihkan ke aplikasi dari file tersebut.
- Gunakan mekanisme penyimpanan aman OS untuk rahasia aktivasi jika dibutuhkan.

## 8. Penyimpanan lokal dan konektivitas
- SQLite lokal adalah sumber data operasional utama; tidak ada IndexedDB, service worker, atau cache PWA.
- Fitur transaksi, katalog, inventaris, dan laporan tidak boleh membutuhkan jaringan.
- Tampilkan status “Data tersimpan di perangkat ini” dan penjelasan bahwa tidak ada sync otomatis.
- Uji mode pesawat, force-close/relaunch, restart perangkat, serta proses ekspor file.
- Penanganan kegagalan database harus jelas dan tidak mengosongkan cart sebelum commit.

## 9. Error handling
- Validasi di UI dan domain layer.
- Checkout hanya sukses setelah commit database berhasil.
- Kegagalan database ditampilkan dengan bahasa umum dan tindakan coba lagi; detail exception teknis tidak ditampilkan kepada pengguna.
- Error log lokal tidak menyimpan kontak pelanggan atau detail transaksi lengkap.

## 10. Testing
**Unit:** kalkulasi, validasi, piutang, laporan, serialisasi ekspor.

**Integration:** checkout atomik; rollback saat gagal; void dan stok; pembayaran piutang; migrasi; pembuatan berkas Excel/CSV.

**Device/E2E:** setup → produk → checkout → struk → laporan; mode pesawat; force-close/relaunch; ekspor Excel/CSV; kompatibilitas ukuran layar Android; printer/barcode hanya pada perangkat yang masuk daftar dukungan.

## 11. Kriteria rilis teknis
- Android release build berhasil dan ditandatangani sesuai proses distribusi.
- Tidak ada blocker TypeScript/lint.
- Test checkout, void, migrasi, ekspor Excel/CSV lulus.
- Uji offline, relaunch, dan ekspor data lulus pada perangkat target.
- Tidak ada jalur checkout parsial.
- Dokumentasi menjelaskan versi Android minimum, batas penyimpanan lokal, keterbatasan ekspor, lisensi, serta kompatibilitas hardware.
