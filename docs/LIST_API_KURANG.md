# Daftar Kekurangan & Evaluasi Kebutuhan API Stoodify

Dokumen ini mencatat seluruh temuan audit integrasi antara antarmuka mobile (**`stoodify-apk`**) dan backend (**`stoodify-backend`**). Dokumen ini berfungsi sebagai acuan resmi bagi tim Backend Developer untuk penyesuaian skema database, validasi, dan penambahan endpoint di iterasi berikutnya.

---

## 1. Ringkasan Status Integrasi API

| Kategori | Jumlah Endpoint Tersedia | Status Integrasi | Tingkat Kesesuaian |
|---|---|---|---|
| **Autentikasi & Pengguna** | 7 endpoint | Terintegrasi | 80% (Perlu penambahan atribut profil) |
| **Mata Pelajaran (Subjects)** | 5 endpoint | Terintegrasi | 75% (Perlu metadata visual & kode mapel) |
| **Jadwal Sekolah (Schedules)** | 6 endpoint | Terintegrasi | 80% (Perlu atribut ruang & lokalisasi hari) |
| **Tugas & Subtugas (Tasks)** | 11 endpoint | Terintegrasi | 85% (Perlu rincian breakdown skor prioritas) |
| **Aktivitas Rutin (Activities)** | 4 endpoint | Terintegrasi | 90% |
| **Sesi Belajar (Study Sessions)** | 4 endpoint | Terintegrasi | 70% (Belum ada pembuatan sesi manual langsung) |
| **AI Bridge (Rekomendasi & Prediksi)** | 8 endpoint | Terintegrasi | 90% |
| **Notifikasi (Notifications)** | 3 endpoint | Terintegrasi | 90% |
| **Statistik (Statistics)** | 4 endpoint | Terintegrasi | 95% |

---

## 2. Rincian Kekurangan & Kebutuhan Penyesuaian API

### GAP-01: Ketiadaan Atribut Identitas Pendidikan pada Profil Siswa
- **Fitur Terkait:** Profil Siswa, Header Sapaan, dan Personalisasi Akun (`Auth` & `User`).
- **Kebutuhan Frontend:**
  - Menampilkan nama sekolah (misal: "SMKN 1 Cimahi").
  - Menampilkan jenjang kelas (misal: "Kelas XII").
  - Menampilkan kompetensi keahlian/jurusan (misal: "SIJA / Rekayasa Perangkat Lunak").
- **Kondisi Endpoint Saat Ini:**
  - `GET /api/users/me` hanya mengembalikan `{ id, name, email, role }`.
  - Tabel database `users` tidak memiliki kolom `school`, `grade`, dan `major`.
- **Perubahan API yang Diperlukan:**
  - Tambahkan kolom `school` (VARCHAR), `grade` (VARCHAR), dan `major` (VARCHAR) pada tabel `users`.
  - Update handler `userCtrl.GetMe` dan `userCtrl.UpdateMe` (`PATCH /api/users/me`) untuk menerima dan mengembalikan ketiga kolom tersebut.
- **Solusi Sementara di Frontend:**
  - Menyimpan data default/fallback pada client-side adapter jika field bernilai `null` atau belum disediakan backend.

---

### GAP-02: Ketiadaan Parameter Istirahat pada Preferensi Belajar
- **Fitur Terkait:** Pengaturan Preferensi Belajar Siswa (`users/me/preferences`).
- **Kebutuhan Frontend:**
  - Durasi jeda istirahat antar sesi belajar (`break_duration_minutes`, default 15 menit).
  - Batas maksimal sesi per hari (`max_sessions_per_day`, default 3-4 sesi).
- **Kondisi Endpoint Saat Ini:**
  - `GET` & `PATCH /api/users/me/preferences` hanya menyimpan:
    - `start_time` (string)
    - `end_time` (string)
    - `session_duration` (int)
    - `active_days` (string)
- **Perubahan API yang Diperlukan:**
  - Tambahkan kolom `break_duration` (INT default 15) dan `max_sessions_per_day` (INT default 3) pada tabel `user_preferences`.
  - Parameter ini juga sangat krusial digunakan oleh worker AI Scheduler saat menyusun rekomendasi sesi belajar agar siswa tidak mengalami burnout.

---

### GAP-03: Ketiadaan Metadata Lengkap pada Mata Pelajaran
- **Fitur Terkait:** Manajemen Mata Pelajaran (`SubjectsView`), Badge Tugas, dan Tag Kalender.
- **Kebutuhan Frontend:**
  - `code`: Singkatan atau kode mapel (misal: "MTK", "PWB", "AIJ", "BD") untuk badge ringkas di layar kecil mobile (360dp - 412dp).
  - `teacher`: Nama guru pengampu mata pelajaran.
  - `accent_bg`: Warna latar lembut (tint) pelengkap warna utama (`color`) untuk badge transparan.
  - `category`: Kategori mapel (misal: "Muatan Kejuruan", "Umum", "Peminatan").
- **Kondisi Endpoint Saat Ini:**
  - `GET` & `POST /api/subjects/` hanya mengelola: `{ name, color, difficulty }`.
- **Perubahan API yang Diperlukan:**
  - Tambahkan kolom `code` (VARCHAR 10), `teacher` (VARCHAR 100), `accent_bg` (VARCHAR 20), dan `category` (VARCHAR 50) pada tabel `subjects`.
- **Solusi Sementara di Frontend:**
  - Helper adapter di frontend meng-generate kode mapel otomatis dari huruf awal nama (contoh: "Matematika" -> "MTK", "Basis Data" -> "BD") dan menghitung warna `accentBg` dengan menambahkan opacity pada hex `color`.

---

### GAP-04: Ketiadaan Atribut Ruangan & Guru pada Jadwal Sekolah
- **Fitur Terkait:** Roster Jadwal Mingguan Sekolah & Agenda Kalender (`ScheduleView` & `CalendarView`).
- **Kebutuhan Frontend:**
  - Menampilkan ruang kelas / lab tempat pelajaran berlangsung (misal: "Lab Komputer 3", "R. 204").
  - Menampilkan guru pengajar pada slot jam pelajaran tersebut.
- **Kondisi Endpoint Saat Ini:**
  - Tabel `schedules` hanya memiliki kolom: `subject_id`, `day_of_week`, `start_time`, `end_time`.
- **Perubahan API yang Diperlukan:**
  - Tambahkan kolom `room` (VARCHAR 50) dan `teacher` (VARCHAR 100) pada tabel `schedules`.

---

### GAP-05: Penamaan Hari Jadwal Bahasa Inggris vs Bahasa Indonesia
- **Fitur Terkait:** Form Tambah Jadwal & Tampilan Hari (`Schedule`).
- **Kondisi Saat Ini:**
  - Backend memvalidasi `day_of_week` secara ketat hanya menerima: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`.
  - Frontend mobile berbahasa Indonesia menggunakan: `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu`, `Minggu`.
- **Penanganan yang Diterapkan:**
  - Frontend telah dilengkapi adapter dua arah (`dayToBackend` dan `dayToFrontend`) di `scheduleService.js`.
- **Saran Peningkatan API:**
  - Backend diharapkan dapat menerima input hari baik format Inggris (`Monday`) maupun Indonesia (`Senin`) atau format angka indeks ISO 1–7 (1=Senin, 7=Minggu) untuk fleksibilitas client.

---

### GAP-06: Ketiadaan Endpoint Pembuatan Sesi Belajar Manual
- **Fitur Terkait:** Perencanaan Sesi Belajar Mandiri di Kalender (`Study Sessions`).
- **Kebutuhan Frontend:**
  - Siswa ingin menambahkan sesi belajar mandiri untuk suatu tugas di waktu tertentu tanpa harus bergantung pada rekomendasi AI.
- **Kondisi Endpoint Saat Ini:**
  - Endpoint `study-sessions` di `routes.go` hanya menyediakan:
    - `GET /api/study-sessions/`
    - `GET /api/study-sessions/today`
    - `PATCH /api/study-sessions/:id`
    - `DELETE /api/study-sessions/:id`
  - Tidak ada endpoint `POST /api/study-sessions/` untuk pembuatan langsung oleh user. Pembuatan sesi saat ini **hanya** terjadi via `POST /api/ai/schedule-recommendations/generate` atau `POST /api/ai/reschedule`.
- **Perubahan API yang Diperlukan:**
  - Buat handler `sessionCtrl.Create` dan daftarkan `POST /api/study-sessions/` dengan validasi:
    `{ task_id, session_date, start_time, duration, target_progress }`.

---

### GAP-07: Ketiadaan Rincian Komponen Skor Prioritas Tugas
- **Fitur Terkait:** Modal Penjelasan Skor Prioritas (`PriorityExplainerModal`).
- **Kebutuhan Frontend:**
  - Menampilkan transparansi perhitungan prioritas kepada siswa:
    - Bobot Urgensi (sisa waktu ke deadline).
    - Bobot Tingkat Kesulitan (skala 1-5).
    - Bobot Estimasi Durasi.
    - Bobot Risiko Terlambat.
- **Kondisi Endpoint Saat Ini:**
  - Backend menghitung prioritas via package internal `priority`, tetapi response `POST /api/tasks/` dan `GET /api/tasks/` hanya menyertakan nilai total tunggal: `priority_score` (misal: `87.4`).
- **Perubahan API yang Diperlukan:**
  - Sertakan objek rincian breakdown pada response task:
    ```json
    "priority_breakdown": {
      "urgency_score": 35.0,
      "difficulty_score": 25.0,
      "duration_score": 15.0,
      "late_risk_score": 12.4,
      "total_score": 87.4
    }
    ```
- **Solusi Sementara di Frontend:**
  - Frontend menampilkan `priority_score` riil dari database backend, dan menghitung estimasi visual komponen breakdown menggunakan formula pembobotan proporsional lokal.

---

### GAP-08: Ketiadaan Endpoint Silabus & Kurikulum (Roadmap Materi)
- **Fitur Terkait:** Alur Pembelajaran Berkelanjutan (`RoadmapView`).
- **Kebutuhan Frontend:**
  - Daftar bab/materi terstruktur per mata pelajaran beserta status kelulusan (telah dipelajari / sedang dipelajari / belum dimulai).
- **Kondisi Endpoint Saat Ini:**
  - Belum ada entitas database maupun controller untuk materi kurikulum bertingkat di backend.
- **Perubahan API yang Diperlukan:**
  - Rancang tabel `curriculum_topics` (`id`, `subject_id`, `topic_name`, `order_index`, `description`) dan `user_topic_progress` (`user_id`, `topic_id`, `status`).

---

## 3. Kesimpulan & Rekomendasi Prioritas untuk Tim Backend

Untuk rilis produksi terdekat, berikut urutan prioritas yang paling berdampak langsung terhadap pengalaman pengguna aplikasi mobile Stoodify:

1. **Prioritas Tinggi (P1):**
   - Penambahan `POST /api/study-sessions/` agar siswa dapat membuat sesi belajar manual selain melalui AI rekomendasi.
   - Penambahan kolom `code` pada tabel `subjects` agar tampilan kartu dan badge di mobile tetap rapi tanpa teks terpotong.
2. **Prioritas Menengah (P2):**
   - Penambahan kolom `school`, `grade`, dan `major` pada tabel `users`.
   - Penambahan kolom `room` pada tabel `schedules`.
   - Pilihan bahasa Indonesia / angka hari pada endpoint `schedules`.
3. **Prioritas Rendah (P3):**
   - Penyertaan objek `priority_breakdown` pada response task.
   - Fitur silabus dan roadmap kurikulum.
