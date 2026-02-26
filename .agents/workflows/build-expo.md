---
description: Langkah-langkah lengkap untuk build aplikasi menggunakan Expo EAS
---

Langkah-langkah untuk melakukan build aplikasi React Native Anda menggunakan **Expo Application Services (EAS)** agar mendapatkan link download (APK/AAB untuk Android atau IPA untuk iOS).

### 1. Persiapan Akun & CLI
Pastikan Anda sudah memiliki akun Expo dan menginstal EAS CLI di terminal komputer Anda.

Jika belum, jalankan perintah ini di CMD/PowerShell:
```powershell
npm install -g eas-cli
```

### 2. Login ke Expo
Login ke akun Expo Anda melalui terminal:
```powershell
eas login
```

### 3. Inisialisasi Proyek EAS
Jalankan perintah ini di root folder proyek (`C:\.mobile\ManagementIuranApp`) untuk mengonfigurasi build:
```powershell
eas build:configure
```
*Pilih platform: `All` atau `Android` sesuai kebutuhan.*

### 4. Menjalankan Build (Android APK)
Untuk mendapatkan file APK yang bisa langsung diinstal di HP (untuk testing), jalankan:
```powershell
eas build -p android --profile preview
```
*Catatan: Jika Anda ingin build untuk Play Store, gunakan `--profile production` (akan menghasilkan file .aab).*

### 5. Memantau Proses & Mengambil Link
Setelah menjalankan perintah build:
1. Terminal akan memberikan sebuah **Link Dashboard Expo** (misal: `https://expo.dev/accounts/.../builds/...`).
2. Buka link tersebut di browser.
3. Tunggu proses build selesai (biasanya 5-15 menit tergantung antrian server Expo).
4. Setelah selesai, tombol **Download** akan muncul di dashboard tersebut, atau Anda bisa scan **QR Code** yang muncul di terminal untuk install langsung ke HP.

---
> [!IMPORTANT]
> Pastikan koneksi internet Anda stabil saat proses upload file ke server Expo.
> Jika ini build pertama kali, Expo akan menanyakan apakah ingin membuatkan keystore (Credentials), pilih **Yes** agar otomatis ditangani oleh Expo.
