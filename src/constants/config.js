import { Platform } from 'react-native';

/**
 * Konfigurasi Base URL Backend dan Web Stoodify
 * 
 * 1. Backend API:
 *    - Android Emulator: http://10.0.2.2:8080/api
 *    - Fisik / Default: http://localhost:8080/api
 *    - Production: https://stoodify.kradev.my.id/api
 * 
 * 2. Mobile Web Container:
 *    - Dev HMR: http://<LAN_IP>:5173
 *    - Release Standalone APK: file:///android_asset/web/index.html
 *    - Remote Fallback: https://stoodify-mobile-app.vercel.app
 */

export const LOCAL_ASSET_URL = 'file:///android_asset/web/index.html';
export const REMOTE_WEB_URL = 'https://stoodify-mobile-app.vercel.app';

const LOCAL_ANDROID_EMULATOR_API = 'http://10.0.2.2:8080/api';
const LOCAL_DEFAULT_API = 'http://localhost:8080/api';
const PRODUCTION_API = 'https://stoodify.kradev.my.id/api';

function resolveDefaultApiUrl() {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return LOCAL_ANDROID_EMULATOR_API;
    }
    return LOCAL_DEFAULT_API;
  }
  return PRODUCTION_API;
}

function resolveDefaultAppUrl() {
  if (process.env.EXPO_PUBLIC_APP_URL) {
    return process.env.EXPO_PUBLIC_APP_URL;
  }
  // Pada mode dev Expo Go, arahkan ke remote web (atau dev server jika diset)
  // Pada release build standalone Android, gunakan aset offline di dalam APK
  if (__DEV__) {
    return REMOTE_WEB_URL;
  }
  return Platform.OS === 'android' ? LOCAL_ASSET_URL : REMOTE_WEB_URL;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || resolveDefaultApiUrl();
export const APP_URL = resolveDefaultAppUrl();
export const API_TIMEOUT_MS = 10000;

export default {
  API_BASE_URL,
  APP_URL,
  LOCAL_ASSET_URL,
  REMOTE_WEB_URL,
  API_TIMEOUT_MS,
};
