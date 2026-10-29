# AGENTS.md — Stoodify Mobile Application

Panduan teknis dan operasional untuk seluruh AI Agent yang bekerja pada repositori `stoodify-apk`.

---

## 1. Identitas & Gambaran Proyek

- **Nama Proyek:** Stoodify Mobile App (`stoodify-apk`).
- **Target Pengguna:** Siswa SMA, SMK, dan sederajat di Indonesia.
- **Tujuan Produk:** Asisten belajar berbasis AI untuk manajemen tugas sekolah, pengingat deadline, perumusan jadwal belajar personal, dan rekomendasi materi.
- **Filosofi Engineering:**
  - **Evidence-Based:** Keputusan berbasis bukti nyata dari codebase dan konfigurasi aktif, bukan asumsi.
  - **Non-Destructive:** Lindungi kode dan konfigurasi yang sudah ada; jangan lakukan refactor besar tanpa mandat eksplisit.
  - **Mobile-First & Lean:** Menjaga performa tinggi, UI bebas glitch/overflow, dan ukuran binary APK tetap ramping (~9.7 MB).

---

## 2. Arsitektur & Status Stack Aktual

Agent wajib membedakan secara tegas antara **fakta yang telah terbukti di kode aktif** dan **rencana roadmap dokumen**:

### A. Fakta Aktif Codebase (Verified)
- **Framework:** React Native `0.88.0` dengan Expo SDK `~58.0.21`, React `19.3.0`.
- **Bentuk Arsitektur Saat Ini:** Hybrid WebView Container (`App.js`) membungkus web production `https://stoodify-mobile-app.vercel.app` menggunakan `react-native-webview` (`14.0.1`).
- **Fitur Mobile yang Sudah Aktif:**
  - Penanganan hardware back button Android (`BackHandler`) untuk riwayat WebView.
  - Loading state kustom & offline/error state dengan mekanisme reload (*Coba Lagi*).
  - Dialog izin kamera & mic (`CAMERA`, `RECORD_AUDIO`) untuk pemindaian soal belajar.
  - Styling dasar menggunakan `StyleSheet.create` native.
- **Native Generation & Build System:**
  - Menggunakan Expo Continuous Native Generation (CNG) via `npx expo prebuild -p android`.
  - Folder `android/` diabaikan dari git (`.gitignore`).
  - Optimasi APK Gradle: Target arsitektur `arm64-v8a` dengan `useLegacyPackaging` dan resource shrinking untuk ukuran release ~9.7 MB.
  - CI Pipeline: GitHub Actions (`.github/workflows/build-apk.yml`) otomatis build APK via JDK 17 dan Gradle `assembleRelease`.

### B. Roadmap Masa Depan (Rencana Dokumen `MobileDev_Stoodify.pdf`)
- *Rencana target*: Migrasi bertahap ke screen native penuh (Expo Router, NativeWind v4, TanStack Query, Axios, React Hook Form + Zod, AsyncStorage, Expo Notifications).
- **Aturan Tegas:** JANGAN mengimpor, memanggil, atau mengasumsikan library roadmap di atas sebelum dipasang secara nyata di `package.json`.

---

## 3. Batasan Ukuran File & Modularisasi

1. **Target Ukuran File:**
   - **Maksimal 300 baris per file** untuk seluruh kode baru maupun hasil modifikasi.
   - **Toleransi:** Maksimal 400 baris hanya jika ada alasan teknis yang kuat (misalnya konfigurasi kompleks atau integrasi bridge native monolitik). Alasan wajib dicatat pada komentar header file.
2. **Prinsip Modularisasi:**
   - Pisahkan kode berdasarkan tanggung jawab tunggal (*Single Responsibility Principle*):
     - Logika navigasi & state eksternal -> custom hooks (`src/hooks/`).
     - Komponen visual -> reusable UI components (`src/components/`).
     - Konstanta, styling tokens, dan URL -> constants (`src/constants/`).
     - Komunikasi bridge / API -> service layer (`src/services/`).

---

## 4. Standar Kode React Native & Mobile

1. **Komponen & Interaksi:**
   - Gunakan `Pressable` daripada `TouchableOpacity` untuk kontrol respons interaksi dan feedback visual yang konsisten.
   - Hindari alokasi objek inline (`style={{ ... }}`) atau fungsi inline anonim di dalam render tree loop komponen berulang.
   - Seluruh elemen teks wajib berada di dalam komponen `<Text>`, tidak boleh string mentah di dalam `<View>`.
2. **Layout & Responsivitas:**
   - Wajib menangani safe area dengan benar pada perangkat berponi/notch (`SafeAreaView` atau Safe Area provider).
   - Pastikan viewport mobile tidak mengalami horizontal overflow atau clipping pada layar sempit (360dp - 412dp Android).
3. **Animasi & Performa:**
   - Hanya lakukan animasi pada properti GPU-friendly (`transform`, `opacity`).
   - Bersihkan seluruh timer, listener, dan subscription pada cleanup function `useEffect` (misal `BackHandler.remove()`).

---

## 5. Pemanfaatan Skills & MCP Tools yang Tersedia

Agent hanya boleh menggunakan tool dan skill yang benar-benar terdaftar dalam environment:

### A. Skills Relevan
- `vercel-react-native-skills`: Rujukan utama performa React Native, optimasi list, rendering, dan struktur komponen.
- `mobile-developer`: Rujukan siklus hidup aplikasi mobile, penanganan izin Android, dan debugging layout mobile.
- `antislop`, `antislop-ui`, `antislop-layoutmobile`: Filter anti-slop, menjaga estetika antarmuka bersih, dan layout responsif mobile.
- `qa-testing-engineer`: Rujukan skenario pengujian, validasi regresi, dan penyusunan kriteria uji.
- `project-documentation`: Rujukan standar penulisan dokumentasi teknis agar faktual dan terstruktur.

### B. MCP Tools (`rea`)
- **ADB Client Tools:** Gunakan tool ADB dari MCP server `rea` (`list_adb_devices`, `inspect_adb_device`, `install_adb_package`, `read_adb_logcat`, `capture_adb_screen`) saat memverifikasi status perangkat Android fisik/emulator, mendiagnosis crash native runtime, dan mengecek instalasi APK.
- **Binary/Resource Inspection:** Gunakan `inspect_apktool_client` atau `decode_android_resources` bila perlu memvalidasi isi bundle APK yang dihasilkan.
- **Integritas Pelaporan:** JANGAN PERNAH mengklaim skill atau tool MCP telah dijalankan jika eksekusi nyatanya tidak dilakukan.

---

## 6. Workflow Pengembangan (5-Phase Lifecycle)

Setiap pengerjaan task wajib melalui lima fase berikut secara teratur:

```
[1. AUDIT] ──> [2. PLANNING] ──> [3. IMPLEMENTASI] ──> [4. TESTING] ──> [5. REPORTING]
```

1. **Phase 1: Audit**
   - Periksa `package.json`, konfigurasi native (`app.json`, `android/gradle.properties`), dan struktur file aktif.
   - Verifikasi apakah perubahan menyentuh native layer (butuh `prebuild`) atau hanya JavaScript runtime.
2. **Phase 2: Planning**
   - Rancang langkah perubahan secara modular.
   - Jika task berskala besar (>2 file atau perubahan arsitektur), buat checkpoint dan jelaskan scope kerja sebelum mengeksekusi.
3. **Phase 3: Implementasi**
   - Terapkan perubahan kode secara terfokus dan patuhi batasan <= 300 baris per file.
   - Jaga backward compatibility dan jangan merusak penanganan WebView atau tombol kembali fisik yang sudah stabil.
4. **Phase 4: Testing & Verifikasi**
   - Jalankan uji validasi sintaks, build check, atau validasi konfigurasi Expo (`npx expo doctor` jika relevan).
   - Pastikan alur error/loading dan back-button navigation tetap bekerja.
5. **Phase 5: Pelaporan**
   - Laporkan file yang diubah, hasil verifikasi teknis, serta daftar hal yang belum diuji/unknown.

---

## 7. Pengelolaan Task Kompleks & Kontinuitas Kerja

Untuk menghindari hilangnya progres saat eksekusi terhenti:
- **Pecah ke Sub-Task Mandiri:** Bagi tugas besar menjadi tahapan kecil (misal: Sub-task 1: Setup types & constants; Sub-task 2: Implementasi hook; Sub-task 3: UI integration).
- **Simpan Status Secara Berkala:** Dokumentasikan status pengerjaan pada pesan atau catatan kerja setelah menyelesaikan setiap sub-task.
- **Atomic File Operations:** Modifikasi file secara spesifik dan terisolasi, hindari perubahan acak di banyak file secara simultan.

---

## 8. Keamanan, Proteksi File & Definition of Done (DoD)

### A. Proteksi Keamanan & File Pengguna
- **Sensitivitas Kredensial:** Dilarang memasukkan keystore release (`*.jks`, `*.keystore`), token EAS, atau credential rahasia ke dalam tracking git.
- **Izin Android Minimal:** Hanya daftarkan izin aplikasi pada `app.json` yang memang dibutuhkan fitur (misal: `CAMERA`, `RECORD_AUDIO`, `INTERNET`).
- **Non-Destructive Guard:** Dilarang menghapus atau mengubah file pengguna yang sedang tidak terkait dengan instruksi aktif.

### B. Definition of Done (DoD)
Sebuah task pada repositori ini dinyatakan selesai (**DONE**) apabila:
1. Kode tidak memiliki syntax error dan lulus audit struktur file (<= 300 baris, max 400 dengan justifikasi).
2. Konfigurasi Expo & Android tetap sinkron dan tidak merusak skrip build (`npx expo start`, `assembleRelease`).
3. Penanganan state krusial (Loading, Offline/Error, Hardware Back Button) tetap terverifikasi utuh.
4. Tidak ada asumsi library yang tidak terbukti dalam `package.json`.
5. Hasil kerja dilaporkan secara faktual, transparan, dan dapat diverifikasi langsung.
