/** Backend API and explicit hosted web fallback. */
export const REMOTE_WEB_URL = 'https://stoodify-mobile-app.vercel.app';
const PRODUCTION_API = 'https://stoodify.kradev.my.id/api';
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || process.env.BASE_API_URL || PRODUCTION_API).replace(/\/+$/, '');
export const API_TIMEOUT_MS = 10000;

export default { API_BASE_URL, REMOTE_WEB_URL, API_TIMEOUT_MS };
