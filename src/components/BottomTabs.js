import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, CheckSquare, House, Sparkles, UserRound } from 'lucide-react-native';
import { colors } from '../constants/theme';

const tabs = [
  { id: 'home', label: 'Beranda', Icon: House },
  { id: 'calendar', label: 'Kalender', Icon: CalendarDays },
  { id: 'tasks', label: 'Tugas', Icon: CheckSquare },
  { id: 'ai-plan', label: 'Rencana AI', Icon: Sparkles },
  { id: 'profile', label: 'Profil', Icon: UserRound },
];

export default function BottomTabs({ active, onChange, urgentCount = 0, bottom = 16 }) {
  return <View style={[styles.shell, { bottom }]}>
    {tabs.map(({ id, label, Icon }) => {
      const selected = active === id;
      return <Pressable key={id} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected }} onPress={() => onChange(id)} style={styles.tab}>
        <View style={[styles.iconWrap, selected && styles.iconWrapActive]}>
          <Icon size={19} color={selected ? '#fff' : '#52647D'} strokeWidth={selected ? 2.5 : 2} />
          {id === 'tasks' && urgentCount > 0 ? <View style={styles.badge} /> : null}
        </View>
      </Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  shell: { position: 'absolute', bottom: 16, left: 16, right: 16, height: 62, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.97)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 5, elevation: 12, shadowColor: '#24456F', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 7 } },
  tab: { width: 52, height: 52, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 38, height: 38, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.24, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  badge: { position: 'absolute', width: 7, height: 7, borderRadius: 4, top: 4, right: 3, backgroundColor: '#F43F5E', borderWidth: 1, borderColor: '#fff' },
});
