import { apiGet, apiPost, apiPatch } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { setTokensAsync, clearTokensAsync, getStoredUser } from './tokenStorage';

const DEMO_CREDENTIALS = {
  name: 'Siswa Demo Stoodify',
  email: 'demo.siswa@stoodify.id',
  password: 'demoPassword123',
};

export async function login(email, password) {
  const result = await apiPost(ENDPOINTS.AUTH_LOGIN, {
    email: email.trim(),
    password,
  });

  if (result?.success && result?.data?.access_token) {
    await setTokensAsync({
      accessToken: result.data.access_token,
      refreshToken: result.data.refresh_token,
      user: result.data.user,
    });
  }

  return result;
}

export async function register(dataOrName, email, password, confirmPassword) {
  let payload;
  if (typeof dataOrName === 'object' && dataOrName !== null) {
    payload = {
      name: (dataOrName.name || '').trim(),
      email: (dataOrName.email || '').trim(),
      school: (dataOrName.school || '').trim(),
      grade: Number(dataOrName.grade) || 10,
      major: (dataOrName.major || '').trim(),
      password: dataOrName.password,
      confirm_password: dataOrName.confirmPassword || dataOrName.confirm_password || dataOrName.password,
    };
  } else {
    payload = {
      name: (dataOrName || '').trim(),
      email: (email || '').trim(),
      school: 'SMK Telkom Sidoarjo',
      grade: 10,
      major: 'Teknik Komputer & Jaringan',
      password,
      confirm_password: confirmPassword || password,
    };
  }
  return apiPost(ENDPOINTS.AUTH_REGISTER, payload);
}

export async function resendVerification(email) {
  return apiPost(ENDPOINTS.AUTH_VERIFY_RESEND, {
    email: (email || '').trim(),
  });
}

export async function verifyEmail(token) {
  return apiPost(ENDPOINTS.AUTH_VERIFY_EMAIL, {
    token: (token || '').trim(),
  });
}

export async function requestPasswordReset(email) {
  return apiPost(ENDPOINTS.AUTH_PASSWORD_RESET_REQUEST, {
    email: (email || '').trim(),
  });
}

export async function confirmPasswordReset(token, password, confirmPassword) {
  return apiPost(ENDPOINTS.AUTH_PASSWORD_RESET_CONFIRM, {
    token: (token || '').trim(),
    password,
    confirm_password: confirmPassword || password,
  });
}

export async function completeOnboarding(profileData) {
  return apiPatch(ENDPOINTS.USER_ONBOARDING, {
    school: (profileData?.school || '').trim(),
    grade: Number(profileData?.grade) || 10,
    major: (profileData?.major || '').trim(),
  });
}

export async function logout() {
  try {
    await apiPost(ENDPOINTS.AUTH_LOGOUT);
  } catch {
    // Logout server gagal tetap bersihkan sesi lokal
  } finally {
    await clearTokensAsync();
  }
}

export async function getMe() {
  const result = await apiGet(ENDPOINTS.AUTH_ME);
  if (result?.success && result?.data) {
    await setTokensAsync({ user: result.data });
  }
  return result?.data || getStoredUser();
}

export async function updateMe(userData) {
  return apiPatch(ENDPOINTS.USER_ME, userData);
}

export async function completeEducationProfile({ school, grade, major }) {
  const result = await apiPatch(ENDPOINTS.USER_ONBOARDING, {
    school,
    grade: Number(grade),
    major,
  });
  if (result?.success && result?.data) {
    await setTokensAsync({ user: result.data });
  }
  return result?.data || result;
}

export async function getPreferences() {
  const result = await apiGet(ENDPOINTS.USER_PREFERENCES);
  return result?.data || null;
}

export async function updatePreferences(preferences) {
  return apiPatch(ENDPOINTS.USER_PREFERENCES, preferences);
}

export async function uploadAvatar(uri, name = 'avatar.jpg', type = 'image/jpeg') {
  const body = new FormData();
  body.append('avatar', { uri, name, type });
  const result = await apiPost(ENDPOINTS.USER_AVATAR, body);
  return result?.data?.avatar_url || result?.avatar_url || null;
}

/**
 * Autentikasi Demo Persisten
 * Menghubungkan siswa demo ke akun nyata di database PostgreSQL backend.
 */
export async function loginDemo() {
  try {
    return await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
  } catch (err) {
    // Jika akun demo belum ada di database, daftarkan secara otomatis
    if (err.status === 401 || err.status === 404) {
      await register(
        DEMO_CREDENTIALS.name,
        DEMO_CREDENTIALS.email,
        DEMO_CREDENTIALS.password,
        DEMO_CREDENTIALS.password
      );
      return login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    }
    throw err;
  }
}

export async function loginWithGoogle(idToken) {
  let result;
  try {
    result = await apiPost(ENDPOINTS.AUTH_GOOGLE, { id_token: idToken });
  } catch (err) {
    if (err?.status === 404 || err?.status === 405) {
      result = await apiPost(ENDPOINTS.AUTH_LOGIN, { id_token: idToken });
    } else {
      throw err;
    }
  }

  if (result?.success && result?.data?.access_token) {
    await setTokensAsync({
      accessToken: result.data.access_token,
      refreshToken: result.data.refresh_token,
      user: result.data.user,
    });
  }

  return result;
}

export default {
  login,
  loginWithGoogle,
  register,
  logout,
  getMe,
  updateMe,
  completeEducationProfile,
  getPreferences,
  updatePreferences,
  uploadAvatar,
  loginDemo,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  confirmPasswordReset,
};
