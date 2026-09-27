# RavaPOS sebagai template lintas usaha

**Status:** rancangan pengembangan; template vertikal belum menjadi fitur aplikasi.

## Arah produk

RavaPOS dapat menjadi proyek dasar untuk beberapa aplikasi usaha. Pertahankan satu inti transaksi offline yang dipakai bersama, lalu tambahkan konfigurasi dan modul alur kerja sesuai usaha. Profil usaha tidak cukup hanya mengganti nama kategori atau label jika aturan transaksinya berbeda.

Pilihan produk yang masih perlu dikunci:

1. **Aplikasi multi-usaha:** pemilik memilih jenis usaha saat setup; aplikasi memuat profil dan modul yang sesuai.
2. **Template untuk diclone:** basis kode yang sama menghasilkan aplikasi terpisah per vertikal, dengan nama paket, ikon, profil, dan modul masing-masing.

Rekomendasi awal adalah memisahkan konfigurasi vertikal dari inti bersama dan menyiapkan keduanya dapat dirilis sebagai aplikasi berbeda. Jangan mengaktifkan semua alur usaha dalam satu layar kasir. Keputusan akhir bergantung pada apakah RavaPOS akan dijual sebagai satu produk atau sebagai beberapa produk khusus.

## Inti bersama

Fitur berikut sudah menjadi dasar yang dapat digunakan lintas vertikal:

- database lokal SQLite dan transaksi tanpa internet;
- katalog dasar, keranjang, pembayaran, dan struk transaksi;
- pelanggan, piutang, pengeluaran, laporan ringkas;
- ekspor Excel/CSV dan identitas toko.

Modul bersama ini harus tetap bebas dari istilah khusus seperti kendaraan, meja restoran, kiloan, atau barber.

## Cakupan vertikal

| Template | Dapat memakai fondasi sekarang | Modul khusus yang masih diperlukan |
|---|---|---|
| **Toko / retail** | Produk, stok, checkout, pelanggan/piutang, pengeluaran, laporan | Riwayat/detail transaksi, void, dan penyelesaian rilis yang sudah tercatat di roadmap |
| **F&B** | Katalog menu sederhana dan checkout | Modifier/varian menu, dine-in atau takeaway, meja dan tagihan berjalan, tiket dapur, status pesanan |
| **Laundry** | Pelanggan, pembayaran, laporan | Tiket cucian, berat atau jumlah satuan, tahap proses, tanggal/janji selesai, pelacakan barang dan pengambilan |
| **Barbershop** | Katalog layanan dan checkout dasar | Layanan tanpa stok, barber/staf, antrean atau janji, durasi layanan, histori pelanggan, komisi bila dibutuhkan |
| **Bengkel** | Produk suku cadang, stok, pelanggan, checkout | Data kendaraan, penerimaan servis, estimasi, order kerja, tenaga kerja dan suku cadang, mekanik, status servis, histori kendaraan |

Kondisi saat ini belum mendukung pencatatan jasa dengan benar: checkout mengurangi stok untuk setiap item dan jumlah item berupa bilangan bulat. Karena itu, jasa potong rambut, cuci kiloan, dan biaya jasa bengkel belum boleh diperlakukan sebagai produk biasa seolah-olah sudah didukung.

## Arsitektur template yang disarankan

### 1. Profil usaha sebagai konfigurasi

Profil menyimpan ID stabil, nama tampilan, istilah, kategori awal, satuan yang disarankan, halaman awal, dan modul yang aktif. Contoh ID: `retail`, `food_beverage`, `laundry`, `barbershop`, dan `workshop`. UI membaca konfigurasi ini; aturan transaksi tetap berada di modul domain, bukan di kumpulan kondisi tersebar pada komponen.

### 2. Katalog mendukung barang dan jasa

Migrasi database berikutnya perlu memisahkan jenis item dan kebijakan stok, setidaknya `itemType` serta `trackStock`. Checkout hanya mengubah stok untuk item yang memang melacak stok. Harga dan kuantitas harus tetap aman untuk rupiah; laundry berbasis berat memerlukan presisi kuantitas yang eksplisit (misalnya gram sebagai integer), bukan floating-point yang tidak terdefinisi.

### 3. Modul vertikal memiliki domain dan layar sendiri

- `food-beverage`: modifier, jenis layanan, meja/tagihan berjalan, dan alur tiket dapur.
- `laundry`: order/tiket, berat atau jumlah, SLA/tanggal selesai, dan status proses.
- `barbershop`: layanan, staf, antrean/jadwal, dan histori layanan.
- `workshop`: kendaraan, service order, estimasi, pekerjaan dan suku cadang.

Tiap modul harus memiliki tabel, validasi, status, dan pengujian alurnya. Checkout umum tetap dapat dipakai untuk pembayaran final, tetapi order khusus harus memiliki identitas serta lifecycle sendiri.

### 4. Data lama dan migrasi

Database aktif saat ini memakai `user_version = 1`. Perubahan katalog harus menjadi migrasi berurutan dan mempertahankan produk retail lama sebagai item barang yang melacak stok. Data pelanggan, penjualan, item penjualan, dan pergerakan stok lama tidak boleh dihapus atau ditulis ulang ketika profil vertikal ditambahkan.

## Tahap implementasi yang diusulkan

1. **Template foundation:** tetapkan pilihan satu aplikasi atau clone; buat registry profil dan konfigurasi kategori/satuan/fitur.
2. **Catalog v2:** migrasi item barang/jasa, aturan stok, unit, dan presisi kuantitas dengan kompatibilitas data retail.
3. **Vertical pilot:** pilih satu vertikal pertama; lengkapi alur utamanya sampai laporan dan ekspor, lalu uji pada usaha nyata.
4. **Template berikutnya:** gunakan hasil pilot untuk menyusun modul vertikal berikut, bukan menyalin layar dan logika bisnis secara ad hoc.

Kandidat pilot awal adalah barbershop untuk membuktikan item jasa tanpa stok, atau laundry untuk menguji presisi kuantitas serta tiket/status proses. Jangan mengerjakan empat workflow penuh sekaligus sebelum satu pilot selesai.

## Batas klaim produk saat ini

- RavaPOS saat ini adalah aplikasi kasir umum dengan kekuatan utama pada retail.
- Template F&B/laundry/barbershop/bengkel masih berupa arah arsitektur; workflow khususnya belum diimplementasikan.
- Profil usaha dan daftar kategori awal saja belum membuat suatu vertikal layak dipakai secara operasional.
