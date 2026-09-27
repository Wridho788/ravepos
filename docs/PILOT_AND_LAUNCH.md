# Panduan pilot dan kesiapan RavaPOS

## Janji produk untuk pilot

RavaPOS adalah aplikasi kasir Android satu perangkat untuk toko kecil. Produk, transaksi, stok, pelanggan, piutang, dan pengeluaran tersimpan di perangkat dan dapat dipakai tanpa internet. Pengguna dapat mengekspor data untuk dibaca di aplikasi spreadsheet; file ekspor belum dapat dipulihkan kembali ke RavaPOS.

## Demo singkat

1. Buat profil toko atau pilih data contoh.
2. Tambahkan satu produk dan stok awal.
3. Cari produk dari Kasir, ubah jumlah, masukkan nominal tunai, lalu selesaikan transaksi.
4. Buat transaksi piutang dengan memilih pelanggan, lalu catat pembayaran sebagian di menu Pelanggan.
5. Catat pengeluaran dan periksa ringkasan di Laporan.
6. Ekspor produk atau transaksi ke Excel/CSV, lalu tunjukkan lokasi file kepada pengguna.

## FAQ untuk pengguna uji

**Apakah perlu internet?** Tidak untuk mencatat transaksi dan data toko. Aplikasi tidak menyinkronkan data ke cloud.

**Di mana data tersimpan?** Di database lokal aplikasi pada satu perangkat Android. Jika aplikasi/data perangkat dihapus atau perangkat rusak, data lokal dapat hilang.

**Bagaimana menyimpan salinan data?** Ekspor data ke Excel/CSV secara berkala dan simpan file di lokasi yang aman. File tersebut dapat dibaca, tetapi belum dapat digunakan untuk memulihkan data ke RavaPOS.

**Apakah pembayaran QRIS terhubung?** Tidak. Metode transfer dan QRIS hanya label pencatatan manual.

**Printer dan barcode apa yang didukung?** Belum dijanjikan dalam versi pilot ini.

## Catatan sesi pilot

Untuk tiap sesi, catat jenis usaha/perangkat Android, waktu menyelesaikan transaksi pertama, bantuan yang diminta, kesalahan stok/pembayaran, keberhasilan ekspor Excel/CSV, pemahaman batasan offline/satu perangkat, dan keberatan harga. Minta izin sebelum mencatat data pribadi; jangan menaruh data toko nyata di laporan contoh.

## Sebelum penjualan

- Validasi dengan 5–10 usaha dan uji minat harga Rp100.000, Rp119.000, dan Rp120.000.
- Putuskan aktivasi/perpindahan perangkat, refund, lama update, dukungan, dan kanal penjualan.
- Ganti debug signing config dengan keystore rilis yang dikelola pemilik aplikasi; jangan simpan keystore atau kata sandinya di repositori.
- Tutup kekurangan rilis yang tersisa: void transaksi, histori/detail struk, filter tanggal laporan, serta verifikasi ekspor Excel/CSV pada beberapa perangkat Android.
