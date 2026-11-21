import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { AppText } from '../components/ui';
import OnboardingSlide from '../components/onboarding/OnboardingSlide';
import OnboardingQuestionnaire from '../components/onboarding/OnboardingQuestionnaire';
import { colors, radii } from '../constants/theme';
import tokenStorage from '../services/tokenStorage';
import localNotificationService from '../services/localNotificationService';

const TOTAL_STEPS = 7;

export default function OnboardingScreen({ onComplete }) {
  const { width: screenWidth } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [hasNotifPerm, setHasNotifPerm] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState({
    selectedGoals: [],
    schoolStart: '07:00',
    schoolEnd: '15:30',
    studyStart: '16:30',
    studyEnd: '21:00',
    sessionDuration: 60,
  });

  useEffect(() => {
    localNotificationService.hasNotificationPermission().then(setHasNotifPerm);
  }, []);

  // Animasi geser horizontal antar-slide (smooth spring transition)
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: step,
      damping: 24,
      stiffness: 190,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [step, slideAnim]);

  useEffect(() => {
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 0) {
        setStep((s) => s - 1);
        return true;
      }
      return false;
    });
    return () => backSub.remove();
  }, [step]);

  const updateFormData = useCallback((patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const granted = await localNotificationService.requestNotificationPermission();
    setHasNotifPerm(granted);
    if (granted) {
      await localNotificationService.setupNotificationChannel();
    }
  }, []);

  const handleComplete = useCallback(async (mode = 'login') => {
    await tokenStorage.setHasSeenOnboarding(true);
    await tokenStorage.setOnboardingPreferences({
      start_time: formData.studyStart,
      end_time: formData.studyEnd,
      session_duration: formData.sessionDuration,
      school_start: formData.schoolStart,
      school_end: formData.schoolEnd,
      goals: (formData.selectedGoals || []).join(','),
    });
    onComplete?.(mode);
  }, [formData, onComplete]);

  const handleNext = useCallback(() => {
    // Pada step 3 (kuisioner tujuan), wajib memilih minimal 1 pilihan
    if (step === 3 && (!formData.selectedGoals || formData.selectedGoals.length === 0)) {
      return;
    }
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete('login');
    }
  }, [step, formData.selectedGoals, handleComplete]);

  const handleSkip = useCallback(() => {
    setStep(TOTAL_STEPS - 1);
  }, []);

  const translateX = slideAnim.interpolate({
    inputRange: Array.from({ length: TOTAL_STEPS }).map((_, i) => i),
    outputRange: Array.from({ length: TOTAL_STEPS }).map((_, i) => -i * screenWidth),
  });

  const renderSlideContent = (index) => {
    if (index <= 2) {
      return (
        <OnboardingSlide
          index={index}
          onPermissionRequest={handleRequestPermission}
          hasNotificationPerm={hasNotifPerm}
        />
      );
    }
    return (
      <OnboardingQuestionnaire
        step={index}
        data={formData}
        onChange={updateFormData}
        onComplete={handleComplete}
      />
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.header}>
        {step > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            onPress={() => setStep((s) => s - 1)}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#475569" />
          </Pressable>
        ) : <View style={styles.placeholder} />}
        {step < TOTAL_STEPS - 1 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lewati"
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <AppText style={styles.skipText}>Lewati</AppText>
          </Pressable>
        ) : <View style={styles.placeholder} />}
      </View>

      <View style={styles.trackViewport}>
        <Animated.View
          style={[
            styles.track,
            {
              width: screenWidth * TOTAL_STEPS,
              transform: [{ translateX }],
            },
          ]}
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <View key={index} style={[styles.slidePage, { width: screenWidth }]}>
              <ScrollView
                contentContainerStyle={styles.slideScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {renderSlideContent(index)}
              </ScrollView>
            </View>
          ))}
        </Animated.View>
      </View>

      {step < TOTAL_STEPS - 1 ? (
        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lanjut"
            onPress={handleNext}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
          >
            <AppText style={styles.nextText}>Lanjut</AppText>
            <ChevronRight size={18} color="#fff" />
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: colors.muted,
  },
  placeholder: { width: 44, height: 44 },
  trackViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  track: {
    flex: 1,
    flexDirection: 'row',
  },
  slidePage: {
    flex: 1,
  },
  slideScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  footer: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 22,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  nextButton: {
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 6,
  },
  nextText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});
