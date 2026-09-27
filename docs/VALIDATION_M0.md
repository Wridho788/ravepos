# M0 — Panduan validasi produk

**Status:** materi siap dipakai; wawancara dan uji harga dengan pemilik usaha belum dilakukan.
**Tujuan:** menguji masalah, kebiasaan kerja, kebutuhan offline/backup, dan kisaran harga sebelum mengunci prioritas MVP.

## Segmen dan konteks yang diuji

Rekrut 5–10 pemilik atau pengelola toko kelontong/sembako, kios, toko aksesoris, atau retail sederhana. Prioritaskan usaha yang beroperasi dengan satu perangkat Android dan pemilik ikut menangani transaksi. Catat variasi usaha dan cara mereka berjualan; jangan menyaring peserta hanya karena mereka menyukai ide aplikasi kasir.

Skenario acuan: pemilik memasukkan produk dan stok awal, mencatat penjualan harian, menerima pembayaran tunai atau pembayaran digital yang dicatat manual, mengecek stok/laporan, lalu membuat salinan data agar dapat dipulihkan saat perangkat diganti.

## Skrip wawancara 25–35 menit

### Pembuka dan izin

> Kami sedang mempelajari cara toko kecil mengelola penjualan dan stok. Ini bukan demo penjualan. Kami ingin memahami pengalaman nyata, termasuk hal yang tidak berjalan baik. Boleh saya mencatat jawaban tanpa mencatat nama atau nomor pribadi?

Jangan merekam tanpa izin. Hindari meminta data pelanggan, omzet rinci, atau informasi sensitif. Minta peserta menjelaskan kejadian terbaru, bukan pendapat umum saja.

### Pertanyaan inti

1. Ceritakan transaksi terakhir yang Anda layani, dari pelanggan memilih barang sampai pembayaran selesai.
2. Bagaimana Anda mencatat penjualan dan stok hari ini? Bisa tunjukkan contoh yang tidak berisi data sensitif?
3. Dalam sebulan terakhir, kapan pencatatan atau hitung stok membuat Anda kerepotan? Apa yang terjadi?
4. Bagaimana Anda mengetahui barang hampir habis dan produk mana yang paling laku?
5. Apa yang Anda lakukan saat internet lambat atau mati? Bagian mana yang tetap bisa dikerjakan?
6. Jika ponsel rusak atau diganti, bagaimana catatan usaha dipindahkan atau dipulihkan?
7. Siapa saja yang memakai perangkat dan aplikasi kasir? Apakah perangkat yang sama dipakai untuk hal lain?
8. Apa yang paling membuat Anda ragu menyimpan data usaha di satu ponsel?
9. Fitur mana yang saat ini sudah dikerjakan dengan buku, kalkulator, atau aplikasi lain? Apa yang masih kurang?
10. Jika hanya boleh memperbaiki satu hal dalam alur kasir, apa yang paling bernilai dan mengapa?

Tindak lanjut netral: “Kapan terakhir terjadi?”, “Berapa sering?”, “Apa yang Anda lakukan setelah itu?”, dan “Apa akibatnya bagi toko?”

## Uji paket dan harga

Bacakan deskripsi paket yang sama untuk semua peserta:

> Aplikasi Android untuk satu perangkat yang membantu mencatat penjualan, produk/stok dasar, pembayaran tunai dan pembayaran digital secara manual, pelanggan/piutang sederhana, pengeluaran, laporan ringkas, ekspor CSV, serta backup/restore manual. Data berada di perangkat dan tidak otomatis tersinkron ke cloud. Tidak termasuk QRIS otomatis, multi-cabang, atau printer khusus yang belum diuji.

Tanyakan dulu nilai dan kekhawatiran paket tanpa menyebut harga. Lalu tunjukkan harga **Rp100.000, Rp119.000, dan Rp120.000**. Acak urutan per peserta dan catat urutannya untuk mengurangi efek harga pertama. Untuk masing-masing harga, minta peserta memilih:

- pasti akan mempertimbangkan membeli;
- mungkin akan mempertimbangkan;
- belum yakin;
- mungkin tidak membeli;
- pasti tidak membeli.

Tanyakan alasan, alternatif yang dipakai, siapa yang menyetujui pembelian, dan apakah mereka bersedia menjadwalkan uji coba lanjutan. Catat terpisah **niat yang dinyatakan** dan **komitmen nyata**; jawaban hipotetis bukan bukti konversi atau pembelian.

## Lisensi, pembaruan, dukungan, dan risiko data

Jangan menjanjikan kebijakan yang belum diputuskan. Tanyakan:

- Apakah lisensi satu perangkat terasa wajar? Seberapa penting pemindahan lisensi ke ponsel baru?
- Dukungan seperti apa dan dalam waktu respons berapa yang mereka harapkan?
- Apakah pembaruan produk berbayar sekali dianggap mencakup pembaruan selamanya? Apa yang mereka anggap adil?
- Bagaimana mereka ingin menghubungi dukungan dan memperoleh panduan pemulihan?
- Apakah backup JSON yang tidak terenkripsi dapat diterima jika isi file dijelaskan dengan jelas? Data apa yang tidak ingin mereka masukkan?

Setelah jawaban terkumpul, tulis opsi kebijakan beserta biaya dukungan yang mungkin timbul. Keputusan lisensi final tetap terbuka sampai model distribusi dan biaya layanan dihitung.

## Lembar catatan per peserta

ID anonim: **P__** · Jenis usaha: **__** · Peran: **__** · Lama usaha: **__** · Cara mencatat saat ini: **__**

| Area | Catatan berbasis kejadian |
|---|---|
| Alur transaksi terakhir | |
| Masalah yang berulang dan frekuensinya | |
| Pengelolaan stok/laporan | |
| Kondisi internet dan dampaknya | |
| Backup/pergantian perangkat | |
| Pengguna perangkat dan kekhawatiran privasi | |
| Fitur paling bernilai | |
| Harga/order yang ditampilkan | |
| Respons Rp100.000 / Rp119.000 / Rp120.000 | |
| Alasan dan keberatan | |
| Komitmen uji coba berikutnya | |

## Ringkasan dan gerbang M0

Setelah 5–10 sesi, kelompokkan masalah menurut frekuensi, dampak, dan solusi saat ini. Tandai sebagai pola hanya jika beberapa peserta menceritakan kejadian serupa tanpa dipancing. Pertahankan atau ubah prioritas P0/P1 berdasarkan masalah yang benar-benar muncul.

Gerbang M0 baru dapat dinilai setelah sesi dilakukan: kebutuhan inti konsisten pada beberapa usaha sasaran, manfaat mode offline/data lokal dipahami, keberatan backup diketahui, dan respons harga dicatat. Harga Rp119.000 tetap hipotesis sampai ada uji pembelian nyata.

| ID peserta | Segmen sesuai? | Sesi dilakukan? | Respons harga dicatat? | Tindak lanjut |
|---|---|---|---|---|
| P01 | | | | |
| P02 | | | | |
| P03 | | | | |
| P04 | | | | |
| P05 | | | | |
| P06 | | | | |
| P07 | | | | |
| P08 | | | | |
| P09 | | | | |
| P10 | | | | |
