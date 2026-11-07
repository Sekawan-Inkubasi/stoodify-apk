# Stoodify Android — React Native

Repositori ini berisi aplikasi Android Stoodify dengan antarmuka React Native/Expo. UI, navigasi, state aplikasi, kamera, dan pemilih file berjalan secara native. `stoodify-mobile` menjadi referensi desain dan perilaku; build APK tidak membangun atau menyalin kode dari workspace tersebut.

## Arsitektur

```text
stoodify-apk (React Native / Expo)
       ├── REST API ──> stoodify-backend ──> database
       │                         └────────> stoodify-ai-1
       └── WebView darurat (dibuka manual) ──> stoodify-mobile hosted
```

Token akses dan refresh disimpan menggunakan Expo SecureStore. API client native mengirim token Bearer, menangani refresh token, timeout, dan multipart upload avatar. Prediksi serta rekomendasi AI tetap melewati backend.

WebView dipertahankan hanya sebagai fallback yang dibuka dari **Profil → Buka Versi Web Darurat** atau layar pemulihan saat UI native gagal. Fallback membutuhkan koneksi internet.

## Menjalankan aplikasi

Persyaratan: Node.js, JDK 17, Android SDK, dan perangkat/emulator Android.

```bash
npm install
npm start
```

Konfigurasi base URL backend melalui `EXPO_PUBLIC_API_URL`. Contoh:

- Perangkat Android fisik: alamat IP LAN komputer host, misalnya `http://192.168.1.10:8080/api`.
- Perangkat fisik dengan ADB reverse: jalankan `adb reverse tcp:8080 tcp:8080`, lalu gunakan `http://localhost:8080/api`.
- Emulator Android: gunakan `http://10.0.2.2:8080/api`.
- Produksi: gunakan URL HTTPS backend.

Alamat HTTP lokal hanya mengaktifkan cleartext traffic pada konfigurasi native ketika `EXPO_PUBLIC_API_URL` memakai `http://`. Jangan memasukkan API key atau secret ke variabel `EXPO_PUBLIC_*`.

## Build APK

```bash
npm run build:apk
```

Perintah ini menjalankan Expo prebuild untuk Android dan Gradle `assembleRelease`. Build tidak memanggil `stoodify-mobile`; aset WebView fallback hosted dimuat saat pengguna memilih fallback.

APK tersedia di `android/app/build/outputs/apk/release/app-release.apk`.

## Fitur native

- Login dan registrasi, sesi tersimpan aman, refresh token, dan logout.
- Beranda, daftar tugas, kalender, Rencana AI, profil, notifikasi, serta manajemen mata pelajaran.
- Tambah tugas dan jadwal, progres tugas, rekomendasi/reschedule, prediksi materi, umpan balik AI, dan preferensi belajar melalui endpoint backend yang tersedia.
- Timer fokus, pemotretan tugas, pemilihan gambar/dokumen, dan unggah foto profil.
- Navigasi tab, safe area, keyboard, tombol Back Android, loading, state kosong, dan state error.

Lampiran tugas saat ini hanya menjadi pratinjau lokal, sesuai kontrak frontend yang tersedia; belum ditemukan endpoint backend untuk menyimpan lampiran tugas. Asisten percakapan masih memakai respons lokal yang disediakan frontend karena endpoint chat belum tersedia. Pembayaran Pro juga belum terhubung dan tidak mengubah status akun.

## Struktur source

- `App.js`: entry UI, tab, modal global, dan tombol Back Android.
- `src/screens/`: layar utama per tab dan autentikasi.
- `src/components/`: navigasi, modal, fallback WebView, dan komponen native bersama.
- `src/services/`: HTTP client, SecureStore, adapter model, dan layanan domain.
- `src/constants/`: endpoint, konfigurasi API, dan token desain.

Ikuti `AGENTS.md` untuk standar file (maksimal 300 baris), izin Android, dan alur verifikasi.

```
Penyebabnya, build development di HP belum tersambung ke Metro. Di layar Development Build, isi kolom URL dengan:

http://localhost:8081

lalu tekan Connect. Saya melakukan koneksi itu pada perangkat Anda. Setelah indikator bundling selesai, tutup panel developer dengan tombol ×. Layar pembuka yang muncul adalah halaman awal aplikasi.

Saat memakai USB, Metro perlu tetap berjalan di komputer dan port-nya diteruskan ke HP. Di perangkat Anda, adb reverse untuk port 8081 dan 8080 sudah aktif. Jika Metro berhenti, jalankan kembali dari folder stoodify-apk:

EXPO_PUBLIC_API_URL=http://localhost:8080/api npx expo start --dev-client --localhost --port 8081
```