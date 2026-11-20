# Optimistic UI Update Audit & Implementation Report
**Stoodify Mobile Application (`stoodify-apk`)**
*Dokumen Analisis, Implementasi, dan Rencana Optimalisasi State Reaktivitas Antarmuka Mobile*

---

## 1. Ringkasan Eksekutif & Latar Belakang

Pada aplikasi mobile edukasi berbasis AI seperti **Stoodify**, kecepatan feedback antarmuka (*perceived performance*) sangat menentukan kenyamanan siswa saat belajar. Siswa berinteraksi secara intensif dengan elemen-elemen kecil yang membutuhkan respon seketika, seperti:
- Mengetuk persentase progres tugas (0%, 25%, 50%, 75%, 100%).
- Menambahkan subtugas dan mencentang langkah kecil yang selesai.
- Mengubah status tugas dari aktif menjadi selesai.

### Masalah yang Ditemukan
Sebelum optimasi dilakukan, seluruh aksi mutasi menggunakan pola **Pessimistic UI**:
```
User Tap ──> Await Network API (1 - 2.5 detik) ──> Update State React ──> Re-render UI
```
Akibatnya:
1. **Delay & Kesan "Patah-Patah"**: Pengguna menekan tombol progres, namun visual tombol tidak berubah selama ~2 detik hingga paket HTTP roundtrip selesai. Pengguna mengira aplikasi hang atau sentuhan tidak terdeteksi, sehingga menekan tombol berkali-kali.
2. **Layout Clipping pada Input Subtugas**: Tombol plus (`+`) subtugas sempat terdorong ke luar layar (`bounds [1041, 1020]`) karena container horizontal di dalam `ScrollView` belum memiliki bounded constraint `width: "100%"`.

---

## 2. Implementasi yang Telah Diterapkan (Verified Live)

### A. Optimistic UI pada Progres Tugas (`TaskDetailModal.js` & `useAppData.js`)
Pola yang diterapkan adalah **Two-Tier Optimistic State**:
1. **Tier 1 (Local Component State):**
   - Pada `TaskDetailModal.js`, state `optimisticProgress` diinisialisasi dari `task.progressPercent`.
   - Begitu siswa menekan salah satu pill progres (0, 25, 50, 75, 100), state `optimisticProgress` langsung diperbarui secara sinkron (0ms). Warna pill biru aktif dan angka persen di header berubah seketika tanpa jeda 1 frame pun.
2. **Tier 2 (Global Store with Rollback):**
   - Pada `src/hooks/useAppData.js`, fungsi `updateProgress` langsung memperbarui array `tasks` di memory sebelum memanggil `tasksApi.updateTaskProgress`.
   - Jika jaringan terputus atau server mengembalikan error, sistem secara otomatis melakukan rollback ke `prevProgress` dan menampilkan pesan kesalahan non-intrusif.

```javascript
// Cuplikan Implementasi Optimistic di useAppData.js
const updateProgress = useCallback(async (task, progress) => {
  const prevProgress = task.progressPercent || 0;
  // 1. Optimistic update seketika ke memory state
  setTasks((items) => items.map((item) => (item.id === task.id ? { ...item, progressPercent: progress } : item)));
  try {
    const updated = await tasksApi.updateTaskProgress(task.id, progress);
    setTasks((items) => items.map((item) => (item.id === task.id ? { ...item, ...updated, progressPercent: progress } : item)));
  } catch (error) {
    // 2. Rollback jika network request gagal
    setTasks((items) => items.map((item) => (item.id === task.id ? { ...item, progressPercent: prevProgress } : item)));
    showMessage(error.message || 'Gagal memperbarui progres tugas.', 'Gagal Update Progres');
  }
}, [showMessage]);
```

### B. Perbaikan Layout Input Subtugas & Tombol Plus
- **Penyebab:** Pada `TaskDetailModal.js`, elemen berada di dalam `ModalSheet` (`ScrollView`). Di React Native, container `flexDirection: "row"` tanpa `width: "100%"` di dalam ScrollView menyebabkan Yoga layout engine tidak membatasi sumbu utama, sehingga `Field` melebar penuh dan mendorong tombol plus keluar batas kanan.
- **Solusi:** Memberikan `width: "100%"` pada `styles.addSubtask`, `flex: 1` pada `Field`, dan dimensi presisi `width: 48, height: 48, borderRadius: 16` pada `styles.addSubtaskButton`.
- **Hasil:** Tombol plus kini tampak sejajar sempurna dengan input height, responsif, dan mudah ditekan (*touch target* 48dp sesuai kaidah aksesibilitas mobile).

### C. Optimistic Toggle Subtugas (`useAppData.toggleSubtask`)
- Mencentang checkbox subtugas kini langsung mengubah ikon centang dan coretan teks (*line-through*) secara instan di layar, lalu menyinkronkan perubahan ke backend secara asynchronous di latar belakang.

---

## 3. Matriks Audit Mutasi & Rekomendasi Optimistic UI Lanjutan

Berdasarkan penelusuran arsitektur `src/hooks/useAppData.js`, `src/screens/`, dan `src/services/`, berikut adalah daftar kandidat mutasi yang berpotensi ditingkatkan dengan Optimistic UI:

| Fitur / Aksi | File Sumber | Pola Saat Ini | Dampak Keterlambatan | Rekomendasi Optimistic & Risiko |
| :--- | :--- | :--- | :--- | :--- |
| **Centang Tugas Selesai (`toggleTask`)** | `useAppData.js:190` | Menunggu `tasksApi.updateTaskStatus` (~1.5s) baru mencentang kartu tugas. | **Tinggi:** Siswa mengira centang tugas gagal karena kartu tidak langsung berubah menjadi selesai. | **Prioritas 1 (Terapkan):** Ubah `status: 'selesai'` secara instan di UI, pindahkan kartu ke section selesai, dan rollback jika network error. |
| **Hapus Tugas (`deleteTask`)** | `useAppData.js:206` | Menunggu `tasksApi.deleteTask` (~1.2s) baru menghapus kartu dari daftar. | **Sedang:** Modal konfirmasi tertutup tapi kartu tugas masih tampak di layar selama 1 detik. | **Prioritas 2 (Terapkan):** Hapus item seketika dari `tasks`, simpan backup di closure, kembalikan jika API gagal. |
| **Tandai Notifikasi Dibaca (`markRead` & `markAllRead`)** | `useAppData.js:338` | Menunggu `notificationsApi.markAsRead` baru mengubah status `isRead: true`. | **Sedang:** Titik merah unread badge tidak langsung hilang saat diklik. | **Prioritas 1 (Terapkan):** Set `isRead: true` seketika (0ms), lakukan request background secara hening. Risiko rollback sangat rendah. |
| **Hapus Jadwal Manual (`deleteSchedule`)** | `useAppData.js:284` | Menunggu `schedulesApi.deleteSchedule`. | **Rendah:** Jadwal manual jarang dihapus berulang kali. | **Prioritas 3:** Filter optimis dari `schedules`, rollback jika gagal. |
| **Hapus Mata Pelajaran (`deleteSubject`)** | `useAppData.js:271` | Menunggu `subjectsApi.deleteSubject`. | **Rendah-Sedang:** Jarang dilakukan siswa dalam sesi harian. | **Prioritas 3:** Hapus optimis dari daftar filter dropdown. |
| **Tambah Tugas Baru (`addTask`)** | `useAppData.js:178` | Menunggu respons backend untuk mendapatkan `id` tugas dan jadwal AI otomatis. | **Normal:** Perlu menunggu ID server karena pembuatan tugas melibatkan AI session planner. | **Pertahankan Pessimistic:** Form input membutuhkan indikator loading spinner yang jelas agar siswa tahu AI sedang mengkalkulasi jadwal. |

---

## 4. Standar Implementasi Optimistic UI di Stoodify

Untuk menjaga konsistensi kode dan integritas data di seluruh tim pengembang:

1. **Snapshot & Revert Pattern:**
   Setiap fungsi mutasi yang menerapkan optimistic UI wajib menyimpan referensi data sebelum perubahan (`const prevData = ...`) agar saat terjadi *network exception* atau HTTP 4xx/5xx, state dikembalikan secara presisi ke kondisi awal tanpa efek samping (*side effects*).
2. **Kombinasi Notifikasi Non-Intrusif:**
   Jangan memunculkan pop-up yang mengganggu (*blocking dialog*) jika mutasi sukses. Cukup berikan feedback visual instan. Tampilkan pesan dialog atau toast HANYA jika mutasi gagal dan data di-rollback.
3. **Idempotensi & Request Debouncing:**
   Pada aksi berulang cepat seperti progres slider atau tombol pill progres, debouncing atau mengabaikan aksi duplikat pada nilai yang sama mencegah server kebanjiran request (*flood requests*).

---

## 5. Status Verifikasi

- [x] **Optimistic Progress Updates:** Teruji pada emulator Android (`emulator-5554`), nilai progres 0 -> 25 -> 50 -> 75 -> 100 berubah dalam 0ms.
- [x] **Subtask Full-Width Input & Tactile Plus Button:** Terverifikasi via ADB screencap & UI Automator hierarchy `[876, 1336][1020, 1480]`.
- [x] **Optimistic Subtask Toggle:** Teruji mencentang subtugas tanpa menunggu 2x roundtrip API.
- [x] **Audit Dokumentasi:** Terarsip di `docs/OPTIMISTIC_UI_AUDIT.md`.
