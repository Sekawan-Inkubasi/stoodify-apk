/**
 * Deep Link Service — Stoodify Mobile
 * Parsing dan deduplikasi rute deep link:
 * - stoodify://verify-email?token=...
 * - stoodify://reset-password?token=...
 * (Mendukung variasi scheme exp+stoodify dan https bridge)
 */

const inFlightOrProcessedTokens = new Map();
const TOKEN_DEDUPE_TTL_MS = 15000; // 15 detik window deduplikasi

/**
 * Ekstraksi token dari string query URL
 */
function extractQueryParam(url, paramName) {
  if (!url || typeof url !== 'string') return null;
  try {
    const regex = new RegExp(`[?&]${paramName}=([^&#]+)`, 'i');
    const match = url.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * Mem-parse URL deep link ke objek aksi terstruktur
 * @param {string} url
 * @returns {{ type: 'verify-email' | 'reset-password', token: string | null, rawUrl: string } | null}
 */
export function parseDeepLink(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pola untuk Verifikasi Email
  const isVerifyEmail =
    /^stoodify:\/{1,3}verify-email(\/|\?|$)/i.test(trimmed) ||
    /^exp\+stoodify:\/{1,3}verify-email(\/|\?|$)/i.test(trimmed) ||
    /https?:\/\/[^\/]+\/verify-email(\/|\?|$)/i.test(trimmed);

  if (isVerifyEmail) {
    return {
      type: 'verify-email',
      token: extractQueryParam(trimmed, 'token'),
      rawUrl: trimmed,
    };
  }

  // Pola untuk Reset Password
  const isResetPassword =
    /^stoodify:\/{1,3}reset-password(\/|\?|$)/i.test(trimmed) ||
    /^exp\+stoodify:\/{1,3}reset-password(\/|\?|$)/i.test(trimmed) ||
    /https?:\/\/[^\/]+\/reset-password(\/|\?|$)/i.test(trimmed);

  if (isResetPassword) {
    return {
      type: 'reset-password',
      token: extractQueryParam(trimmed, 'token'),
      rawUrl: trimmed,
    };
  }

  return null;
}

/**
 * Memeriksa apakah token sudah pernah diproses baru-baru ini.
 * Mencegah eksekusi ganda pada cold boot Android (getInitialURL + url listener).
 * @param {string} token
 * @returns {boolean} true jika aman diproses, false jika duplikat
 */
export function claimTokenForProcessing(token) {
  if (!token) return false;
  const now = Date.now();

  // Bersihkan token kadaluwarsa dari map
  for (const [key, timestamp] of inFlightOrProcessedTokens.entries()) {
    if (now - timestamp > TOKEN_DEDUPE_TTL_MS) {
      inFlightOrProcessedTokens.delete(key);
    }
  }

  if (inFlightOrProcessedTokens.has(token)) {
    return false;
  }

  inFlightOrProcessedTokens.set(token, now);
  return true;
}

export default {
  parseDeepLink,
  claimTokenForProcessing,
};
