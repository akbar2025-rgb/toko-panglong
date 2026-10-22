# Panglong

Sistem informasi toko kayu untuk mencatat stok, penjualan, pembelian, kontak, dan laporan. Antarmuka berbahasa Indonesia dan dirancang untuk dipakai di desktop maupun ponsel.

## Fitur

- Ringkasan penjualan hari ini, piutang, stok menipis, grafik tujuh hari, dan nota terbaru.
- Inventaris barang dengan kode, ukuran, satuan, harga beli, harga jual, serta batas minimum stok.
- Penjualan dengan nomor nota otomatis, pengurangan stok, diskon, dan status lunas.
- Pembelian dengan penambahan stok otomatis dan pembaruan harga beli barang.
- Kontak pelanggan dan pemasok beserta riwayat nilai transaksi.
- Laporan omzet, laba kotor, pembelian, produk terlaris, dan unduhan CSV.
- Pengaturan profil usaha, catatan nota, dan reset data contoh.
- Tampilan responsif dari lebar 320 px, navigasi keyboard, dialog native, dan pengurangan gerak sesuai preferensi sistem.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Untuk menjalankan hasil produksi:

```bash
npm run build
npm run start
```

## Data

Semua data disimpan di `localStorage` browser dengan key `panglong.data.v1`. Tidak ada server, akun, atau sinkronisasi antarperangkat.

Data awal adalah data contoh dan ditandai di antarmuka. Gunakan tombol **Reset ke data contoh** di halaman Pengaturan untuk memuat ulang data contoh. Tindakan ini mengganti seluruh data yang tersimpan di browser.

## Pemeriksaan

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Struktur

- `src/app`: halaman dashboard, inventaris, penjualan, pembelian, kontak, laporan, dan pengaturan.
- `src/components`: app shell, dialog, toast, form barang, editor baris transaksi, grafik, dan komponen antarmuka lain.
- `src/lib`: tipe data, data contoh, format angka dan tanggal, konstanta, serta store localStorage.
- `DESIGN.md`: arah visual, palet, tipografi, dan batasan desain.

## Teknologi

Next.js 16, React 19, TypeScript, Tailwind CSS v4, dan font Bricolage Grotesque, Manrope, serta IBM Plex Mono.
