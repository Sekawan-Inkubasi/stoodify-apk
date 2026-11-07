import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, shadow } from '../constants/theme';

export function Screen({ children, scroll = true, style, contentStyle }) {
  const content = scroll
    ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.screenContent, contentStyle]}>{children}</ScrollView>
    : <View style={[styles.screenContent, contentStyle]}>{children}</View>;
  return <SafeAreaView edges={['top']} style={[styles.screen, style]}>{content}</SafeAreaView>;
}

export function AppText({ children, style, numberOfLines, ...props }) {
  return <Text {...props} numberOfLines={numberOfLines} style={[styles.text, style]}>{children}</Text>;
}

export function Button({ title, onPress, variant = 'primary', icon: Icon, disabled, style, compact = false }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.button, styles[`button_${variant}`], compact && styles.buttonCompact, disabled && styles.disabled, pressed && !disabled && styles.pressed, style]}>
      {Icon ? <Icon size={17} color={variant === 'primary' ? '#fff' : colors.primary} /> : null}
      <AppText style={[styles.buttonText, styles[`buttonText_${variant}`]]}>{title}</AppText>
    </Pressable>
  );
}

export function Card({ children, style, onPress }) {
  const body = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => pressed ? styles.pressed : null}>{body}</Pressable> : body;
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default', multiline, style, right }) {
  return (
    <View style={style}>
      {label ? <AppText style={styles.fieldLabel}>{label}</AppText> : null}
      <View style={[styles.inputWrap, multiline && styles.multilineWrap]}>
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#94A3B8" secureTextEntry={secureTextEntry} keyboardType={keyboardType} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, multiline && styles.multilineInput]} />
        {right}
      </View>
    </View>
  );
}

export function Header({ title, subtitle, action, onAction, actionIcon: Icon }) {
  return <View style={styles.header}><View style={styles.headerCopy}><AppText style={styles.headerTitle}>{title}</AppText>{subtitle ? <AppText style={styles.headerSub}>{subtitle}</AppText> : null}</View>{action ? <Pressable onPress={onAction} accessibilityRole="button" style={styles.headerAction}>{Icon ? <Icon size={18} color={colors.primary} /> : null}<AppText style={styles.headerActionText}>{action}</AppText></Pressable> : null}</View>;
}

export function Pill({ title, active, onPress, style }) {
  return <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive, style]}><AppText style={[styles.pillText, active && styles.pillTextActive]}>{title}</AppText></Pressable>;
}

export function EmptyState({ icon: Icon, title, subtitle, action, onAction }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}>{Icon ? <Icon size={25} color={colors.primary} /> : null}</View><AppText style={styles.emptyTitle}>{title}</AppText><AppText style={styles.emptySub}>{subtitle}</AppText>{action ? <Button title={action} onPress={onAction} compact style={styles.emptyButton} /> : null}</View>;
}

export function Loading({ label = 'Memuat data...' }) {
  return <View style={styles.loading}><ActivityIndicator color={colors.primary} /><AppText style={styles.loadingText}>{label}</AppText></View>;
}

export function SectionTitle({ children, action, onAction }) {
  return <View style={styles.sectionTitleRow}><AppText style={styles.sectionTitle}>{children}</AppText>{action ? <Pressable onPress={onAction}><AppText style={styles.link}>{action}</AppText></Pressable> : null}</View>;
}

export const uiStyles = styles;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  screenContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120, gap: 16 },
  text: { color: colors.ink, fontFamily: 'Poppins_400Regular', fontSize: 12 },
  button: { minHeight: 46, borderRadius: radii.pill, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  button_primary: { backgroundColor: colors.primary }, button_secondary: { backgroundColor: '#E8F0FF' }, button_outline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#C7D8FF' }, button_ghost: { backgroundColor: colors.faint }, button_danger: { backgroundColor: '#FFF1F2' },
  buttonCompact: { minHeight: 38, paddingHorizontal: 14 }, buttonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, buttonText_primary: { color: '#fff' }, buttonText_secondary: { color: colors.primary }, buttonText_outline: { color: colors.primary }, buttonText_ghost: { color: '#475569' }, buttonText_danger: { color: colors.danger },
  disabled: { opacity: 0.5 }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  card: { backgroundColor: colors.surface, borderRadius: radii.card, padding: 16, ...shadow },
  fieldLabel: { color: '#475569', fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginBottom: 7 },
  inputWrap: { minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 10, color: colors.ink, fontFamily: 'Poppins_400Regular', fontSize: 12 }, multilineWrap: { minHeight: 90, alignItems: 'flex-start' }, multilineInput: { minHeight: 84 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 2 }, headerCopy: { flex: 1 }, headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, letterSpacing: -0.4 }, headerSub: { fontSize: 10, color: colors.muted, marginTop: 3 }, headerAction: { minHeight: 38, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, backgroundColor: '#fff' }, headerActionText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  pill: { borderRadius: radii.pill, backgroundColor: '#F1F5F9', paddingVertical: 8, paddingHorizontal: 13 }, pillActive: { backgroundColor: colors.primary }, pillText: { color: '#64748B', fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, pillTextActive: { color: '#fff' },
  empty: { minHeight: 210, backgroundColor: '#fff', borderRadius: radii.card, alignItems: 'center', justifyContent: 'center', padding: 24, ...shadow }, emptyIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }, emptyTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, textAlign: 'center' }, emptySub: { color: colors.muted, fontSize: 10, textAlign: 'center', lineHeight: 17, marginTop: 6, maxWidth: 260 }, emptyButton: { marginTop: 15 },
  loading: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 12 }, loadingText: { color: colors.muted, fontSize: 11 }, sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }, sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.2 }, link: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
});
