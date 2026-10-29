# Stoodify Mobile Application (Android Shell Container)

Aplikasi mobile resmi **Stoodify** — Asisten Belajar Pintar berbasis AI untuk Siswa SMA/SMK sederajat. Repositori ini berfungsi sebagai **Native Android Container (Shell APK)** yang membungkus antarmuka web dari `stoodify-mobile` menggunakan **React Native** dan **`react-native-webview`**, menyediakan file binary APK Android mandiri yang dapat berjalan **100% offline**, menangani hardware Android (Kamera, Tombol Kembali fisik, Safe Area notch), dan menampilkan icon resmi Stoodify di home screen.

---

## 🏗️ Arsitektur & Aturan Struktur Folder

Agar fitur build otomatis dan sinkronisasi aset web berjalan lancar, folder **`stoodify-mobile`** dan **`stoodify-apk`** **WAJIB diletakkan bersebelahan (sibling directories)** di dalam folder induk yang sama:

```text
my-projects/
├── stoodify-mobile/   <-- [KODING DI SINI] Source Code Frontend (React 19, Tailwind, API Client)
├── stoodify-apk/      <-- [BUILD DI SINI] Native Android Shell & Generator APK
└── stoodify-backend/  <-- Backend REST API (Golang Gin, PostgreSQL)
```

> [!IMPORTANT]
> - **Koding Frontend:** Seluruh perubahan tampilan, warna, teks, animasi, modal, dan pemanggilan API backend dikerjakan di folder **`stoodify-mobile`**.
> - **Build APK:** Folder **`stoodify-apk`** hanya digunakan saat mem-build file APK Android atau mengatur konfigurasi native. Skrip `npm run build:apk` akan otomatis memanggil `cd ../stoodify-mobile && npm run build` untuk mengambil bundel web terbaru.

---

## 📱 Fitur Container Mobile

- **100% Offline-First:** Aset web hasil kompilasi ditanam langsung di dalam aset native APK (`android/app/src/main/assets/web/`), sehingga aplikasi dapat dibuka seketika dalam 0 detik tanpa kuota internet.
- **Launcher Icon Resmi Stoodify:** Icon aplikasi di launcher Android menggunakan logo resmi Stoodify warna biru (`#0062FF`) dengan proporsi safe-zone padding (~47% canvas) dan latar belakang putih bersih (`#FFFFFF`).
- **Hardware Back Button Handling:** Tombol kembali fisik Android bernavigasi mundur pada riwayat web dan tidak langsung menutup aplikasi secara tidak sengaja.
- **Safe Area & Notch Handling:** Status bar dan navigasi bawah otomatis menyesuaikan poni layar perangkat secara presisi melalui `react-native-safe-area-context`.
- **Dukungan Kamera:** Menangani dialog izin sensor perangkat Android (`CAMERA`, `RECORD_AUDIO`) untuk kebutuhan pemindaian soal belajar.
- **Fallback & Reconnect Screen:** Menampilkan layar error yang ramah pengguna jika terjadi gangguan sistem.

---

## 🚀 Panduan Pengembangan & Command

### 1. Prasyarat Sistem
- **Node.js**: v18 atau lebih baru (direkomendasikan v20+).
- **JDK (Java Development Kit)**: JDK 17 (disarankan Azul Zulu JDK 17 atau OpenJDK 17).
- **Android SDK & Build-tools**: Terpasang via Android Studio dengan variable `ANDROID_HOME`.
- Folder `stoodify-mobile` sudah terpasang dependensinya (`npm install` di `stoodify-mobile`).

### 2. Daftar Perintah `stoodify-apk`

| Perintah | Deskripsi |
| :--- | :--- |
| **`npm run build:apk`** | **[UTAMA]** Menjalankan build web di `stoodify-mobile`, menyalin hasilnya ke aset Android, lalu mem-build release APK (`app-release.apk`, ~9.9 MB). |
| **`npm run sync-web`** | Mengompilasi `stoodify-mobile` dan menyalin bundel `dist/` ke aset lokal APK tanpa memicu build Gradle. |
| **`npm run start:go`** | Menjalankan Metro Bundler khusus untuk pengujian via aplikasi **Expo Go** di HP. |
| **`npm run start`** | Menjalankan Metro Bundler default Expo. |
| **`npm run android`** | Menjalankan aplikasi langsung ke emulator atau perangkat yang terhubung via ADB. |

---

## 📦 Panduan Build File APK (Release)

Untuk menghasilkan file APK mandiri yang siap diinstal ke smartphone siswa:

### Langkah 1: Pastikan Dependensi Terpasang
```bash
# Di folder stoodify-apk
npm install
```

### Langkah 2: Jalankan Build APK Otomatis
```bash
npm run build:apk
```

Perintah di atas akan mengeksekusi:
1. `cd ../stoodify-mobile && npm run build` (Menghasilkan aset web terbaru).
2. Menyalin folder `dist/*` ke `android/app/src/main/assets/web/`.
3. Menjalankan `./gradlew assembleRelease` dengan arsitektur target `arm64-v8a` dan optimasi kompresi.

### Langkah 3: Lokasi File APK & Cara Pemasangan
File APK release yang dihasilkan berada di:
```text
android/app/build/outputs/apk/release/app-release.apk
```
*(Ukuran berkas hanya ~9.9 MB)*

Pasang langsung ke smartphone Android via USB Debugging:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔢 Panduan Mengubah Versi Aplikasi (Versioning & versionCode)

Agar nomor versi pada file APK yang dihasilkan tidak tertahan di `1.0.0` dan pengguna dapat memperbarui (*update*) aplikasi di HP Android tanpa error penolakan versi, ubah dua properti di file **`app.json`**:

```json
{
  "expo": {
    "version": "1.1.0",           // <-- [1] Teks versi yang dilihat pengguna (versionName)
    "android": {
      "versionCode": 2,          // <-- [2] Angka integer OS Android (WAJIB NAIK +1 setiap rilis)
      ...
    }
  }
}
```

| Properti di `app.json` | Contoh Nilai | Aturan & Fungsi |
| :--- | :---: | :--- |
| **`expo.version`** | `"1.1.0"`, `"1.2.0"` | String versi yang tampil di menu *Info Aplikasi* di pengaturan HP Android dan di GitHub Releases. |
| **`android.versionCode`** | `1`, `2`, `3`, dst. | Angka bulat positif yang dibaca oleh sistem OS Android. **Wajib selalu ditambah +1 setiap kali rilis baru**, karena Android akan menolak instalasi update jika `versionCode` baru lebih kecil atau sama dengan versi yang sudah terpasang di HP. |

*(Saat skrip `npm run build:apk` atau GitHub Actions berjalan, Expo CNG otomatis membaca kedua nilai ini dan menginjeksinya ke dalam `android/app/build.gradle`).*

---

## 🏷️ Otomatisasi Release APK via GitHub Actions (Git Tag)

Selain mem-build secara lokal, repositori ini telah dikonfigurasi dengan **GitHub Actions** untuk mem-build APK secara otomatis di cloud dan langsung mempublikasikannya ke tab **GitHub Releases** setiap kali Anda membuat Git Tag baru:

### Alur Rilis Versi Baru:
```bash
# 1. Ubah "version" dan naikkan "versionCode" di app.json (misal version: "1.1.0", versionCode: 2)
# 2. Commit dan push ke main
git add app.json
git commit -m "chore(release): bump version to 1.1.0"
git push origin main

# 3. Buat git tag rilis sesuai versi
git tag v1.1.0

# 4. Push tag ke GitHub
git push origin v1.1.0
```

### Apa yang Terjadi di GitHub:
1. GitHub Actions runner akan otomatis mendeteksi tag `v*` dan menjalankan workflow `.github/workflows/build-apk.yml`.
2. Cloud runner mengompilasi APK release Android mandiri (~9.9 MB) lengkap dengan aset web offline.
3. Otomatis membuat entri **GitHub Release** baru dengan nama `Stoodify Mobile v1.1.0 (APK)`.
4. Melampirkan file APK `stoodify-v1.1.0.apk` yang dapat langsung diunduh oleh publik / tim penguji.

---

## 🔧 Konfigurasi Tambahan (`src/constants/config.js`)

Jika Anda ingin menguji perubahan UI secara langsung di HP tanpa build APK ulang (Live HMR):
1. Jalankan `npm run dev -- --host` di folder `stoodify-mobile` (catat IP lokal, misal `http://192.168.1.4:5173`).
2. Set variabel `EXPO_PUBLIC_APP_URL=http://192.168.1.4:5173` atau ubah `DEFAULT_APP_URL` di `src/constants/config.js`.
3. Jalankan `npm run start:go` di `stoodify-apk`, lalu scan QR code menggunakan Expo Go di HP Anda.
