import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { APP_URL, REMOTE_WEB_URL, LOCAL_ASSET_URL } from './src/constants/config';

function StoodifyWebView() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(APP_URL);

  // Handle hardware back button on Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  const handleFallbackToRemote = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setCurrentUrl(REMOTE_WEB_URL);
  }, []);

  return (
    <View
      style={[
        styles.root,
        {
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={[styles.topInsetSpacer, { height: insets.top }]} />
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          geolocationEnabled={false}
          cacheEnabled={true}
          allowsBackForwardNavigationGestures={true}
          originWhitelist={['*']}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          overScrollMode="never"
          bounces={false}
          androidCameraPermissionOptions={{
            title: 'Izin Kamera Stoodify',
            message: 'Stoodify membutuhkan akses kamera untuk memindai soal belajar.',
            buttonPositive: 'Izinkan',
            buttonNegative: 'Batal',
          }}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandTitle}>Stoodify</Text>
                <Text style={styles.brandSubtitle}>Asisten Belajar SMA/SMK</Text>
              </View>
              <ActivityIndicator size="large" color="#0066FF" style={styles.spinner} />
            </View>
          )}
        />

        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>📡</Text>
            <Text style={styles.errorTitle}>Koneksi Terputus</Text>
            <Text style={styles.errorMessage}>
              Tidak dapat memuat aplikasi Stoodify. Periksa koneksi internet Anda atau coba lagi.
            </Text>
            <View style={styles.errorActionRow}>
              <Pressable
                style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </Pressable>
              {currentUrl !== REMOTE_WEB_URL && (
                <Pressable
                  style={({ pressed }) => [styles.fallbackButton, pressed && styles.retryButtonPressed]}
                  onPress={handleFallbackToRemote}
                >
                  <Text style={styles.fallbackButtonText}>Buka Server Web</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoodifyWebView />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topInsetSpacer: {
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  brandBadge: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0066FF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  spinner: {
    marginTop: 10,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    zIndex: 20,
  },
  errorIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  fallbackButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fallbackButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
});
