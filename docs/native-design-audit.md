# Audit Desain Aplikasi Native Stoodify

**Tanggal audit:** 7 November 2026  
**Cakupan:** layar pembuka/autentikasi, Beranda, Tugas, Kalender, Rencana AI, Profil, drawer AI, dan modal tambah tugas.  
**Referensi:** `stoodify-mobile` yang dibuka di `localhost:5173`; screenshot dibuat ulang untuk audit ini.  
**Perangkat:** Android fisik itel P671L, resolusi screenshot 720 × 1600 px (sekitar 360 × 800 dp).  
**Kondisi data:** akun uji sudah masuk; tidak ada tugas, mata pelajaran, jadwal, atau sesi belajar. Nilai kosong adalah data akun saat audit, bukan data contoh. Identitas pada screenshot lampiran disamarkan.

## Ringkasan

**Status desain: belum layak dianggap lolos target kemiripan maupun keterbacaan.** Struktur dan alur lima tab sudah mengikuti produk web, dan layar native memakai susunan komponen yang sesuai untuk ponsel. Namun, satu kesalahan token global membuat hampir semua `Card` dan `EmptyState` merender seluruh isi dengan opacity 8%. Akibatnya teks, latar kartu, ikon, dan tombol di dalamnya nyaris menyatu dengan latar layar. Ini termasuk tombol **Tambah Tugas Pertama** yang dikeluhkan pengguna.

Temuan tersebut teramati langsung pada Beranda, Kalender, Tugas, Rencana AI, dan Profil di perangkat fisik. Contoh komposit warna menghasilkan kontras sekitar **1,17:1 untuk teks** dan **1,11:1 untuk tombol biru** terhadap canvas, jauh di bawah kebutuhan keterbacaan. Perlu memperbaiki komponen bersama sebelum menilai atau menyetel detail visual halaman satu per satu.

Belum ada skor kemiripan 90% yang dapat dipertanggungjawabkan. Referensi web berukuran 1280 × 640 px dengan kolom aplikasi sekitar 432 px, sedangkan perangkat native 360 × 800 dp. Perbandingan saat ini bersifat visual dan berbasis elemen, bukan pixel-diff pada viewport dan data yang disamakan.

## Bukti screenshot

Screenshot native diambil melalui ADB dari HP. Screenshot web diambil melalui agent-browser dari `localhost:5173` dengan akun dan keadaan kosong yang sama. Gelembung kontrol abu-abu pada sebagian screenshot native adalah overlay Expo Development Build; itu tidak termasuk desain aplikasi. Identitas pengguna pada gambar yang disimpan di repo sudah disamarkan.

| Halaman | Referensi web | Aplikasi native |
|---|---|---|
| Pembuka | [web-welcome.png](native-design-audit/screenshots/web-welcome.png) | [native-welcome.png](native-design-audit/screenshots/native-welcome.png) |
| Beranda | [web-home.png](native-design-audit/screenshots/web-home.png) | [native-home.png](native-design-audit/screenshots/native-home.png) |
| Kalender | [web-calendar.png](native-design-audit/screenshots/web-calendar.png) | [native-calendar.png](native-design-audit/screenshots/native-calendar.png) |
| Tugas | [web-tasks.png](native-design-audit/screenshots/web-tasks.png) | [native-tasks.png](native-design-audit/screenshots/native-tasks.png) |
| Rencana AI | [web-ai-plan.png](native-design-audit/screenshots/web-ai-plan.png) | [native-ai-plan.png](native-design-audit/screenshots/native-ai-plan.png) |
| Profil | [web-profile.png](native-design-audit/screenshots/web-profile.png) | [native-profile.png](native-design-audit/screenshots/native-profile.png) |
| Asisten AI | [web-ai-assistant.png](native-design-audit/screenshots/web-ai-assistant.png) | [native-ai-assistant.png](native-design-audit/screenshots/native-ai-assistant.png) |
| Tambah tugas | — | [native-add-task.png](native-design-audit/screenshots/native-add-task.png) |

## Temuan berprioritas

### P0 — Kartu dan tombol di dalamnya hampir tidak terbaca

**Bukti:** [Beranda native](native-design-audit/screenshots/native-home.png), [Kalender native](native-design-audit/screenshots/native-calendar.png), [Tugas native](native-design-audit/screenshots/native-tasks.png), [Rencana AI native](native-design-audit/screenshots/native-ai-plan.png), dan [Profil native](native-design-audit/screenshots/native-profile.png).

Di [theme.js](../src/constants/theme.js#L7), objek `shadow` memuat `opacity: 0.08` sebagai nilai opasitas bayangan. Di [ui.js](../src/components/ui.js#L73) dan [ui.js](../src/components/ui.js#L79), seluruh objek itu disebarkan langsung ke style `View` pada `Card` dan `EmptyState`. Pada React Native, `opacity` berlaku pada seluruh subtree, bukan hanya bayangan. Seluruh konten kartu—termasuk teks, tombol, dan ikon—akhirnya dirender pada opacity 8%.

Inilah penyebab langsung tombol pada kartu bawah terlihat transparan. Komponen ini dipakai di semua tab dan beberapa modal, sehingga dampaknya menyebar ke seluruh aplikasi.

**Perbaikan:** pisahkan token bayangan dari style `View`. Petakan token ke properti React Native yang benar (`shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset`, `elevation`) tanpa menerapkan `opacity` ke container. Ambil ulang screenshot kelima tab dan modal setelah perubahan.

### P1 — Ukuran teks dan kontras belum cukup nyaman untuk pemakaian siswa

- Banyak label pendukung memakai ukuran **8–10 sp**; label kecil ini sulit dibaca tanpa mendekatkan layar. Contohnya `CalendarScreen`, `HomeScreen`, `AIPlanScreen`, `ProfileScreen`, `ChatDrawer`, dan [ui.js](../src/components/ui.js#L74).
- Warna muted `#64748B` terhadap canvas `#EAF1FC` memiliki rasio kontras sekitar **4,19:1**, sedikit di bawah 4,5:1 untuk teks biasa. `#94A3B8` terhadap canvas hanya sekitar **2,26:1**.
- Tombol kedua pada kartu hero Beranda memakai tulisan biru di atas fill putih transparan yang berada di atas gradasi biru. Kombinasi ini lebih sulit dibaca daripada tombol utama putih.

**Perbaikan:** tetapkan skala tipografi mobile dengan teks isi normal 14–16 sp, keterangan penting minimal 12 sp, judul berdasarkan hierarki layar, dan warna teks sekunder yang mencapai kontras 4,5:1. Pada hero, gunakan tulisan putih dengan permukaan yang cukup pekat atau permukaan terang dengan teks biru yang lolos pemeriksaan kontras.

### P1 — Banyak kontrol lebih kecil dari area sentuh yang nyaman

`Button` compact berukuran minimum 38 dp, chip `Pill` sekitar 26–30 dp, aksi header 38 dp, tombol tutup modal 34 dp, serta tombol kamera/mikrofon/kirim pada drawer AI 34–36 dp. Ukuran ini menyulitkan siswa memilih target dengan ibu jari dan dapat memicu salah tekan.

**Perbaikan:** berikan area sentuh minimal 44 × 44 dp untuk aksi, termasuk tombol ikon. Jika ukuran visual chip tetap ringkas, tambahkan hit area dan jarak yang cukup tanpa membuat layout berdesakan.

### P1 — Tab AI melayang menutupi konten

Tab vertikal **AI ASSISTANT** diposisikan menempel pada sisi kanan hampir semua layar ([App.js](../App.js#L97)). Pada layar kecil, tab ini berada di atas area konten dan menutupi sebagian teks atau aksi di sisi kanan. Screenshot native juga memperlihatkan kontrol Expo di posisi kanan atas menutupi area tombol notifikasi, sehingga pengujian development tidak mencerminkan tampilan produksi secara bersih.

**Perbaikan:** pertahankan akses cepat asisten tetapi sediakan ruang untuknya, misalnya sebagai tombol yang dapat diciutkan, FAB dengan posisi yang tidak menimpa aksi halaman, atau entry point dari kartu AI. Untuk review visual, sembunyikan overlay Expo sebelum mengambil screenshot final.

### P1 — Navbar bawah menampilkan label aktif dan bentuk aktif belum mengikuti referensi

**Bukti:** [Beranda web](native-design-audit/screenshots/web-home.png), [Beranda native](native-design-audit/screenshots/native-home.png), dan screenshot native pada tab Kalender/Tugas/Rencana AI/Profil.

Referensi web menampilkan ikon navigasi; tab aktif dibedakan dengan bidang biru membulat di sekitar ikon tanpa label teks di sampingnya. Navbar native menambahkan label **Beranda**, **Kalender**, dan seterusnya saat tab aktif. Bentuk bidang aktif juga terlihat lebih kotak daripada bentuk bundar di referensi. Ini membuat pola navigasi lebih ramai dan mengubah identitas visual yang sudah familier.

**Perbaikan:** hilangkan label visual saat tab dipilih dan gunakan bidang seleksi berbentuk lingkaran di sekitar ikon. Pertahankan nama tab melalui `accessibilityLabel`, `accessibilityState`, dan target sentuh yang cukup besar, sehingga layar tetap dapat dipahami pembaca layar tanpa menambah teks visual.

## Audit per halaman

### Pembuka dan autentikasi

Logo, aksen biru, dan dua pilihan masuk/daftar pada native sudah mudah dikenali. Layar native menambahkan judul **Belajar lebih terarah** dan paragraf panjang, sedangkan referensi web menekankan tagline singkat di bawah logo. Hierarki dan copy belum sama; tombol native juga lebih besar. Perbedaan ini bukan penghambat keterbacaan, tetapi mengurangi kemiripan.

**Rencana:** samakan urutan pesan dan copy utama dengan web, lalu pertahankan ukuran tombol native yang nyaman disentuh. Audit lanjutan untuk layar form login/daftar perlu mengambil screenshot khusus setelah pengguna berpindah dari layar pembuka.

### Beranda

Urutan salam, ringkasan tugas, aksi cepat, insight, agenda, dan tugas terdekat sudah mengikuti referensi. Kartu metrik dan shortcut mudah ditemukan. Namun, tombol **Tanya AI Asisten** kurang kontras, sedangkan Insight AI, state agenda kosong, dan CTA di dalam state tersebut hampir tidak terlihat karena temuan P0. Konten prioritas berikutnya juga jatuh di bawah area navigasi tetap pada posisi awal, jadi perlu memastikan pengguna tetap bisa menggulir sampai seluruh CTA terlihat.

**Rencana:** benahi P0, pastikan CTA pada state kosong terlihat sebelum maupun sesudah scroll, lalu cocokkan kembali proporsi kartu dan jarak vertikal dengan referensi web.

### Kalender

Pemilih mode dan hari terpilih terlihat jelas. Kartu daftar pelajaran, teks kosong, tombol tambah jam mapel, dan area sesi fokus teredup oleh P0. Isi native membagi halaman menjadi pelajaran hari ini, sesi fokus hari ini, dan rekomendasi; referensi web menampilkan state jadwal kosong dan panel rekomendasi AI dengan susunan yang berbeda.

**Rencana:** setelah keterbacaan pulih, samakan fokus informasi dan urutan state kosong dengan referensi; pertahankan pemilihan hari dan aksi tambah jadwal yang terasa native.

### Tugas

Judul, kolom pencarian, filter status, dan filter mapel terlihat. Kartu state kosong dan tombol tambah tugas di dalamnya nyaris hilang karena P0. Chip filter juga lebih rapat dan kecil dibanding target sentuh yang disarankan. Dengan banyak mata pelajaran, baris filter perlu diuji agar dapat digulir atau membungkus tanpa memotong kontrol.

**Rencana:** pulihkan kartu dan CTA, naikkan area sentuh chip, dan uji layout dengan beberapa mata pelajaran serta task aktif agar layar tidak hanya terlihat baik dalam keadaan kosong.

### Rencana AI

CTA rescheduling utama terlihat jelas. Kartu **Stoodify AI Assistant Aktif** dan **Beban Belajar Aktif** pudar karena P0. Referensi web memiliki panel analisis yang lebih informatif: status keseimbangan, jumlah sesi, tugas prioritas, rata-rata beban, dan rekomendasi algoritma. Versi native saat ini mereduksi isi menjadi dua ringkasan dan daftar sesi. Subtitle **Smart Scheduler & Workload Balancer** serta label **Adaptive Rescheduling** juga menggunakan istilah Inggris yang tidak sejelas bahasa Indonesia bagi semua siswa.

**Rencana:** pulihkan keterbacaan, kembalikan informasi analisis dan rekomendasi yang benar-benar bersumber dari data/backend, lalu gunakan istilah Indonesia dengan penjelasan singkat. Jangan menampilkan angka yang tidak tersedia.

### Profil dan akun

Kartu Pro gelap terlihat paling jelas, sementara kartu identitas, statistik, dan daftar pengaturan nyaris tak terlihat karena P0. Struktur native menggabungkan identitas dan tiga statistik dalam satu kartu lalu menempatkan Pro terpisah; referensi web memisahkan identitas/Pro dan menyajikan statistik sebagai tiga kartu ringkas. Perbedaan hirarki ini masih terasa setelah bug opacity diperbaiki.

**Rencana:** pulihkan kartu bersama dahulu, kemudian susun ulang area profil dan statistik mengikuti hierarki referensi tanpa mengurangi kemudahan akses avatar, mata pelajaran, preferensi, bantuan, dan keluar.

### Asisten AI dan modal tambah tugas

Drawer AI native memakai lembar hampir penuh layar, sesuai konteks Android. Screenshot memperlihatkan header, pesan pembuka, chip prompt, dan dock input. Dibanding referensi web, header biru, ringkasan konteks, dan pengelompokan prompt belum terbawa. Teks disclaimer di bagian bawah terlalu kecil dan berada dekat area navigasi sistem. Tombol mikrofon berlabel ikon mic tetapi langsung mengirim prompt preset; ini memberi kesan bahwa suara benar-benar dikenali.

Modal tambah tugas memiliki field dan pilihan yang cukup lengkap. Saat tidak ada mata pelajaran, area pilihan kosong tanpa keterangan; pengguna hanya melihat tautan **Kelola**. Deadline ditulis sebagai teks `YYYY-MM-DD`, bukan pemilih tanggal Android. Tombol simpan berada setelah konten yang perlu digulir dan bagian bawah sheet sangat dekat dengan navigasi sistem.

**Rencana:** tambahkan padding safe area bawah pada drawer/sheet, perjelas keadaan tanpa mapel, gunakan date picker native, samakan header/konteks asisten secara proporsional, dan ubah mic menjadi aksi yang jujur (fitur suara nyata atau label yang menjelaskan prompt contoh).

## Rencana perbaikan berurutan

1. **P0 — Perbaiki token shadow dan komponen bersama.** Hilangkan kebocoran `opacity` ke `Card`/`EmptyState`; pastikan bayangan Android/iOS memakai properti yang sesuai. Verifikasi semua kartu, teks, dan tombol di lima tab serta modal.
2. **P1 — Bangun ulang fondasi keterbacaan.** Terapkan skala type mobile, warna sekunder dengan kontras memadai, tombol hero yang terbaca, dan target sentuh minimal 44 dp. Periksa pembesaran font dan layar sempit.
3. **P1 — Samakan navbar bawah dengan pola web.** Hapus label visual tab aktif, ubah bidang aktif menjadi bundar, lalu cek keterbacaan nama tab melalui aksesibilitas dan target sentuh.
4. **P1 — Hilangkan tabrakan elemen.** Atur ulang tab AI melayang, safe area modal, CTA yang berada dekat navigasi sistem, dan baris chip yang berpotensi overflow.
5. **P1/P2 — Tutup kesenjangan konten per halaman.** Prioritaskan panel analisis Rencana AI, hierarki Profil, state kosong Kalender/Tugas/Beranda, kemudian copy layar pembuka.
6. **P2 — Poles interaksi native.** Tambahkan date picker, state tanpa mata pelajaran, hit area tombol ikon, serta perilaku asisten yang tidak menyamarkan prompt preset sebagai pengenalan suara.
7. **Verifikasi visual ulang di HP.** Ambil ulang screenshot pada resolusi yang sama dan state data yang sama; bandingkan setiap tab, modal, ukuran teks default, dan pembesaran font. Catat issue tersisa sebelum menilai target 90%.

## Kriteria penerimaan untuk putaran perbaikan

- Semua teks dan tombol pada `Card`/`EmptyState` tampil dengan opacity normal; tidak ada style shadow yang mengubah opacity konten.
- Navbar tidak menampilkan label visual pada tab aktif; ikon aktif berada di dalam bidang bundar seperti referensi, sementara nama tab tetap tersedia untuk teknologi bantu.
- Teks biasa memiliki kontras minimal 4,5:1 dan teks besar/kontrol memenuhi standar kontras yang sesuai.
- Label utama dan keterangan penting nyaman dibaca pada 360 dp tanpa zoom; kontrol utama dapat disentuh dengan area minimal 44 × 44 dp.
- FAB/tab AI, modal, input, tombol simpan, dan navigasi sistem tidak saling menutupi.
- Setiap halaman memiliki struktur, copy, dan state kosong yang sejalan dengan referensi; nilai tetap berasal dari endpoint dan tidak diganti data contoh.
- Screenshot native dan web menggunakan state serta viewport yang dinormalisasi sebelum memberi nilai kemiripan visual.

## Batas audit

Audit visual ini menggunakan satu perangkat Android fisik dan akun dengan data kosong. Belum dilakukan uji pada layar kecil tambahan, tablet, pembesaran font sistem, mode gelap, atau akun dengan banyak tugas/mapel. Modal tambah tugas dan drawer AI diperiksa secara visual; alur submit form dan seluruh modal lain belum menjadi uji usability penuh. Screenshot tersimpan sebagai bukti; perubahan UI belum dilakukan dalam putaran audit ini.
