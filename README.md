# Stoodify Mobile Application (React Native & Expo)

Aplikasi mobile resmi **Stoodify** — Asisten Belajar Pintar berbasis AI untuk Siswa SMA/SMK sederajat. Dibangun menggunakan framework **React Native** dengan **Expo** untuk performa native, kelancaran animasi, dan dukungan hardware Android (Kamera, Tombol Kembali fisik, Safe Area).

---

## 📱 Fitur Mobile

- **UI 100% Identik:** Tampilan, warna, komponen tombol, tabs navigasi, slider, dan animasi cubic-bezier transisi chat bot persis sama dengan versi web production.
- **Dukungan Kamera & Scanner Soal:** Mengintegrasikan izin kamera perangkat Android (`CAMERA`, `RECORD_AUDIO`) untuk fitur pindai soal dan materi belajar.
- **Hardware Back Button Handling:** Penanganan tombol *Back* fisik Android cerdas — kembali ke riwayat halaman aplikasi sebelumnya dan tidak langsung keluar dari aplikasi secara tidak sengaja.
- **Native Status Bar & Splash Screen:** Status bar rapi dengan background brand Stoodify (`#0066FF`) serta splash icon resmi.
- **Offline & Reconnect State:** Tampilan koneksi terputus yang ramah pengguna dengan tombol *Coba Lagi*.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js (v18+)
- Ponsel Android dengan aplikasi **Expo Go** (tersedia gratis di Google Play Store), atau Android Emulator.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Pengembangan
```bash
npx expo start
```
- Pindai QR code yang muncul di terminal menggunakan aplikasi **Expo Go** pada ponsel Android Anda.

---

## 📦 Panduan Build File APK (Android)

Terdapat 2 metode untuk mem-build APK Stoodify:
1. **Build Lokal via Gradle Wrapper (`gradlew`)** — **Direkomendasikan**: Cepat, offline, dan menghasilkan file APK ramping (~9.7 MB).
2. **Build Cloud via EAS** — Jika tidak memiliki Android SDK lokal.

---

### 🛠️ Metode 1: Build Lokal Ramping via Gradle (Rekomendasi)

Secara default, React Native New Architecture menghasilkan *FAT APK* (>100 MB) karena menggabungkan 4 arsitektur C++ (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`) dan library tanpa kompresi. Proyek ini telah dioptimalkan agar menghasilkan APK target modern (**`arm64-v8a`**) dengan ukuran hanya **~9–10 MB**.

#### 1. Persiapan & Prasyarat
Pastikan sistem Anda sudah terinstal:
- **Node.js**: v18 atau lebih baru.
- **JDK (Java Development Kit)**: JDK 17 (disarankan Azul Zulu JDK 17 atau OpenJDK 17).
- **Android SDK & Build-tools**: Terpasang via Android Studio.
- **Environment Variables**:
  - `ANDROID_HOME` mengarah ke folder SDK Anda (misal `C:\Users\<User>\AppData\Local\Android\Sdk` di Windows, atau `/home/<user>/Android/Sdk` di Linux).
  - `JAVA_HOME` mengarah ke direktori instalasi JDK 17.

Pastikan dependensi JavaScript sudah terpasang:
```bash
npm install
```

> [!NOTE]
> Proyek ini menggunakan arsitektur **Expo CNG (Continuous Native Generation)** di mana folder `android/` di-generate secara otomatis dan di-ignore dari Git.

---

#### 2. Langkah-Langkah Eksekusi Build

##### Langkah A: Generate Folder Native Android (Jika belum ada)
Jika folder `android/` belum ada di repositori Anda, generate terlebih dahulu dengan perintah:
```bash
npx expo prebuild -p android
```

##### Langkah B: Konfigurasi Optimasi Ukuran APK
Buka file `android/gradle.properties` dan sesuaikan baris konfigurasi berikut:
```properties
# Ganti dari 4 arsitektur menjadi arm64-v8a saja
reactNativeArchitectures=arm64-v8a

# Aktifkan kompresi library native agar ukuran file APK menyusut
expo.useLegacyPackaging=true

# Aktifkan pembersihan resource yang tidak terpakai
android.enableShrinkResourcesInReleaseBuilds=true
```

##### Langkah C: Jalankan Build Release APK

* **Untuk Pengguna Linux / macOS:**
  1. Beri izin eksekusi skrip Gradle (wajib dilakukan pertama kali setelah prebuild):
     ```bash
     chmod +x android/gradlew
     ```
  2. Masuk ke direktori `android` dan jalankan build Release:
     ```bash
     cd android && ./gradlew assembleRelease
     ```

* **Untuk Pengguna Windows:**
  1. Masuk ke direktori `android`:
     ```powershell
     cd android
     ```
  2. Jalankan build Release:
     * Di **PowerShell**:
       ```powershell
       .\gradlew.bat assembleRelease
       ```
     * Di **Command Prompt (CMD)**:
       ```cmd
       gradlew.bat assembleRelease
       ```
     * Di **Git Bash**:
       ```bash
       ./gradlew assembleRelease
       ```

---

#### 3. Lokasi File Output
Setelah proses build selesai (`BUILD SUCCESSFUL`), file APK siap pakai berada di:
```
android/app/build/outputs/apk/release/app-release.apk
```
* **Ukuran APK:** Turun drastis ke **~20–30 MB** (bahkan **~9.7 MB** dengan optimasi aktif).
* **Install via ADB ke perangkat (opsional):**
  ```bash
  adb install android/app/build/outputs/apk/release/app-release.apk
  ```

---

#### 4. Troubleshooting & Problem Solving

| Kendala / Error | Penyebab | Solusi |
| :--- | :--- | :--- |
| **`zsh: permission denied: ./gradlew`** | Skrip `gradlew` di Linux/macOS belum memiliki izin eksekusi (`+x`). | Jalankan `chmod +x android/gradlew` lalu ulangi build. |
| **`SDK location not found`** | Gradle tidak menemukan lokasi Android SDK. | Buat file `android/local.properties` dan isi lokasinya:<br>• **Linux**: `sdk.dir=/home/<username>/Android/Sdk`<br>• **Windows**: `sdk.dir=C\:\\Users\\<username>\\AppData\\Local\\Android\\Sdk` |
| **`JAVA_HOME is not set` / Java version error** | Versi JDK tidak kompatibel atau environment variable belum disetel. | Pastikan menggunakan **JDK 17**. Cek dengan `java -version`. Di Windows/Linux set `JAVA_HOME` ke folder JDK 17 Anda. |
| **Ukuran APK melonjak > 100 MB** | Build menyertakan semua arsitektur atau kompresi belum aktif. | Cek file `android/gradle.properties`, pastikan `reactNativeArchitectures=arm64-v8a` dan `expo.useLegacyPackaging=true`. |
| **Build macet / Out of Memory / Daemon error** | Cache Gradle korup atau memori daemon kurang. | Jalankan pembersihan cache:<br>Linux: `cd android && ./gradlew clean`<br>Windows: `cd android && .\gradlew.bat clean` |

---

### ☁️ Metode 2: Build APK via EAS (Cloud / Alternatif)

Gunakan metode ini jika komputer developer tidak memiliki Android Studio atau spesifikasi terbatas:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Login ke akun Expo:
   ```bash
   eas login
   ```
3. Jalankan build cloud:
   ```bash
   npx eas build -p android --profile preview
   ```
4. Unduh file APK dari dashboard Expo setelah selesai.

---

## 📂 Struktur Proyek

```
stoodify-apk/
├── assets/
│   ├── icon.png                 # Icon aplikasi Stoodify
│   ├── splash.png               # Splash screen
│   ├── adaptive-icon.png        # Adaptive icon Android
│   └── web/                     # Bundle aset web offline
├── App.js                       # Entry point aplikasi React Native
├── app.json                     # Konfigurasi package id.stoodify.app & permissions
├── eas.json                     # Konfigurasi build APK EAS
├── package.json
└── README.md
```
