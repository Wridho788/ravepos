# PRD — RavaPOS

**Versi:** 0.2 | **Status:** Draft untuk validasi | **Platform:** Android native (React Native) | **Harga target:** Rp100.000–Rp120.000 sekali bayar (hipotesis; titik uji Rp119.000)

## 1. Ringkasan
RavaPOS membantu pemilik toko kecil mencatat penjualan, mengelola produk dan stok dasar, serta melihat ringkasan usaha melalui aplikasi Android yang tetap berfungsi tanpa internet. Data disimpan lokal pada perangkat. MVP tidak menyediakan cloud sync atau multi-device.

**Arah template:** fondasi retail ini direncanakan dapat dipakai untuk membangun varian F&B, laundry, barbershop, dan bengkel melalui profil konfigurasi serta modul workflow terpisah. Perluasan vertikal berada setelah MVP retail; aplikasi belum mengklaim workflow khusus tersebut telah tersedia. Lihat [rancangan template usaha](BUSINESS_TEMPLATES.md).

## 2. Masalah pengguna
- Transaksi manual memakan waktu dan rawan salah hitung.
- Pemilik sulit memantau penjualan dan stok.
- Sebagian usaha menginginkan biaya awal jelas tanpa langganan.
- Koneksi internet di lokasi usaha bisa tidak stabil.
- Aplikasi kasir kompleks menyulitkan usaha mikro.

## 3. Target pengguna
**Persona utama MVP:** pemilik toko kelontong/sembako, kios, toko aksesoris, atau retail sederhana; menggunakan satu perangkat Android; butuh transaksi, stok, dan laporan dasar; bersedia mengelola ekspor data secara mandiri.

**Bukan target MVP:** multi-cabang, banyak kasir sinkron real-time, apotek dengan kontrol khusus, restoran dengan meja/dapur, atau perusahaan yang memerlukan akuntansi/ERP.

## 4. Nilai produk
1. Offline-first: alur inti tidak mensyaratkan koneksi internet.
2. Sekali bayar: tidak ada langganan pada paket MVP.
3. Sederhana: fokus pada kebutuhan toko harian.
4. Portabilitas data melalui ekspor Excel dan CSV.
5. Transparan: data tersimpan pada satu perangkat dan tidak otomatis tersinkron.

## 5. Ruang lingkup MVP

### P0 — wajib
**Setup**
- Profil toko, mata uang IDR, zona waktu Asia/Jakarta, format struk.
- Mode demo dengan data contoh yang bisa di-reset.

**Produk**
- CRUD produk: nama, SKU/barcode opsional, kategori, harga jual, harga modal opsional, stok, batas stok minimum, satuan tunggal, status aktif.
- Cari produk berdasarkan nama/SKU/barcode yang dimasukkan atau dipindai jika dukungan pemindai perangkat tersedia.
- Validasi harga dan stok.

**Kasir/POS**
- Cari/pilih produk, keranjang, ubah kuantitas, hapus item.
- Diskon transaksi sederhana (nominal/persentase) dengan validasi.
- Pembayaran tunai dengan hitung total, uang diterima, dan kembalian.
- Metode pembayaran manual lain (transfer/QRIS sebagai label, bukan integrasi).
- Checkout atomik: transaksi, snapshot item, pembayaran, dan mutasi stok tersimpan bersama.
- Struk digital; opsi cetak/share bergantung pada kemampuan Android dan integrasi yang dipilih.
- Riwayat dan detail transaksi.
- Void dengan alasan dan pemulihan stok; transaksi asal tetap tersimpan.

**Inventaris**
- Stok masuk/penyesuaian manual dengan alasan, riwayat mutasi, peringatan stok minimum.
- Tanpa batch, serial, kedaluwarsa, atau multi-satuan.

**Pelanggan dan piutang**
- Data pelanggan sederhana; nama dan kontak opsional.
- Tandai transaksi belum lunas, catat pembayaran dan saldo.
- Tanpa reminder otomatis atau analisis RFM.

**Pengeluaran dan laporan**
- Catat pengeluaran (tanggal, kategori, nominal, catatan).
- Laporan penjualan bruto/neto, jumlah dan rata-rata transaksi, produk terlaris, metode pembayaran, pengeluaran.
- Estimasi laba kotor hanya bila harga modal tersedia, diberi label estimasi.
- Ekspor laporan CSV.

**Data dan pengaturan**
- Ekspor produk, transaksi, pelanggan, dan pengeluaran ke Excel atau CSV.
- Profil toko, format struk, PIN lokal opsional.
- Reset data dengan konfirmasi berlapis.

### P1 — setelah validasi
- Impor produk CSV dengan preview dan validasi.
- Diskon per item.
- Multi-satuan sederhana bila kebutuhan terkonfirmasi.
- Hutang supplier/pembelian sederhana.
- Dukungan printer thermal Bluetooth/USB setelah uji perangkat nyata.
- Laporan margin lebih rinci.

### Di luar MVP
- Akun/cloud sync, multi-device, multi-kasir real-time, multi-cabang.
- QRIS/payment gateway sungguhan.
- Promo kompleks, konsinyasi, batch/kedaluwarsa, serial number.
- Akuntansi penuh, pajak kompleks, integrasi marketplace.
- iOS, web app, dan PWA.

## 6. Paket dan lisensi
**RavaPOS Personal — Rp119.000 sekali bayar (hipotesis).** Satu perangkat Android dengan penggunaan dan penyimpanan lokal. Ekspor Excel/CSV membantu pengguna menyimpan salinan data; pemulihan otomatis atau restore belum termasuk. Kebijakan aktivasi, perpindahan perangkat, refund, dukungan, dan masa update harus diputuskan sebelum penjualan. Hindari janji update seumur hidup sebelum biaya dihitung.

## 7. Alur utama
1. Pengguna membuka aplikasi dan membuat profil toko atau masuk demo.
2. Memasukkan produk dan stok awal.
3. Kasir memilih produk dan menyusun keranjang.
4. Memilih metode pembayaran dan menyelesaikan transaksi.
5. Sistem menyimpan transaksi dan mengurangi stok dalam satu transaksi database lokal.
6. Struk ditampilkan; pengguna dapat membagikan atau mencetak jika didukung.
7. Pemilik membuka laporan dan mengekspor data berkala.

## 8. Kebutuhan non-fungsional
- Checkout tidak boleh meninggalkan data parsial jika gagal.
- Operasi inti tidak membutuhkan jaringan.
- File ekspor dapat dibuka sebagai lembar kerja Excel atau CSV dan mencakup kolom yang jelas.
- Target awal: pencarian hingga 1.000 produk responsif pada perangkat Android kelas menengah; wajib diuji.
- UI dirancang untuk layar ponsel Android, termasuk ukuran kecil.
- Format IDR dan waktu lokal konsisten.
- Aksesibilitas dasar, target sentuh memadai, dan kontras terbaca.
- Minimalkan data pribadi pelanggan.

## 9. Metrik validasi
- Pengguna uji menyelesaikan transaksi pertama tanpa bantuan.
- Tidak ada transaksi hilang/duplikat pada skenario uji.
- Pengguna dapat menemukan dan menyimpan file ekspor tanpa bantuan.
- Pengguna memahami penyimpanan lokal dan ketiadaan sync otomatis.
- Wawancarai/uji 5–10 pemilik usaha sebelum prioritas P1.
- Uji minat harga Rp100.000, Rp119.000, Rp120.000; harga belum tervalidasi sebelum ada pembelian nyata.

## 10. Risiko dan mitigasi
| Risiko | Mitigasi |
|---|---|
| Perangkat hilang/rusak atau data dihapus | Jelaskan bahwa data utama tersimpan lokal; ekspor berkala memberi salinan untuk dibaca, tetapi belum dapat dipulihkan ke aplikasi |
| Perbedaan versi Android/perangkat | Tetapkan minimum Android dan matriks perangkat uji |
| Printer tidak kompatibel | Spike hardware dan daftar perangkat teruji; jangan janjikan dukungan universal |
| Kesalahan checkout/stok | Transaksi SQLite atomik dan pengujian integrasi |
| Scope membesar | Pertahankan P0; fitur P1 hanya berdasarkan bukti pengguna |

## 11. Keputusan terbuka
- Expo vs React Native CLI dan versi minimum Android.
- Library SQLite dan strategi migrasi.
- Printer thermal: dukungan, protokol, dan model perangkat yang diuji.
- Barcode: kamera, scanner eksternal, atau input manual pada MVP.
- Lisensi/aktivasi dan batas perangkat.
- Kebijakan backup terenkripsi atau tidak.
