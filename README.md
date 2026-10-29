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
- **Launcher Icon Resmi Stoodify:** Icon aplikasi di launcher Android menggunakan logo resmi Stoodify dengan safe-zone padding dan latar belakang `#0066FF`.
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

## 🔧 Konfigurasi Tambahan (`src/constants/config.js`)

Jika Anda ingin menguji perubahan UI secara langsung di HP tanpa build APK ulang (Live HMR):
1. Jalankan `npm run dev -- --host` di folder `stoodify-mobile` (catat IP lokal, misal `http://192.168.1.4:5173`).
2. Set variabel `EXPO_PUBLIC_APP_URL=http://192.168.1.4:5173` atau ubah `DEFAULT_APP_URL` di `src/constants/config.js`.
3. Jalankan `npm run start:go` di `stoodify-apk`, lalu scan QR code menggunakan Expo Go di HP Anda.
