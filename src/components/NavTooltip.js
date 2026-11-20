import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export const TOOLTIP_WIDTH = 224;

export default function NavTooltip({
  activeTabInfo,
  fadeAnim,
  translateYAnim,
  cardLeft,
  caretLeft,
}) {
  if (!activeTabInfo) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.tooltipAnchor,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <View style={[styles.tooltipCard, { left: cardLeft }]}>
        <View style={styles.tooltipHeader}>
          <View style={styles.tooltipDot} />
          <Text style={styles.tooltipTitle}>{activeTabInfo.title}</Text>
        </View>
        <Text style={styles.tooltipDesc}>{activeTabInfo.desc}</Text>
      </View>
      <View style={[styles.caret, { left: caretLeft }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tooltipAnchor: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'flex-start',
  },
  tooltipCard: {
    width: TOOLTIP_WIDTH,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: '#0F172A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  tooltipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  tooltipTitle: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  tooltipDesc: {
    color: '#CBD5E1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    lineHeight: 13.5,
  },
  caret: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
  },
});
