# DESIGN.md — Stoodify Mobile Design System & UI/UX Guidelines

Dokumentasi ini adalah **Source of Truth** untuk seluruh tampilan, tata letak, komponen visual, dan perilaku interaksi antarmuka pada aplikasi mobile **Stoodify** (`stoodify-apk`).

Seluruh AI Agent atau developer yang memodifikasi atau membuat layar/komponen baru **wajib** mengikuti spesifikasi di dalam dokumen ini demi menjaga konsistensi visual 100% dengan antarmuka yang ada saat ini.

---

## 1. Identitas Visual & Filosofi Desain

- **Karakter Visual:** Modern, Clean, Academic-Focused, Trustworthy, dan Vibrant.
- **Target Pengguna:** Siswa SMA, SMK, dan sederajat di Indonesia.
- **Prinsip Anti-Slop Antarmuka:**
  - **Bebas Warna Default AI:** Tidak menggunakan gradasi ungu-cyan acak atau glow berlebih. Warna utama berbasis Electric Blue (`#0062FF`) dipadukan dengan latar kanvas sejuk (`#EAF1FC`).
  - **Hierarki Jelas & Bernapas:** Jarak antar-seksi konsisten (`gap: 16`), padding bawah aman (`paddingBottom: 120`) agar konten tidak bertubrukan dengan floating navigation bar.
  - **Tipografi Terbaca Nyata:** Skala teks disesuaikan untuk layar smartphone (360dp - 412dp), ukuran terkecil memiliki batas aman keterbacaan, dan kontras warna teks terhadap kanvas selalu lolos standar WCAG 2.2 AA.
  - **Feedback Interaktif Halus:** Setiap sentuhan memiliki respon visual (`scale: 0.985`, `opacity: 0.78`).

---

## 2. Design Tokens (Konstanta Desain)

Sumber kode aktif: [`src/constants/theme.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/constants/theme.js)

### A. Palet Warna (Color Palette)

| Token | Nilai Hex | Peran & Penggunaan |
|---|---|---|
| `colors.primary` | `#0062FF` | Brand utama, tombol CTA utama, tab aktif, link, highlight |
| `colors.primaryDark` | `#1746E0` | Hover/pressed state primer, variasi gradasi hero |
| `colors.indigo` | `#4F46E5` | Aksen gradasi hero card, badge pelengkap |
| `colors.canvas` | `#EAF1FC` | Latar belakang seluruh layar (`Screen`), sejuk dan nyaman di mata |
| `colors.surface` | `#FFFFFF` | Latar belakang kartu (`Card`), modal sheet, dialog |
| `colors.ink` | `#0F172A` | Teks utama, judul, angka metrik (Slate 900) |
| `colors.muted` | `#475569` | Teks sekunder, label keterangan, subtitle (Slate 600) |
| `colors.faint` | `#F1F5F9` | Tombol ghost, garis pembatas/divider, background pill non-aktif |
| `colors.border` | `#E2E8F0` | Garis tepi input field, border kartu sekunder (Slate 200) |
| `colors.success` | `#059669` | Status tuntas, indikator tepat waktu, icon checklist selesai |
| `colors.warning` | `#D97706` | Tugas prioritas sedang, peringatan dialog |
| `colors.danger` | `#E11D48` | Tugas prioritas darurat/sangat tinggi, tombol hapus/logout |

**Warna Khusus Komponen Tambahan:**
- **Overlay Backdrop:** `rgba(15, 23, 42, 0.65)` (Gelap Slate 900 65% untuk ModalSheet & CustomAlertDialog).
- **Floating Tab Bar Shell:** `rgba(255, 255, 255, 0.97)` (Putih solid anti-tembus).
- **Hero Gradient:** `["#064CE0", "#126EFF", "#4F46E5"]` (Sudut kiri-atas ke kanan-bawah).
- **Streak Flame:** `#F97316` (Oranye cerah untuk indikator streak belajar).

### B. Radius Sudut (Corner Radii)

| Token | Nilai | Penerapan |
|---|---|---|
| `radii.card` | `16` | Seluruh `Card`, input wrap (`Field`), tile aksi cepat, dialog box |
| `radii.modal` | `30` | Sudut atas bottom sheet (`borderTopLeftRadius`, `borderTopRightRadius`) |
| `radii.pill` | `999` | Seluruh `Button`, filter chip `Pill`, floating tab bar (`borderRadius: 32`) |

### C. Elevasi & Bayangan (Shadows)

```javascript
export const shadow = {
  shadowColor: "#123B78",
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};
```
> [!CAUTION]
> **PANTANGAN KERAS:** Jangan pernah menyebarkan objek `shadow` dengan properti `opacity: 0.08` langsung ke style `View` kontainer! Hal ini menyebabkan seluruh isi kartu (teks, tombol, ikon) menjadi transparan 8%. Properti bayangan hanya boleh menggunakan `shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset`, dan `elevation`.

---

## 3. Sistem Tipografi (Typography)

Seluruh teks aplikasi wajib menggunakan font **Poppins** yang dimuat melalui `@expo-google-fonts/poppins` di [`App.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/App.js):
- `Poppins_400Regular`: Isi teks, pesan modal, input form, catatan tugas.
- `Poppins_500Medium`: Teks bantuan ringan, chip pendukung.
- `Poppins_600SemiBold`: Tombol, label form, subtitle tebal, badge prioritas, tab label.
- `Poppins_700Bold`: Judul layar (`headerTitle`), judul kartu, angka metrik besar, empty state title.

### Skala Ukuran Teks Mobile

| Peran | Font Size | Weight | Line Height | Contoh Penggunaan |
|---|---|---|---|---|
| **Display Metric** | 20sp - 24sp | Bold | 28sp | Angka total tugas pada hero card |
| **Screen Title** | 18sp | Bold | 24sp | Judul utama di atas layar ("Daftar Tugas", "Jadwal Belajar") |
| **Section Title** | 12sp - 14sp | Bold | 18sp | Judul seksi ("SESI BELAJAR TERJADWAL", "Analisis Beban") |
| **Card Heading** | 12sp - 14sp | Bold / SemiBold | 18sp | Nama tugas, judul agenda, menu profile |
| **Body / Input** | 12sp - 14sp | Regular | 19sp | Teks isi input field, deskripsi panduan, pesan chat |
| **Subtitle / Meta** | 9sp - 11sp | Regular | 14sp | Subtitle header ("7 tugas aktif dijadwalkan AI"), mapel & deadline |
| **Badge / Chip** | 8sp - 10sp | SemiBold | 12sp | Skor prioritas ("94 · sangat-tinggi"), durasi ("120 menit") |

> [!NOTE]
> Gunakan selalu komponen `<AppText>` dari [`src/components/ui.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/components/ui.js) yang sudah memiliki proteksi otomatis anti-font kerdil (`fontSize < 10` otomatis dinaikkan ke 10) dan auto-koreksi kontras warna teks pudar.

---

## 4. Layout, Grid, & Safe Area

1. **Struktur Layar (`Screen`):**
   - Layar dibungkus oleh komponen `<Screen>` dengan latar belakang `colors.canvas`.
   - Menggunakan `SafeAreaView` dengan `edges={["top"]}` untuk mencegah konten terpotong notch/kamera depan.
   - Konten di dalam ScrollView memiliki `paddingHorizontal: 16`, `paddingTop: 8`, dan **`paddingBottom: 120`**.
   - `paddingBottom: 120` **wajib** dipertahankan agar elemen terbawah layar tidak tertutup oleh floating bottom navigation bar.
2. **Jarak Antar-Elemen (Vertical Rhythm):**
   - Jarak standar antar-kartu atau antar-seksi adalah `gap: 16`.
   - Jarak item di dalam kartu: `gap: 10` sampai `gap: 12`.
3. **Lebar Konten & Responsivitas:**
   - Desain dioptimalkan untuk layar ponsel standar 360dp – 412dp.
   - Hindari penetapan lebar absolut (`width: 380`), utamakan `flex: 1`, `width: "100%"`, atau `maxWidth`.

---

## 5. Katalog Komponen Inti (UI Components)

Sumber kode aktif: [`src/components/ui.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/components/ui.js)

### A. Tombol (`Button`)
- **Tinggi Standar:** `minHeight: 46` (Pill radius 999).
- **Tinggi Compact:** `minHeight: 44`, `paddingHorizontal: 14`.
- **Varian:**
  - `primary`: Background `colors.primary`, teks putih.
  - `secondary`: Background `#E8F0FF`, teks `colors.primary`.
  - `outline`: Background `#FFFFFF`, border `1px #C7D8FF`, teks `colors.primary`.
  - `ghost`: Background `colors.faint`, teks `#475569`.
  - `danger`: Background `#FFF1F2`, teks `colors.danger`.
- **Loading State:** Menampilkan `ActivityIndicator` otomatis dan mendisable klik saat prop `loading={true}`.
- **Interaksi:** Memakai `Pressable` dengan efek `opacity: 0.78, transform: [{ scale: 0.985 }]`.

### B. Kartu Kontainer (`Card`)
- Background `colors.surface` (`#FFFFFF`), `borderRadius: radii.card` (16), `padding: 16`, serta shadow halus tanpa opacity container.
- Tersedia opsi `onPress` untuk kartu yang dapat diklik dengan feedback sentuhan `pressed`.

### C. Input Form (`Field`)
- Label: `Poppins_600SemiBold`, 12sp, warna `#475569`, `marginBottom: 7`.
- Input Wrap: `minHeight: 48`, `borderRadius: 16`, `borderWidth: 1`, `borderColor: colors.border`, `backgroundColor: "#F8FAFC"`, `paddingHorizontal: 14`.
- Input Text: `Poppins_400Regular`, 14sp, `colors.ink`. Placeholder: `#94A3B8`.
- Multiline: `minHeight: 90`, `textAlignVertical: "top"`.

### D. Filter Chip (`Pill`)
- Tinggi `minHeight: 44`, `borderRadius: radii.pill`.
- Status Inaktif: Background `#F1F5F9`, teks `#475569` (SemiBold 12sp).
- Status Aktif: Background `colors.primary`, teks `#FFFFFF`.

### E. Status Kosong (`EmptyState`)
- Tinggi minimum: `minHeight: 210`.
- Ikon dalam lingkaran 54x54dp berlatar `#EFF6FF` dengan warna ikon `colors.primary`.
- Judul: 16sp Bold. Subtitle: 13sp Regular `#475569` (lineHeight: 20sp, maxWidth: 260dp).
- Tombol aksi opsional di bagian bawah dengan varian compact.

### F. Indikator Pemuatan (`Loading`)
- Menampilkan `ActivityIndicator` berwarna `colors.primary` disertai label teks (default: "Memuat data...").
- Mode compact (`minHeight: 64`) untuk pemuatan inline section/tab.
- **Aturan Wajib:** Setiap layar/seksi yang melakukan fetch data wajib merender `<Loading>` saat `loading === true`, dilarang merender kontainer kosong atau langsung menampilkan `EmptyState`.

### G. Bilah Navigasi Bawah Mengambang (`BottomTabs`)
Sumber kode aktif: [`src/components/BottomTabs.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/components/BottomTabs.js)
- **Tampilan:** Mengambang (Floating Pill Bar) dengan posisi `position: 'absolute'`, `bottom: 16`, `left: 16`, `right: 16`, `height: 62`, `borderRadius: 32`, `backgroundColor: 'rgba(255,255,255,0.97)'`.
- **Daftar Tab:**
  1. `home` (Beranda, ikon `House`)
  2. `calendar` (Kalender, ikon `CalendarDays`)
  3. `tasks` (Tugas, ikon `CheckSquare`)
  4. `ai-plan` (Jadwal Belajar, ikon `Sparkles`)
  5. `profile` (Profil, ikon `UserRound`)
- **Status Tab Aktif:** Lingkaran 44x44dp berlatar `colors.primary` dengan elevasi 4, warna ikon putih (`strokeWidth: 2.5`).
- **Status Tab Inaktif:** Ikon berwarna `#52647D` (`strokeWidth: 2`).
- **Badge Tugas Mendesak:** Titik merah `#F43F5E` berdiameter 7dp dengan garis tepi putih di pojok kanan atas ikon tab Tugas.

### H. Bottom Sheet (`ModalSheet`)
Sumber kode aktif: [`src/components/ModalSheet.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/components/ModalSheet.js)
- **Backdrop Overlay:** `rgba(15, 23, 42, 0.65)` dengan animasi fade.
- **Sheet Container:** Sudut atas `borderTopLeftRadius: 30`, `borderTopRightRadius: 30`, background `#FFFFFF`, shadow elevasi 24.
- **Header:** Drag handle 40x4dp (`#CBD5E1`), judul 14sp Bold, subtitle 10sp muted, tombol tutup silang (`X`) 44x44dp bulat.
- **Animasi:** Spring physics saat membuka (`damping: 24, stiffness: 220, mass: 0.8`), slide timing 200ms saat menutup.
- **Hardware Back Button:** Terintegrasi listener Android BackHandler otomatis.

### I. Dialog Standar (`CustomAlertDialog`)
Sumber kode aktif: [`src/components/CustomAlertDialog.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/components/CustomAlertDialog.js)
- Menggantikan seluruh `Alert.alert` bawaan OS via `DialogContext.js`.
- **Card:** Lebar maksimal 340dp, `borderRadius: 16`, `paddingVertical: 22`, `paddingHorizontal: 20`, di tengah layar dengan backdrop overlay gelap.
- **Badge Ikon (52x52dp):**
  - Info: Ikon biru berlatar `#EFF6FF`.
  - Danger (Hapus/Keluar): Ikon merah berlatar `#FFF1F2`.
  - Warning: Ikon amber berlatar `#FEF3C7`.
  - Success: Ikon hijau berlatar `#ECFDF5`.
- **Aksi:** Tombol batal (`#F8FAFC`, border `#E2E8F0`, teks `#64748B`) dan tombol konfirmasi (`colors.primary` atau `colors.danger`, tinggi 42dp, radius 12dp).

### J. Floating AI Assistant Tab & Drawer (`DraggableAssistantTab` & `ChatDrawer`)
Sumber kode aktif: [`src/components/DraggableAssistantTab.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/components/DraggableAssistantTab.js) & [`src/components/ChatDrawer.js`](file:///home/naufal/Documents/my-projects/inkubasi-journey/main-arch/stoodify-apk/src/components/ChatDrawer.js)
- **Tab Mengambang Kanan:** Lebar 34dp, tinggi 124dp, dapat digeser secara vertikal (*draggable*), menampilkan teks vertikal "AI ASSISTANT" dan chevron kiri.
- **Chat Drawer:** Meluncur dari tepi kanan (lebar ~86% layar, max 390dp), memiliki status koneksi LLM, riwayat bubble obrolan (bubble AI berlatar putih dengan border, bubble siswa berlatar biru primer), tombol reset riwayat, serta penanganan keyboard Android (`KeyboardAvoidingView`).

---

## 6. Bukti Tangkapan Layar Aplikasi Nyata (Visual Evidence)

Tangkapan layar di bawah ini diambil langsung dari perangkat emulator Android aktif (`emulator-5554`, resolusi 1080 × 2400 px, 480 dpi / 360 × 800 dp) yang menjalankan build native Stoodify:

| Layar / Modal | Screenshot Perangkat | Keterangan & Karakteristik Desain |
|---|---|---|
| **Beranda** (`HomeScreen`) | [screen-home.png](screenshots/screen-home.png) | Top bar salam & streak flame, Hero Card gradasi biru dengan 2 metrik utama & tombol aksi ganda, 3 tile Quick Actions, dan seksi agenda tugas. |
| **Kalender** (`CalendarScreen`) | [screen-calendar.png](screenshots/screen-calendar.png) | Header dengan tombol "Kelola Mapel", selektor mode pill, horizontal 7-day selector (Sen-Ming), dan agenda terpadu sekolah + sesi belajar AI. |
| **Tugas** (`TasksScreen`) | [screen-tasks.png](screenshots/screen-tasks.png) | Search bar input, filter status (Semua, Prioritas, Tuntas), filter mata pelajaran horizontal, dan daftar kartu tugas dengan skor prioritas warna-warni. |
| **Jadwal Belajar** (`AIPlanScreen`) | [screen-aiplan.png](screenshots/screen-aiplan.png) | Banner konsultasi AI, analisis beban belajar mingguan, kartu penjadwalan adaptif ("Susun Ulang"), dan daftar sesi belajar rekomendasi. |
| **Profil & Akun** (`ProfileScreen`) | [screen-profile.png](screenshots/screen-profile.png) | Kartu identitas siswa, banner upgrade Stoodify Pro, 3 kartu metrik statistik (Streak, Fokus, Tepat Waktu), dan menu navigasi akun. |
| **Modal Tambah Tugas** (`AddTaskModal`) | [screen-add-task.png](screenshots/screen-add-task.png) | Bottom sheet berlatar putih (radius atas 30dp), form input nama tugas, selektor mapel, pill preset deadline (Hari Ini, Besok, Lusa), dan rating kesulitan. |
| **Modal Detail Tugas** (`TaskDetailModal`) | [screen-task-detail.png](screenshots/screen-task-detail.png) | Bottom sheet detail tugas, skor prioritas besar (misal 94/100), checklist subtugas, progres bar, tombol "Tandai Selesai", "Mode Fokus", dan "Hapus Tugas". |
| **Modal Focus Timer** (`FocusTimerModal`) | [screen-focus-timer.png](screenshots/screen-focus-timer.png) | Bottom sheet pengatur waktu fokus (Pomodoro style), preset durasi (15, 25, 45, 60 menit), status audio white noise, dan tombol mulai belajar. |
| **Drawer Asisten AI** (`ChatDrawer`) | [screen-chat-drawer.png](screenshots/screen-chat-drawer.png) | Side drawer geser dari kanan, indikator status model LLM, riwayat percakapan interaktif, chip saran instruksi belajar cepat, dan kolom kirim pesan. |
| **Dialog Konfirmasi** (`CustomAlertDialog`) | [screen-custom-dialog.png](screenshots/screen-custom-dialog.png) | Dialog seragam pengganti alert OS, kartu putih di tengah layar dengan dark overlay 65%, ikon bahaya berlatar merah lembut, tombol "Batal" dan "Keluar". |

---

## 7. Panduan Do & Don't untuk Pengembang & AI Agent

### DO (Wajib Dilakukan)
1. **Gunakan Selalu `<AppText>`:** Jangan pernah memakai `<Text>` bawaan tanpa pembungkus atau meletakkan teks mentah di dalam `<View>`.
2. **Gunakan `<Pressable>`:** Gunakan `<Pressable>` dengan style helper `pressed && styles.pressed` untuk feedback sentuhan yang konsisten di semua tombol dan kartu interaktif.
3. **Pertahankan `paddingBottom: 120`:** Pastikan `Screen` atau `ScrollView` pada layar utama memiliki padding bawah minimal 120dp agar tidak terhalang oleh `BottomTabs`.
4. **Terapkan Spin Loading State:** Saat memuat data dari API, tampilkan `<Loading>` dengan teks kontekstual. Jangan biarkan layar kosong melompong.
5. **Gunakan `CustomAlertDialog`:** Panggil `showDialog` atau `showMessage` dari `useDialog()` untuk konfirmasi dan notifikasi, dilarang memakai `Alert.alert`.
6. **Dukung Android Hardware Back Button:** Tangani penutupan modal, drawer, atau pengembalian tab ke Beranda saat tombol fisik kembali ditekan.

### DON'T (Dilarang Keras)
1. **DILARANG Menerapkan Opacity Container pada Bayangan:** Jangan pernah menulis `opacity: 0.08` pada style `View` kartu. Gunakan token `shadow` murni.
2. **DILARANG Memakai Warna Hex Hardcoded Sembarangan:** Selalu gunakan token dari `colors` (`colors.primary`, `colors.canvas`, `colors.ink`, dll.).
3. **DILARANG Memakai Font Bawaan Sistem:** Seluruh tampilan harus menggunakan jenis font Poppins yang sudah terdaftar.
4. **DILARANG Mengubah Struktur Floating Tab Bar:** Bentuk floating pill bar adalah identitas utama Stoodify Mobile. Jangan mengubahnya menjadi bottom bar kotak konvensional yang menempel di dasar layar.
5. **DILARANG Menghilangkan Area Notch/Safe Area:** Jangan menghapus `SafeAreaView` atau mengabaikan status bar Android.
6. **DILARANG Menambahkan Library Baru Tanpa Verifikasi `package.json`:** Dilarang mengimpor library luar yang belum terpasang nyata di proyek.

---

## 8. Checklist Verifikasi UI (Pre-Flight Design Checklist)

Sebelum menandai pekerjaan UI selesai, jalankan checklist berikut:
- [ ] Tampilan diuji pada resolusi 360dp - 412dp tanpa horizontal overflow atau teks terpotong.
- [ ] Seluruh kartu dan teks memiliki kontras tajam (minimal 4.5:1 terhadap background).
- [ ] Tidak ada kartu atau tombol yang tembus pandang atau buram karena salah token opacity.
- [ ] Jarak bawah konten aman dari floating tab bar (tidak ada tombol yang tenggelam di balik tab bar).
- [ ] Status loading berputar (spin indicator) muncul saat data diambil secara asinkron.
- [ ] Tombol fisik kembali (Android back button) menutup modal/drawer dengan mulus.
- [ ] Dialog konfirmasi menggunakan Stoodify Design System Dialog, bukan popup bawaan OS.
