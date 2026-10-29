import { apiGet, apiPost, apiPatch } from './apiClient';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { setTokens, clearTokens, getStoredUser } from './tokenStorage';

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
    setTokens({
      accessToken: result.data.access_token,
      refreshToken: result.data.refresh_token,
      user: result.data.user,
    });
  }

  return result;
}

export async function register(name, email, password, confirmPassword) {
  return apiPost(ENDPOINTS.AUTH_REGISTER, {
    name: name.trim(),
    email: email.trim(),
    password,
    confirm_password: confirmPassword || password,
  });
}

export async function logout() {
  try {
    await apiPost(ENDPOINTS.AUTH_LOGOUT);
  } catch {
    // Logout server gagal tetap bersihkan sesi lokal
  } finally {
    clearTokens();
  }
}

export async function getMe() {
  const result = await apiGet(ENDPOINTS.AUTH_ME);
  if (result?.success && result?.data) {
    setTokens({ user: result.data });
  }
  return result?.data || getStoredUser();
}

export async function updateMe(userData) {
  return apiPatch(ENDPOINTS.USER_ME, userData);
}

export async function getPreferences() {
  const result = await apiGet(ENDPOINTS.USER_PREFERENCES);
  return result?.data || null;
}

export async function updatePreferences(preferences) {
  return apiPatch(ENDPOINTS.USER_PREFERENCES, preferences);
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

export default {
  login,
  register,
  logout,
  getMe,
  updateMe,
  getPreferences,
  updatePreferences,
  loginDemo,
};
