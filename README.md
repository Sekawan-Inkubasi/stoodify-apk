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

## 🏷️ Panduan Rilis Manual ke GitHub Releases

Untuk menjaga ukuran file APK tetap ramping (~9.9 MB) dan menghindari pemborosan kuota build cloud, publikasi rilis dilakukan secara manual via web GitHub:

### Langkah 1: Build APK Rilis di Laptop
```bash
# 1. Pastikan nomor version dan versionCode di app.json sudah sesuai
# 2. Jalankan build otomatis (sinkronisasi web + kompilasi APK)
npm run build:apk
```
File APK rilis (~9.9 MB) akan selesai dibuat di:
`android/app/build/outputs/apk/release/app-release.apk`

*(Beri nama file yang rapi sebelum diunggah, misalnya `stoodify-v1.1.0.apk`).*

### Langkah 2: Buat Tag & Publikasikan di GitHub
```bash
# Buat git tag versi (opsional via terminal)
git tag v1.1.0
git push origin v1.1.0
```

1. Buka browser ke repositori GitHub: `https://github.com/Sekawan-Inkubasi/stoodify-apk`.
2. Di sebelah kanan, klik **Releases** ➔ klik tombol **Draft a new release**.
3. **Pilih Tag:** Pilih tag yang baru saja di-push (misal `v1.1.0`).
4. **Judul Rilis:** Tulis judul, contoh `Stoodify Mobile v1.1.0`.
5. **Lampirkan File:** *Drag and drop* file `stoodify-v1.1.0.apk` (~9.9 MB) ke kotak attachment.
6. Tulis catatan rilis singkat (fitur baru atau perbaikan), lalu klik **Publish release**!

> [!NOTE]
> File `.github/workflows/build-apk.yml` tetap disediakan sebagai backup tombol manual (*workflow_dispatch*) di tab Actions jika sewaktu-waktu Anda perlu build darurat di cloud.

---

## 🔧 Konfigurasi Tambahan (`src/constants/config.js`)

Jika Anda ingin menguji perubahan UI secara langsung di HP tanpa build APK ulang (Live HMR):
1. Jalankan `npm run dev -- --host` di folder `stoodify-mobile` (catat IP lokal, misal `http://192.168.1.4:5173`).
2. Set variabel `EXPO_PUBLIC_APP_URL=http://192.168.1.4:5173` atau ubah `DEFAULT_APP_URL` di `src/constants/config.js`.
3. Jalankan `npm run start:go` di `stoodify-apk`, lalu scan QR code menggunakan Expo Go di HP Anda.
