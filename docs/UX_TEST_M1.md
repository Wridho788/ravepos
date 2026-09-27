# M1 — Prototipe dan uji alur UX

**Status:** prototipe interaktif lokal tersedia di aplikasi; uji dengan calon pengguna belum dilakukan.
**Target:** layar ponsel Android kecil dan standar; navigasi serta data produk saat ini hanya contoh in-memory.

## Alur yang dirancang

1. **Setup toko:** isi nama toko, lihat mata uang IDR/zona waktu, pahami penjelasan penyimpanan lokal, masuk mode demo.
2. **Kasir:** cari atau pilih produk, saring kategori, tambah barang dan lihat kuantitas/total keranjang.
3. **Pembayaran:** periksa item dan total, pilih tunai atau QRIS manual, masukkan uang diterima, pahami kembalian atau batas bahwa pembayaran digital tidak diverifikasi aplikasi.
4. **Struk:** periksa total dan metode, mulai transaksi baru atau buka ringkasan usaha.
5. **Katalog:** lihat stok produk serta contoh penanda stok rendah.
6. **Laporan:** baca penjualan, jumlah/rata-rata transaksi, produk terlaris, metode pembayaran, dan pengeluaran.
7. **Backup:** pahami data berada pada satu perangkat dan backup/restore manual diperlukan.

Prototipe dapat diklik untuk berpindah layar dan menyelesaikan contoh transaksi. Prototipe tidak menyimpan transaksi/stok, tidak membuat file backup sungguhan, tidak mencetak struk, dan tidak memverifikasi pembayaran digital. Pita **“PROTOTIPE · DATA CONTOH, BELUM DISIMPAN”** menjaga batas ini terlihat selama pengujian.

## Skenario uji moderasi

Berikan tugas tanpa menjelaskan tombol:

> Anda sedang melayani pelanggan yang membeli dua mi goreng dan satu air mineral. Masukkan nama toko, tambahkan barang, terima uang tunai Rp20.000, selesaikan penjualan, lalu tunjukkan total dan kembalian. Sesudah itu cari ringkasan penjualan dan jelaskan di mana Anda akan membuat backup.

Jika peserta selesai, tanyakan:

- “Apa yang Anda kira terjadi pada stok setelah transaksi?”
- “Di mana data penjualan ini disimpan? Apakah otomatis muncul di ponsel lain?”
- “Apakah QRIS di layar berarti aplikasi sudah memverifikasi pembayaran?”
- “Apa yang akan Anda lakukan jika ponsel rusak?”
- “Bagian mana yang membingungkan atau terasa lambat?”

Jangan mengoreksi sampai peserta selesai atau meminta bantuan. Catat kata-kata persis untuk momen ragu, kesalahan, dan asumsi yang keliru.

## Ukuran keberhasilan awal

Gunakan 5 peserta yang cocok dengan segmen sasaran bila tersedia. Ambang berikut adalah kriteria operasional untuk uji prototipe, bukan hasil yang sudah tercapai:

- minimal 4 dari 5 peserta menyelesaikan setup → transaksi → struk tanpa bantuan moderator;
- peserta menyelesaikan alur inti dalam dua menit setelah mulai kasir;
- tidak ada salah paham kritis bahwa data prototipe sudah tersimpan atau QRIS telah diverifikasi;
- setidaknya 4 dari 5 peserta dapat menjelaskan bahwa data produk berada pada satu perangkat dan harus di-backup manual;
- tidak ada kontrol utama yang sulit disentuh atau tertutup pada lebar layar 360 dp.

Jika ambang gagal, catat titik kegagalan dan revisi flow sebelum menambah fitur. Jangan mengklaim M1 lolos sebelum sesi dan pengujian ukuran layar dilakukan.

## Form catatan sesi

ID anonim: **P__** · Model/ukuran layar: **__** · Lebar viewport dp: **__** · Moderator: **__**

| Momen | Waktu | Tindakan peserta | Ragu/kesalahan/kutipan | Dampak |
|---|---:|---|---|---|
| Setup toko | | | | |
| Cari/tambah produk | | | | |
| Atur pembayaran | | | | |
| Selesaikan transaksi | | | | |
| Baca struk/kembalian | | | | |
| Buka laporan | | | | |
| Jelaskan data/backup | | | | |

Penyelesaian tanpa bantuan: **Ya/Tidak** · Waktu alur: **__** · Salah paham data lokal: **Ya/Tidak** · Salah paham QRIS: **Ya/Tidak** · Isu layar kecil: **__**

## Keputusan UX yang masih terbuka

- Apakah nama kategori dan ikon cepat dipahami oleh pemilik toko sasaran.
- Apakah keranjang yang selalu terlihat lebih membantu daripada panel khusus.
- Apakah istilah “QRIS manual” cukup jelas bahwa tidak ada konfirmasi pembayaran.
- Seberapa sering pengguna perlu menyentuh laporan dan backup.
- Apakah layar setup harus muncul pada instalasi pertama atau mode demo perlu lebih menonjol.
- Alamat dan detail pada struk harus dapat diatur sesuai praktik toko.
