import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  CalendarDays,
  CheckSquare,
  House,
  Sparkles,
  UserRound,
} from 'lucide-react-native';
import NavTooltip, { TOOLTIP_WIDTH } from './NavTooltip';
import { colors } from '../constants/theme';

const tabs = [
  {
    id: 'home',
    label: 'Beranda',
    Icon: House,
    title: 'Beranda',
    desc: 'Ringkasan harian, agenda aktif, dan progres belajar',
  },
  {
    id: 'calendar',
    label: 'Kalender',
    Icon: CalendarDays,
    title: 'Kalender Belajar',
    desc: 'Jadwal sekolah mingguan & timeline sesi fokus',
  },
  {
    id: 'tasks',
    label: 'Tugas',
    Icon: CheckSquare,
    title: 'Daftar Tugas',
    desc: 'Kelola tugas sekolah, prioritas AI, dan subtask',
  },
  {
    id: 'ai-plan',
    label: 'Jadwal Belajar',
    Icon: Sparkles,
    title: 'Jadwal Belajar AI',
    desc: 'Rekomendasi sesi belajar pintar adaptif harian',
  },
  {
    id: 'profile',
    label: 'Profil',
    Icon: UserRound,
    title: 'Profil & Pengaturan',
    desc: 'Pengaturan akun, preferensi reminder, & statistik',
  },
];

export default function BottomTabs({
  active,
  onChange,
  urgentCount = 0,
  bottom = 16,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [barWidth, setBarWidth] = useState(0);
  const shellRef = useRef(null);
  const barPageXRef = useRef(16);
  const currentHoverRef = useRef(null);
  const hideTimerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(6)).current;

  const getIndexFromEvent = (evt) => {
    if (!barWidth) return 0;
    const pageX = evt.nativeEvent.pageX;
    const localX =
      typeof pageX === 'number'
        ? pageX - (barPageXRef.current || 16)
        : evt.nativeEvent.locationX || 0;
    const tabWidth = barWidth / tabs.length;
    return Math.max(0, Math.min(tabs.length - 1, Math.floor(localX / tabWidth)));
  };

  const showTooltip = (index) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    currentHoverRef.current = index;
    setHoveredIndex(index);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const scheduleHide = (delay = 700) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translateYAnim, { toValue: 6, duration: 160, useNativeDriver: true }),
      ]).start(() => {
        setHoveredIndex(null);
        currentHoverRef.current = null;
      });
    }, delay);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const idx = getIndexFromEvent(evt);
          showTooltip(idx);
        },
        onPanResponderMove: (evt) => {
          const idx = getIndexFromEvent(evt);
          if (idx !== currentHoverRef.current) {
            showTooltip(idx);
          }
        },
        onPanResponderRelease: (evt) => {
          const idx = getIndexFromEvent(evt);
          const target = tabs[idx];
          if (target) {
            onChange(target.id);
          }
          scheduleHide(650);
        },
        onPanResponderTerminate: () => {
          scheduleHide(100);
        },
      }),
    [barWidth, onChange],
  );

  const activeTabInfo = hoveredIndex !== null ? tabs[hoveredIndex] : null;

  const { cardLeft, caretLeft } = useMemo(() => {
    if (hoveredIndex === null || !barWidth) return { cardLeft: 0, caretLeft: 0 };
    const tabWidth = barWidth / tabs.length;
    const tabCenter = (hoveredIndex + 0.5) * tabWidth;
    const halfWidth = TOOLTIP_WIDTH / 2;
    const clampedCardLeft = Math.max(
      6,
      Math.min(barWidth - TOOLTIP_WIDTH - 6, tabCenter - halfWidth),
    );
    const calculatedCaretLeft = Math.max(
      clampedCardLeft + 12,
      Math.min(clampedCardLeft + TOOLTIP_WIDTH - 24, tabCenter - 6),
    );
    return { cardLeft: clampedCardLeft, caretLeft: calculatedCaretLeft };
  }, [hoveredIndex, barWidth]);

  return (
    <View
      ref={shellRef}
      style={[styles.shell, { bottom }]}
      onLayout={(e) => {
        setBarWidth(e.nativeEvent.layout.width);
        shellRef.current?.measure((x, y, width, height, pageX) => {
          if (typeof pageX === 'number') barPageXRef.current = pageX;
        });
      }}
      {...panResponder.panHandlers}
    >
      <NavTooltip
        activeTabInfo={activeTabInfo}
        fadeAnim={fadeAnim}
        translateYAnim={translateYAnim}
        cardLeft={cardLeft}
        caretLeft={caretLeft}
      />

      {tabs.map(({ id, label, Icon }, idx) => {
        const selected = active === id;
        const isHovered = hoveredIndex === idx;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => onChange(id)}
            style={styles.tab}
          >
            <View
              style={[
                styles.iconWrap,
                selected && styles.iconWrapActive,
                isHovered && !selected && styles.iconWrapHovered,
              ]}
            >
              <Icon
                size={19}
                color={selected ? '#fff' : isHovered ? colors.primary : '#52647D'}
                strokeWidth={selected ? 2.5 : 2}
              />
              {/* Bullet merah disembunyikan saat tab aktif dibuka */}
              {id === 'tasks' && !selected && urgentCount > 0 ? (
                <View style={styles.badge} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 62,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.97)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    elevation: 12,
    shadowColor: '#24456F',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
  },
  tab: {
    width: 52,
    height: 52,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconWrapHovered: {
    backgroundColor: '#EFF6FF',
  },
  badge: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 6,
    right: 6,
    backgroundColor: '#F43F5E',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
