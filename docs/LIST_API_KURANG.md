# Status Integrasi & Penyelarasan API Stoodify Mobile — Backend

Dokumen ini mencatat hasil audit integrasi dan evaluasi kesesuaian antara antarmuka mobile (**`stoodify-apk`**) dan backend (**`stoodify-backend`**). Seluruh temuan gap teknis (`GAP-01` s.d. `GAP-08`) telah **100% diselesaikan dan terverifikasi aktif** di codebase kedua repositori.

---

## 1. Ringkasan Status Integrasi API (Status: 100% Terselesaikan)

| Kategori | Endpoint Tersedia | Status Integrasi | Tingkat Kesesuaian | Keterangan Verifikasi |
|---|---|---|---|---|
| **Autentikasi & Pengguna** | 7 endpoint | Terintegrasi Penuh | **100%** | Profil siswa (`school`, `grade`, `major`, `avatar_url`), refresh token rotation, dan ganti password aktif. |
| **Mata Pelajaran (Subjects)** | 5 endpoint | Terintegrasi Penuh | **100%** | Metadata visual lengkap (`code`, `teacher`, `color`, `accent_bg`, `category`) aktif di DB & DTO. |
| **Jadwal Sekolah (Schedules)** | 6 endpoint | Terintegrasi Penuh | **100%** | Atribut `room` & `teacher` aktif; normalizer mendukung hari Indonesia, Inggris, dan angka 1–7. |
| **Tugas & Subtugas (Tasks)** | 11 endpoint | Terintegrasi Penuh | **100%** | Kolom `material_name` dan objek `priority_breakdown` dinamis aktif di response tugas. |
| **Aktivitas Rutin (Activities)** | 4 endpoint | Terintegrasi Penuh | **100%** | CRUD aktivitas rutin aktif dan diperhitungkan dalam AI scheduler. |
| **Sesi Belajar (Study Sessions)** | 5 endpoint | Terintegrasi Penuh | **100%** | Pembuatan manual (`POST /api/study-sessions/`) aktif; sesi usang dibersihkan otomatis saat generate AI. |
| **AI Bridge (Jadwal & Prediksi)** | 8 endpoint | Terintegrasi Penuh | **100%** | Murni bridge ke microservice Python (ADR-005); prediksi materi 100% via LLM Gemini `gemini-2.5-flash`. |
| **Notifikasi (Notifications)** | 3 endpoint | Terintegrasi Penuh | **100%** | Polling notifikasi in-app dan mark-as-read terintegrasi. |
| **Statistik (Statistics)** | 4 endpoint | Terintegrasi Penuh | **100%** | Overview, weekly, monthly, dan streak belajar aktif (`streak_days`) dengan toleransi akhir pekan. |

---

## 2. Rincian Penyelesaian Gap Teknis

### GAP-01: Atribut Identitas Pendidikan pada Profil Siswa
- **Status:** **TERSELESAIKAN (100%)**
- **Implementasi Backend:**
  - Tabel `users` memiliki kolom: `school` (VARCHAR 150), `grade` (SMALLINT), `major` (VARCHAR 100), dan `avatar_url` (VARCHAR 255).
  - Handler `authCtrl.Register`, `authCtrl.Login`, `userCtrl.GetMe`, dan `userCtrl.UpdateMe` telah mengekspos dan menerima seluruh field tersebut.
- **Konsumsi Mobile:**
  - Ditampilkan di header Beranda, kartu Profil, dan form preferensi belajar.

---

### GAP-02: Parameter Istirahat pada Preferensi Belajar Siswa
- **Status:** **TERSELESAIKAN (100%)**
- **Implementasi Backend:**
  - Tabel `user_preferences` memiliki kolom `break_duration` (INT default 15) dan `max_sessions_per_day` (INT default 3).
  - Handler `userCtrl.GetPreferences` dan `userCtrl.UpdatePreferences` mendukung kedua atribut ini dan diteruskan ke payload AI scheduler.
- **Konsumsi Mobile:**
  - Ditampilkan dan dapat diatur melalui modal preferensi belajar di layar Profil.

---

### GAP-03: Metadata Lengkap Mata Pelajaran
- **Status:** **TERSELESAIKAN (100%)**
- **Implementasi Backend:**
  - Model `Subject` memuat: `code` (VARCHAR 20), `teacher` (VARCHAR 100), `color`, `accent_bg` (VARCHAR 30), `category` (VARCHAR 50), dan `difficulty` (1–5).
  - Handler `subjectCtrl.GetAll`, `subjectCtrl.Create`, dan `subjectCtrl.Update` memproses seluruh metadata tersebut.
- **Konsumsi Mobile:**
  - Ditampilkan pada badge ringkas mapel di layar ponsel sempit (360dp–412dp) dan kartu jadwal mingguan.

---

### GAP-04: Atribut Ruangan & Guru pada Jadwal Sekolah
- **Status:** **TERSELESAIKAN (100%)**
- **Implementasi Backend:**
  - Model `Schedule` memuat: `room` (VARCHAR 50) dan `teacher` (VARCHAR 100).
  - DTO `ScheduleInput` dan `ScheduleResponse` menyertakan kedua atribut tersebut.
- **Konsumsi Mobile:**
  - Ditampilkan pada kartu slot jadwal pelajaran di Kalender dan form edit jadwal.

---

### GAP-05: Penamaan Hari Fleksibel (Indonesia & Inggris)
- **Status:** **TERSELESAIKAN (100%)**
- **Implementasi Backend:**
  - Helper normalizer di backend menerima nama hari format Indonesia (`Senin`..`Minggu`), Inggris (`Monday`..`Sunday`), maupun angka ISO 1–7.
- **Konsumsi Mobile:**
  - Dilengkapi adapter dua arah di `src/services/scheduleService.js` untuk integritas tampilan lokal.

---

### GAP-06: Pembuatan Sesi Belajar Mandiri Manual
- **Status:** **TERSELESAIKAN (100%)**
- **Implementasi Backend:**
  - Endpoint `POST /api/study-sessions/` aktif dengan handler `sessionCtrl.Create`.
- **Konsumsi Mobile:**
  - Terintegrasi di `src/services/studySessionService.js:createSession()`.

---

### GAP-07: Rincian Komponen Skor Prioritas Tugas
- **Status:** **TERSELESAIKAN (100%)**
- **Implementasi Backend:**
  - Struct `TaskResponse` menyertakan komputasi dinamis objek `priority_breakdown` (`urgency_score`, `difficulty_score`, `duration_score`, `late_risk_score`, `total_score`) via package `internal/priority` (ADR-001).
- **Konsumsi Mobile:**
  - Dikonsumsi oleh modal penjelasan transparansi prioritas AI tugas di mobile.

---

### GAP-08: Silabus & Kurikulum Bertingkat (Roadmap Materi)
- **Status:** **TERSELESAIKAN (100% Endpoint & Skema)**
- **Implementasi Backend:**
  - Tabel `curriculum_topics` dan `user_topic_progress` aktif di migrasi database.
  - Endpoint `GET /api/curriculum/roadmap/:subjectId`, `POST /api/curriculum/topics`, dan `POST /api/curriculum/topics/:topicId/progress` terdaftar dan aktif.
- **Konsumsi Mobile:**
  - Terintegrasi untuk pemetaan alur belajar dan materi prediksi AI.

---

## 3. Evaluasi Kestabilan & Ketahanan Sesi (Audit Terkini 19 November 2026)

1. **Pencegahan Akumulasi Duplikat Sesi di Kalender:**
   - Backend Go secara otomatis membersihkan sesi `planned` lama milik user sebelum menyimpan rekomendasi baru dari AI (`controllers/ai_controllers.go`).
   - Frontend mobile memetakan nama hari ke tanggal nyata minggu aktif (`resolveDateForDay`) dan mendeduplikasi slot waktu.
2. **Ketahanan Token Refresh & Sesi Pengguna:**
   - Masa berlaku: Access Token 15 menit, Refresh Token 7 hari (dapat disesuaikan via ENV `JWT_ACCESS_TTL` dan `JWT_REFRESH_TTL`).
   - Mobile client mengimplementasikan `await setTokensAsync` ke `SecureStore` (atomic persistence), proactive refresh saat token tersisa < 90 detik, dan sinkronisasi `AppState` saat aplikasi kembali dari background.
3. **Stoodify Design System Dialog:**
   - 100% dialog `Alert.alert` bawaan OS digantikan oleh `CustomAlertDialog` berbasis Stoodify Design System (`radii.card = 16`, Poppins font, tinted badge icon, dark backdrop overlay).
