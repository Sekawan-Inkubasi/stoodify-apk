# Stoodify Android

Aplikasi Android Stoodify menggunakan React Native dan Expo. UI, navigasi, kamera, pemilih berkas, serta sesi pengguna berjalan di native. Aplikasi berkomunikasi dengan `stoodify-backend` melalui REST API. `stoodify-mobile` hanya menjadi referensi; proses build tidak mengambil kode darinya.

## Persyaratan

- Node.js yang didukung Expo SDK 58: `22.13+`, `24.3+`, `26.x`, atau `27+`.
- npm (disertakan bersama Node.js).
- JDK 17.
- Android Studio dengan Android SDK dan Android SDK Platform-Tools (`adb`).
- Perangkat Android dengan USB debugging aktif, atau Android Emulator.

Periksa instalasi:

```bash
node --version
npm --version
java -version
adb version
```

## Instalasi

Jalankan dari direktori `stoodify-apk`:

```bash
npm ci
```

`npm ci` memasang dependency persis sesuai `package-lock.json`.

## Menjalankan aplikasi Android

Pilih salah satu cara: **HP fisik lewat USB** atau **Android Studio Emulator (AVD)**. Development build harus terpasang di perangkat sebelum Metro dapat memuat aplikasi.

### 1. Siapkan backend

Aplikasi memakai backend produksi secara default. Untuk menggunakan backend lokal, jalankan backend di terminal terpisah. Ikuti panduan instalasi dan konfigurasi di [`stoodify-backend/README.md`](../stoodify-backend/README.md); server lokal menggunakan port `8080`.

### Opsi A: HP fisik lewat USB

#### 2. Hubungkan HP

Aktifkan **Developer options → USB debugging**, hubungkan HP, lalu pastikan perangkat terdeteksi:

```bash
adb devices -l
```

Jika status perangkat `unauthorized`, buka dialog izin debugging di HP dan pilih **Allow**. Teruskan port backend dan Metro ke HP:

```bash
adb reverse tcp:8080 tcp:8080
adb reverse tcp:8081 tcp:8081
```

#### 3. Build dan pasang development build (pertama kali)

Dari direktori `stoodify-apk`, jalankan:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080/api npx expo run:android --no-bundler
```

Perintah ini membuat project Android bila diperlukan, membangun development build, dan memasangnya ke perangkat. Opsi `--no-bundler` mencegah Expo menjalankan Metro otomatis; Metro akan dijalankan terpisah pada langkah berikutnya. Jika ada beberapa perangkat/emulator, pilih perangkat yang akan dipakai saat diminta.

#### 4. Jalankan Metro dan buka aplikasi

Langkah ini diperlukan setelah pemasangan pertama dan setiap kali mulai sesi development baru. Pastikan backend lokal aktif dan jalankan USB reverse lagi jika memakai HP, lalu mulai Metro:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080/api npx expo start --dev-client --localhost --port 8081
```

Buka aplikasi **Stoodify** pada HP. Jika layar Development Build meminta alamat server, masukkan `http://localhost:8081` lalu pilih **Connect**. Biarkan Metro tetap berjalan selama pengembangan; perubahan JavaScript akan dimuat melalui Fast Refresh.

Jika tidak memakai backend lokal, hilangkan `EXPO_PUBLIC_API_URL` dari perintah. Aplikasi akan memakai API produksi yang dikonfigurasi di `src/constants/config.js`.

### Opsi B: Android Studio Emulator (AVD)

1. Di Android Studio, buka **Tools → Device Manager → Create Virtual Device**, pilih perangkat dan system image, lalu buat AVD dan jalankan emulator.
2. Dari terminal pada root `stoodify-apk`, pastikan emulator terdeteksi:

   ```bash
   adb devices -l
   ```

3. Generate project native. Jika memakai backend lokal, set URL backend emulator ke `10.0.2.2`:

   ```bash
   EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api npx expo prebuild --platform android --no-clean
   ```

   Jika memakai API produksi, jalankan `npx expo prebuild --platform android --no-clean` tanpa variabel tersebut.

4. Buka folder `stoodify-apk/android` melalui **File → Open** di Android Studio. Tunggu Gradle Sync selesai, pilih konfigurasi **app** dan AVD yang sedang berjalan, lalu tekan **Run**. Ini membangun dan memasang development build ke emulator.
5. Untuk Metro, teruskan port bundler ke emulator lalu mulai server dari root `stoodify-apk`:

   ```bash
   adb reverse tcp:8081 tcp:8081
   EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api npx expo start --dev-client --localhost --port 8081
   ```

   Buka Stoodify di emulator. Jika diminta alamat server, gunakan `http://localhost:8081`. Jika Android Studio belum memasang development build, jalankan `npx expo run:android --no-bundler` saat AVD sudah aktif.

Jika Metro tidak dapat dijangkau melalui `adb reverse`, jalankan Metro dengan `npx expo start --dev-client --port 8081` (tanpa `--localhost`), lalu hubungkan emulator ke alamat LAN yang ditampilkan Expo.

> `EXPO_PUBLIC_*` dimasukkan ke bundle aplikasi dan bukan tempat menyimpan password, API key, atau secret.

## Perubahan native

Perubahan JavaScript dapat dimuat melalui Fast Refresh. Setelah menambah atau mengubah dependency native, plugin Expo, permission, atau konfigurasi Android, jalankan prebuild dan pasang ulang development build:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080/api npx expo prebuild --platform android --no-clean
EXPO_PUBLIC_API_URL=http://localhost:8080/api npx expo run:android --no-bundler
```

Folder `android/` dihasilkan oleh Expo dan diabaikan Git. Jangan mengeditnya sebagai pengganti konfigurasi Expo kecuali perubahan memang khusus native.

## Build APK release

```bash
npm run build:apk
```

APK release dibuat di `android/app/build/outputs/apk/release/app-release.apk`. Perintah ini menjalankan Expo prebuild dan Gradle `assembleRelease` untuk `arm64-v8a`.

## Pemecahan masalah

| Gejala | Solusi |
|---|---|
| `adb devices` kosong | Coba kabel USB data lain, aktifkan USB debugging, lalu jalankan `adb devices -l` kembali. Pada Windows, periksa driver USB Android. |
| Status perangkat `unauthorized` | Buka kunci HP, setujui dialog **Allow USB debugging**, lalu cabut dan sambungkan ulang kabel. |
| HP tidak terhubung ke Metro | Jalankan ulang `adb reverse tcp:8081 tcp:8081`, pastikan Metro masih berjalan di port `8081`, lalu buka Development Build dan hubungkan ke `http://localhost:8081`. |
| Port `8081` sudah dipakai | Hentikan Metro lama dengan `Ctrl+C` di terminalnya, lalu mulai Metro kembali. Jangan jalankan dua Metro untuk project yang sama. |
| Yang terbuka Expo Go atau bundler tidak menemukan modul native | Pasang dan buka development build Stoodify dengan langkah di atas. Modul native seperti date picker tidak tersedia di Expo Go. |
| Aplikasi tidak dapat mengakses backend lokal dari HP | Jalankan `adb reverse tcp:8080 tcp:8080`, pastikan backend aktif di komputer, dan gunakan `http://localhost:8080/api`. Untuk emulator, gunakan `http://10.0.2.2:8080/api`. |
| Error cleartext untuk URL HTTP | HTTP lokal hanya diaktifkan oleh konfigurasi native saat `EXPO_PUBLIC_API_URL` memakai `http://`. Jalankan ulang prebuild dan `expo run:android` setelah mengubah konfigurasi tersebut. |
| Perubahan native tidak muncul | Jalankan ulang prebuild dan pasang development build seperti langkah **Perubahan native**. Fast Refresh hanya memperbarui JavaScript. |
| Bundle gagal atau dependency tidak cocok | Pastikan versi Node.js memenuhi persyaratan Expo SDK 58, lalu jalankan `npm ci` dan mulai Metro kembali. |

## Struktur kode

- `App.js`: entry aplikasi, tab, modal global, dan tombol Back Android.
- `src/screens/`: layar utama dan autentikasi.
- `src/components/`: komponen UI, navigasi, dan modal native.
- `src/services/`: API client dan layanan domain.
- `src/constants/`: konfigurasi API, endpoint, dan token desain.

Lampiran tugas hanya ditampilkan sebagai pratinjau lokal karena backend belum menyediakan endpoint penyimpanannya. Asisten percakapan menggunakan respons lokal; endpoint chat belum tersedia.
