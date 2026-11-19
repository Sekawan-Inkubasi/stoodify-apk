export const ASSISTANT_PROMPTS = [
  "Susun prioritas",
  "Ringkasan beban belajar",
  "Tips mode fokus 45 menit",
  "Prediksi materi",
];

export function generateAssistantReply(text, { user, tasks = [], sessions = [] }) {
  const lower = String(text || "").toLowerCase().trim();
  const firstName = user?.name?.split(" ")[0] || "Siswa";

  if (
    lower.includes("susun") ||
    lower.includes("jadwal") ||
    lower.includes("prioritas")
  ) {
    return {
      reply: sessions.length
        ? `Ada ${sessions.length} sesi belajar yang tersimpan. Kamu dapat meminta penyusunan ulang prioritas belajar adaptif.`
        : "Belum ada sesi tugas aktif. Tambahkan tugas terlebih dahulu agar jadwal belajar dapat disusun.",
      action: "reschedule",
    };
  }

  if (
    lower.includes("ringkasan") ||
    lower.includes("beban") ||
    lower.includes("tugas")
  ) {
    const activeTasks = tasks.filter((task) => task.status !== "selesai");
    return {
      reply: `Saat ini ada ${activeTasks.length} tugas aktif dan ${sessions.length} sesi belajar. Buka tab Tugas untuk melihat detail beban belajarmu.`,
      action: null,
    };
  }

  if (
    lower.includes("fokus") ||
    lower.includes("timer") ||
    lower.includes("tips")
  ) {
    return {
      reply:
        "Coba jauhkan distraksi, siapkan air minum, lalu fokus belajar selama 25 atau 45 menit. Kamu bisa mulai timer Zen Focus sekarang.",
      action: "focus",
    };
  }

  if (lower.includes("prediksi")) {
    return {
      reply:
        "Prediksi materi kurikulum tersedia melalui layanan AI Stoodify. Buka tombol Prediksi Materi dari Beranda untuk menganalisis topik silabus berikutnya.",
      action: null,
    };
  }

  const firstActive = tasks.find((task) => task.status !== "selesai");
  if (firstActive) {
    return {
      reply: `Halo ${firstName}! Saya siap membantumu membahas tugas “${firstActive.title}” atau merencanakan jadwal belajar hari ini.`,
      action: null,
    };
  }

  return {
    reply: `Halo ${firstName}! Saya siap membantumu merencanakan jadwal dan tips belajar. Tambahkan tugas agar saran belajar lebih akurat.`,
    action: null,
  };
}
