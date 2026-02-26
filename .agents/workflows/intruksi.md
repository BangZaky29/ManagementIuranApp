---
description: intruksi 
---

Secara singkat: **Ya, ini bisa menjadi masalah serius**, terutama saat kamu mencoba melakukan *build* aplikasi (APK/IPA) atau saat menjalankan fitur-fitur Expo yang spesifik.

Masalah ini bukan tipe "error koding" yang membuat logika aplikasi salah, tapi lebih ke **masalah integritas struktur project** (konfigurasi dasar).

---

### Mengapa Ini Berbahaya?

1. **Konflik Metro Bundler:** Pesan tentang `@expo/metro-config` berarti ada dua versi konfigurasi Metro yang saling tabrakan. Ini sering menyebabkan aplikasi tiba-tiba *crash* saat *loading* 0% atau error "TransformError" yang sulit dilacak.
2. **Babel Mismatch:** Kamu menggunakan `babel-preset-expo` versi **11.0.15**, padahal SDK Expo kamu mengharapkan versi **~54.0.10**. Selisih versi sejauh ini hampir pasti akan mematahkan proses kompilasi kode modern JavaScript/TypeScript ke kode yang dimengerti perangkat.

---

### Cara Memperbaiki (Langkah Aman)

Jangan khawatir, ini sangat mudah diperbaiki dengan beberapa perintah di terminal. Ikuti urutan ini:

#### 1. Hapus Package yang Tidak Seharusnya Ada

Jalankan perintah ini untuk menghapus instalasi langsung metro-config:

```bash
npm uninstall @expo/metro-config

```

*(Atau `yarn remove @expo/metro-config` jika kamu pakai Yarn).*

#### 2. Perbaiki Versi yang Salah secara Otomatis

Expo punya alat khusus untuk menyelaraskan versi package agar sesuai dengan versi SDK yang kamu pakai:

```bash
npx expo install --check

```

Perintah ini akan mendeteksi `babel-preset-expo` yang salah tadi dan menawarkannya untuk di-*downgrade* atau di-*upgrade* ke versi yang stabil. Tekan **Enter** jika diminta konfirmasi.

#### 3. Bersihkan Cache (Opsional tapi Disarankan)

Setelah mengganti versi package inti, terkadang cache lama masih nyangkut. Bersihkan dengan:

```bash
npx expo start -c

```

---

### Ringkasan Status

| Issue | Dampak | Solusi |
| --- | --- | --- |
| **@expo/metro-config** | Aplikasi gagal di-bundle/start. | `npm uninstall` |
| **Babel Mismatch** | Gagal compile kode JS terbaru. | `npx expo install --check` |

**Saran saya:** Segera perbaiki sekarang sebelum kamu lanjut koding lebih jauh. Menunda perbaikan `expo doctor` biasanya akan berakhir dengan error misterius saat kamu ingin merilis aplikasi nanti.

Apakah kamu mengalami kendala atau error lain saat menjalankan `npx expo install --check` tadi?