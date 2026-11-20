import React, { useState } from "react";
import { View } from "react-native";
import { MailCheck, RefreshCw } from "lucide-react-native";
import { AppText, Button, Card } from "../ui";
import { colors } from "../../constants/theme";
import * as authService from "../../services/authService";
import { styles } from "../../screens/AuthScreen.styles";

export default function RegisterSuccessVerify({
  email,
  onGoToLogin,
  showMessage,
}) {
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendStatus("");
    try {
      await authService.resendVerification(email);
      setCooldown(60);
      setResendStatus("Tautan verifikasi baru berhasil dikirim ke email kamu.");
    } catch (err) {
      showMessage?.(
        err.message || "Gagal mengirim ulang email verifikasi. Coba beberapa saat lagi.",
        "Kirim Ulang Gagal"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.verifyWrap}>
      <View style={styles.verifyIconBadge}>
        <MailCheck size={36} color={colors.primary} />
      </View>

      <AppText style={styles.verifyTitle}>Cek Email Kamu!</AppText>
      <AppText style={styles.verifySub}>
        Pendaftaran akun berhasil. Kami telah mengirimkan tautan aktivasi akun ke:
      </AppText>

      <Card style={styles.emailBadgeCard}>
        <AppText style={styles.emailBadgeText} numberOfLines={1}>
          {email || "email.kamu@sekolah.sch.id"}
        </AppText>
      </Card>

      <View style={styles.verifyTipsBox}>
        <AppText style={styles.verifyTipsText}>
          • Buka aplikasi email atau Gmail di HP kamu{"\n"}
          • Periksa folder Inbox atau Spam/Promosi{"\n"}
          • Klik tombol "Buka Aplikasi Stoodify" di email untuk verifikasi otomatis
        </AppText>
      </View>

      {resendStatus ? (
        <AppText style={styles.resendSuccessText}>{resendStatus}</AppText>
      ) : null}

      <View style={styles.verifyActions}>
        <Button
          title={
            resending
              ? "Mengirim Ulang..."
              : cooldown > 0
              ? `Kirim Ulang (${cooldown}s)`
              : "Kirim Ulang Email Aktivasi"
          }
          variant="outline"
          icon={RefreshCw}
          onPress={handleResend}
          disabled={resending || cooldown > 0}
          loading={resending}
          style={styles.resendButton}
        />
        <Button
          title="Masuk ke Akun Sekarang"
          onPress={onGoToLogin}
          style={styles.submit}
        />
      </View>
    </View>
  );
}
