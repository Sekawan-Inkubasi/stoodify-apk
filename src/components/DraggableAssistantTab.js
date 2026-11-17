import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

const TAB_WIDTH = 34;
const TAB_HEIGHT = 124;
const ROTATED_TEXT_WIDTH = 84;

export default function DraggableAssistantTab({ onPress }) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const minY = Math.max(50, insets.top + 45);
  const maxY = Math.max(minY + 50, screenHeight - Math.max(85, insets.bottom + 80) - TAB_HEIGHT);
  const defaultY = Math.round(screenHeight * 0.52);

  const panY = useRef(new Animated.Value(defaultY)).current;
  const currentY = useRef(defaultY);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,
      onPanResponderMove: (_, gesture) => {
        const nextY = Math.min(Math.max(minY, currentY.current + gesture.dy), maxY);
        panY.setValue(nextY);
      },
      onPanResponderRelease: (_, gesture) => {
        const moved = Math.abs(gesture.dx) >= 6 || Math.abs(gesture.dy) >= 6;
        if (!moved) {
          onPress?.();
          return;
        }
        const finalY = Math.min(Math.max(minY, currentY.current + gesture.dy), maxY);
        currentY.current = finalY;
        panY.setValue(finalY);
      },
      onPanResponderTerminate: () => {
        panY.setValue(currentY.current);
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [{ translateY: panY }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Buka Stoodify AI Assistant"
      accessibilityHint="Ketuk untuk membuka asisten atau geser vertikal untuk memindahkan posisi"
    >
      <View style={styles.tab}>
        <View style={styles.iconCircle}>
          <ChevronLeft size={13} color="#FFFFFF" strokeWidth={2.8} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.rotatedWrapper}>
            <Text numberOfLines={1} style={styles.tabText}>
              AI ASSISTANT
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 99,
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
  },
  tab: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 6,
    shadowColor: '#002B8A',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: -2, height: 4 },
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotatedWrapper: {
    width: ROTATED_TEXT_WIDTH,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
});
