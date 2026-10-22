# Panglong

Sistem informasi operasional untuk toko kayu. Dibuat untuk pemilik toko dan kasir yang bekerja di meja depan, sering berpindah antara stok, nota, dan pelanggan.

Reading this as: aplikasi operasional toko kayu untuk pemilik dan kasir, dengan bahasa visual industrial-organik, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

## Prinsip

- Angka dan status harus terbaca cepat. Aksen dipakai untuk tindakan utama dan kondisi yang perlu perhatian, bukan untuk seluruh layar.
- Data contoh ditandai jelas. Tidak ada klaim penjualan, pelanggan, atau statistik nyata di dalam prototipe ini.
- Tampilan bekerja di meja dan di ponsel. Navigasi tetap satu kali tekan, tanpa menu yang disembunyikan tanpa label.

## Warna

- Kertas hangat `#f3eee3` dan permukaan `#fbf8f1` mengikuti warna catatan dan kayu gergajian, serta mengurangi silau di ruang kerja terang.
- Tinta `#22231d` dipakai untuk teks utama dan panel ringkasan utama agar kontras tetap tinggi.
- Terracotta `#a34a27` menjadi satu aksen untuk tombol utama, tautan, dan penanda aktif. Warna ini mengingatkan pada tanah liat dan kayu olahan.
- Hijau lumut, amber, dan merah hanya dipakai sebagai warna status yang selalu disertai teks.

## Tipografi

- Bricolage Grotesque untuk judul. Bentuknya kokoh dan sedikit tidak simetris, cocok untuk identitas usaha material.
- Manrope untuk isi. Lebar hurufnya nyaman untuk tabel, formulir, dan catatan.
- IBM Plex Mono untuk kode barang, nomor nota, tanggal, dan angka tabel. Monospace dipakai karena fungsinya, bukan sebagai hiasan.

## Bentuk dan gerak

- Radius panel 16px, kontrol 8px. Tidak semua elemen dibuat pil.
- Garis tipis dan bidang datar menjadi struktur utama. Bayangan hanya untuk dialog dan notifikasi yang memang mengambang.
- Gerak terbatas pada transisi hover dan masuknya dialog selama 160ms. Tidak ada animasi berulang di halaman.
- Tidak ada logo atau foto stok. Nama usaha ditulis sebagai wordmark. Data pelanggan dan pemasok adalah placeholder yang ditandai.

## Susunan

- Sidebar gelap di desktop menjadi indeks operasional bernomor. Di ponsel, navigasi dibuka lewat tombol "Menu" yang berlabel.
- Ringkasan menempatkan penjualan hari ini dan stok menipis sebagai fokus, bukan deretan kartu statistik generik.
- Tabel di desktop berubah menjadi kartu data di ponsel. Tidak ada tabel yang dipaksa menyamping.
- Halaman transaksi baru memakai formulir satu kolom dengan ringkasan yang menempel di desktop dan mengalir di ponsel.

## Batasan

- Sumber data: localStorage browser. Tidak ada sinkronisasi antar perangkat.
- Semua isi awal adalah data contoh. Ganti lewat halaman Pengaturan saat aplikasi dipakai untuk data nyata.
- Tema terang dipilih karena toko kayu banyak melayani transaksi pada siang hari dan nota dicetak di atas kertas terang.
