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

## 📦 Cara Build File APK (Android)

Tersedia konfigurasi `eas.json` untuk membuat file APK siap instal (*standalone APK*):

### Opsi A: Build APK via EAS (Cloud / Direkomendasikan)
1. Install EAS CLI jika belum ada:
   ```bash
   npm install -g eas-cli
   ```
2. Login ke akun Expo:
   ```bash
   eas login
   ```
3. Jalankan build APK:
   ```bash
   npx eas build -p android --profile preview
   ```
4. Setelah proses build selesai di cloud Expo, Anda akan mendapatkan tautan unduhan langsung untuk file `.apk`.

### Opsi B: Build Lokal (Menggunakan Android Studio / SDK)
```bash
npx expo run:android --variant release
```

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
