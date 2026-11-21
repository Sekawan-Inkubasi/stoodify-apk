import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { parseDeepLink, claimTokenForProcessing } from '../services/deepLinkService';
import * as authService from '../services/authService';

/**
 * Hook untuk mengelola deep linking di seluruh siklus hidup aplikasi Stoodify
 * Menangani:
 * 1. stoodify://verify-email?token=...
 * 2. stoodify://reset-password?token=...
 */
export default function useDeepLink({
  isLoggedIn = false,
  onVerifySuccess,
  onResetPasswordRequested,
  refreshAppData,
  showDialog,
}) {
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [resetPasswordToken, setResetPasswordToken] = useState(null);

  const handleDeepLink = useCallback(
    async (url) => {
      if (!url) return;
      const parsed = parseDeepLink(url);
      if (!parsed) return;

      if (parsed.type === 'verify-email') {
        const { token } = parsed;
        if (!token) {
          showDialog?.({
            title: 'Tautan Tidak Lengkap',
            message: 'Token verifikasi tidak ditemukan pada tautan. Buka ulang dari email terbaru.',
            type: 'danger',
          });
          return;
        }

        // Cegah eksekusi ganda jika event tertrigger berurutan
        if (!claimTokenForProcessing(token)) {
          return;
        }

        setIsVerifyingEmail(true);
        try {
          await authService.verifyEmail(token);
          showDialog?.({
            title: 'Email Berhasil Diverifikasi!',
            message: 'Akun belajarmu telah aktif. Silakan masuk dengan email dan kata sandi untuk mulai belajar.',
            type: 'success',
          });

          onVerifySuccess?.();
          if (isLoggedIn && refreshAppData) {
            refreshAppData();
          }
        } catch (err) {
          const errMsg = (err?.message || '').toLowerCase();
          if (errMsg.includes('sudah dipakai') || errMsg.includes('sudah diverifikasi')) {
            showDialog?.({
              title: 'Email Sudah Terverifikasi',
              message: 'Email ini sudah diverifikasi sebelumnya. Silakan langsung masuk ke akunmu.',
              type: 'info',
            });
            onVerifySuccess?.();
          } else if (errMsg.includes('kedaluwarsa') || errMsg.includes('expired')) {
            showDialog?.({
              title: 'Tautan Kedaluwarsa',
              message: 'Tautan verifikasi sudah kedaluwarsa (berlaku 24 jam). Minta kirim ulang tautan aktivasi dari aplikasi.',
              type: 'warning',
            });
          } else {
            showDialog?.({
              title: 'Verifikasi Gagal',
              message: err?.message || 'Tautan verifikasi tidak valid. Periksa kembali email aktivasi kamu.',
              type: 'danger',
            });
          }
        } finally {
          setIsVerifyingEmail(false);
        }
      } else if (parsed.type === 'reset-password') {
        const { token } = parsed;
        if (!token) {
          showDialog?.({
            title: 'Tautan Tidak Lengkap',
            message: 'Token reset kata sandi tidak ditemukan pada tautan. Minta tautan baru dari menu Lupa Kata Sandi.',
            type: 'danger',
          });
          return;
        }

        setResetPasswordToken(token);
        onResetPasswordRequested?.(token);
      }
    },
    [isLoggedIn, onVerifySuccess, onResetPasswordRequested, refreshAppData, showDialog],
  );

  useEffect(() => {
    let isMounted = true;

    // Tangani cold boot (aplikasi dibuka langsung dari link saat tertutup)
    Linking.getInitialURL().then((initialUrl) => {
      if (isMounted && initialUrl) {
        handleDeepLink(initialUrl);
      }
    });

    // Tangani runtime / background link (aplikasi sedang berjalan di memori)
    const subscription = Linking.addEventListener('url', (event) => {
      if (isMounted && event?.url) {
        handleDeepLink(event.url);
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [handleDeepLink]);

  const clearResetPasswordToken = useCallback(() => {
    setResetPasswordToken(null);
  }, []);

  return {
    isVerifyingEmail,
    resetPasswordToken,
    clearResetPasswordToken,
    handleDeepLink,
  };
}
