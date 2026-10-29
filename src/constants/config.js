import { Platform } from 'react-native';

/**
 * Konfigurasi Base URL Backend Stoodify
 * 
 * Skenario Akses Jaringan:
 * 1. Android Emulator: Memerlukan 10.0.2.2 untuk mengakses localhost mesin host.
 * 2. Perangkat Fisik: Menggunakan localhost jika port reverse aktif (adb reverse tcp:8080 tcp:8080)
 *    atau menggunakan IP LAN mesin host jika via Wi-Fi.
 * 3. Production: Domain HTTPS publik https://stoodify.kradev.my.id/api
 */

const LOCAL_ANDROID_EMULATOR_API = 'http://10.0.2.2:8080/api';
const LOCAL_DEFAULT_API = 'http://localhost:8080/api';
const PRODUCTION_API = 'https://stoodify.kradev.my.id/api';
const DEFAULT_APP_URL = 'https://stoodify-mobile-app.vercel.app';

function resolveDefaultApiUrl() {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return LOCAL_ANDROID_EMULATOR_API;
    }
    return LOCAL_DEFAULT_API;
  }
  return PRODUCTION_API;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || resolveDefaultApiUrl();
export const APP_URL = process.env.EXPO_PUBLIC_APP_URL || DEFAULT_APP_URL;
export const API_TIMEOUT_MS = 10000;

export default {
  API_BASE_URL,
  APP_URL,
  API_TIMEOUT_MS,
};
