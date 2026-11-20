# AGENTS.md — Petunjuk Operasional Frontend & Desain untuk AI Agent

Dokumen ini merupakan panduan teknis dan operasional untuk seluruh **AI Agent** yang membangun, memodifikasi, atau memelihara antarmuka visual (UI/UX), komponen front-end, serta sistem pengingat pada repositori `stoodify-apk`.

Panduan ini melengkapi [`../AGENTS.md`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/AGENTS.md) root dan merujuk secara ketat ke [`DESIGN.md`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/docs/DESIGN.md).

---

## 1. Peta Arsitektur Komponen Visual & Servis Baru

```
src/
├── constants/
│   └── theme.js                     # Source of truth: colors, radii, shadow
├── components/
│   ├── ui.js                        # Primitif UI (Screen, AppText, Button, Card, Field, Pill, Loading)
│   ├── onboarding/                  # Sub-komponen onboarding
│   │   ├── OnboardingSlide.js       # Slide presentasi welcome, jadwal, deadline
│   │   └── OnboardingQuestionnaire.js # Kuisioner tujuan, jam sekolah, jam luang
│   ├── BottomTabs.js                # Floating pill navigation bar (5 tabs)
│   ├── ModalSheet.js                # Bottom sheet standar (spring animation, handle)
│   ├── CustomAlertDialog.js         # Dialog modal terpadu pengganti Alert.alert
│   └── AccountModals.js             # Modal Preferensi Belajar & Pengingat Notifikasi
├── services/
│   ├── localNotificationService.js # Engine penjadwalan notifikasi lokal & eskalasi deadline
│   └── tokenStorage.js              # Token persisten, flag onboarding, pending preferences
└── screens/
    ├── OnboardingScreen.js          # Layar onboarding interaktif (7 langkah)
    ├── HomeScreen.js                # Layar Beranda
    ├── CalendarScreen.js            # Layar Kalender
    ├── TasksScreen.js               # Layar Daftar Tugas
    ├── AIPlanScreen.js              # Layar Jadwal Belajar AI
    └── ProfileScreen.js             # Layar Profil & Akun
```

---

## 2. Aturan Implementasi Fitur Baru

1. **Alur Onboarding (First-Time User):**
   - Layar onboarding dikelola oleh [`src/screens/OnboardingScreen.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/screens/OnboardingScreen.js).
   - Memiliki 7 tahapan: Welcome hero -> Penjadwalan AI -> Deadline & Izin Notifikasi -> Kuisioner Tujuan -> Kuisioner Jam Sekolah -> Kuisioner Jam Belajar -> Ringkasan Profil & Transisi Masuk Akun.
   - Preferensi belajar yang diisi disimpan lokal via `tokenStorage.setOnboardingPreferences` dan otomatis di-sync ke backend saat siswa login/register.
   - Pengguna lama dapat memutar ulang panduan via menu "Panduan Pengantar (Onboarding)" di `ProfileScreen`.

2. **Sistem Notifikasi & Pengingat Cerdas:**
   - Dikelola oleh [`src/services/localNotificationService.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/services/localNotificationService.js).
   - **Proximity Reminder:** Mengingatkan 10 menit sebelum jam sesi belajar AI dimulai (dapat diubah di Preferensi: 5, 10, 15, 30 menit).
   - **Eskalasi Batas Waktu Tugas:**
     - **H-2:** Pengingat pukul 18:00 (persiapan mencicil).
     - **H-1:** Pengingat darurat pukul 16:00 (eksekusi tugas).
     - **H-0 Gelombang 1:** Pengingat pagi pukul 07:00 (briefing hari pengumpulan).
     - **H-0 Gelombang 2:** Hitung mundur 3 jam sebelum jam tenggat.
   - **Checklist Cancellation:** Begitu tugas ditandai selesai (`status === 'selesai'`), seluruh antrean pengingat untuk tugas tersebut otomatis dibatalkan via `cancelTaskReminders`.

3. **Prinsip Anti-Slop & Standar Ukuran File:**
   - Maksimal **300 baris per file** untuk setiap berkas baru.
   - Seluruh teks wajib menggunakan `<AppText>` dengan font Poppins.
   - Kontras warna teks selalu minimal 4.5:1 terhadap canvas `#EAF1FC` dan surface `#FFFFFF`.
   - Menjaga bottom padding layar minimal `paddingBottom: 120` agar konten tidak tertutup floating bottom tab bar.
