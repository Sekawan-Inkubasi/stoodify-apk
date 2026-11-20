import { apiPost } from "./apiClient";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { isDeviceOnline } from "../hooks/useNetworkStatus";

const DIRECT_AI_URL =
  process.env.EXPO_PUBLIC_AI_DIRECT_URL || "http://10.0.2.2:8000/chat";
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_KEY || "";

export const ASSISTANT_PROMPTS = [
  "Susun prioritas",
  "Ringkasan beban belajar",
  "Tips mode fokus 45 menit",
  "Prediksi materi",
];

export async function sendChatMessage(
  message,
  { history = [], user, tasks = [], sessions = [] }
) {
  const trimmed = String(message || "").trim();
  if (!trimmed) {
    return { reply: "Ada yang bisa saya bantu terkait belajarmu?", action: null };
  }

  // Jika perangkat sedang offline, langsung gunakan aturan heuristik lokal (tanpa akses AI backend)
  if (!isDeviceOnline()) {
    const offlineReply = generateAssistantReply(trimmed, { user, tasks, sessions });
    return {
      ...offlineReply,
      source: "offline_rules",
    };
  }

  const payload = {
    message: trimmed,
    history: (history || []).slice(-6).map((item) => ({
      role: item.sender === "user" ? "user" : "assistant",
      content: String(item.text || "").trim(),
    })),
    context: {
      student_name: user?.name,
      grade: user?.grade,
      school: user?.school,
      active_tasks: (tasks || [])
        .filter((t) => t && t.status !== "selesai")
        .slice(0, 5)
        .map((t) => ({ id: t.id, title: t.title, deadline: t.deadline })),
      sessions_count: (sessions || []).length,
    },
  };

  try {
    // 1. Jalur utama: Backend Gateway (/api/ai/chat)
    const res = await apiPost(ENDPOINTS.AI_CHAT, payload);
    const data = res?.data;
    if (data?.reply) {
      return {
        reply: data.reply,
        action:
          data.action === "reschedule" || data.action === "focus"
            ? data.action
            : null,
        source: data.source || "llm",
      };
    }
  } catch (backendErr) {
    console.warn(
      "[aiChatService] Backend gateway belum tersedia, mencoba direct AI engine:",
      backendErr?.message || backendErr
    );

    // 2. Jalur sekunder: Direct ke Stoodify AI Engine (FastAPI port 8000)
    try {
      const directController = new AbortController();
      const directTimeout = setTimeout(() => directController.abort(), 12000);
      const headers = {
        "Content-Type": "application/json",
      };
      if (AI_API_KEY) {
        headers.Authorization = `Bearer ${AI_API_KEY}`;
      }

      const directRes = await fetch(DIRECT_AI_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: directController.signal,
      });
      clearTimeout(directTimeout);

      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData?.reply) {
          return {
            reply: directData.reply,
            action:
              directData.action === "reschedule" || directData.action === "focus"
                ? directData.action
                : null,
            source: directData.source || "llm",
          };
        }
      }
    } catch (directErr) {
      console.warn(
        "[aiChatService] Direct AI engine gagal:",
        directErr?.message || directErr
      );
    }
  }

  // 3. Fallback terakhir: generator respons heuristik
  return generateAssistantReply(trimmed, { user, tasks, sessions });
}

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
