import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { AppText } from './ui';
import { colors } from '../constants/theme';

export default function SubjectDropdown({
  subjects = [],
  selectedSubjectId,
  onSelect,
  placeholder = 'Pilih mata pelajaran',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const safeSubjects = Array.isArray(subjects) ? subjects.filter(Boolean) : [];

  const selectedSubject = safeSubjects.find(
    (s) => String(s.id) === String(selectedSubjectId),
  );

  const handleSelect = (id) => {
    onSelect(String(id));
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel="Pilih mata pelajaran"
        accessibilityExpanded={isOpen}
        onPress={() => setIsOpen((prev) => !prev)}
        style={[
          styles.trigger,
          isOpen && styles.triggerActive,
        ]}
      >
        <View style={styles.triggerContent}>
          {selectedSubject?.color ? (
            <View
              style={[
                styles.colorDot,
                { backgroundColor: selectedSubject.color },
              ]}
            />
          ) : null}
          <AppText
            style={[
              styles.triggerText,
              !selectedSubject && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {selectedSubject?.name || placeholder}
          </AppText>
        </View>
        <ChevronDown
          size={16}
          color={isOpen ? colors.primary : '#64748B'}
          style={isOpen ? styles.chevronOpen : styles.chevronClosed}
        />
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator
            contentContainerStyle={styles.scrollContent}
          >
            {safeSubjects.map((subject, idx) => {
              const isSelected = String(subject.id) === String(selectedSubjectId);
              const isLast = idx === safeSubjects.length - 1;
              return (
                <Pressable
                  key={subject.id}
                  accessibilityRole="button"
                  onPress={() => handleSelect(subject.id)}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && styles.optionSelected,
                    pressed && styles.optionPressed,
                    isLast && styles.optionLast,
                  ]}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.optionDot,
                        { backgroundColor: subject.color || colors.primary },
                      ]}
                    />
                    <AppText
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {subject.name}
                    </AppText>
                  </View>
                  {isSelected ? (
                    <Check size={14} color={colors.primary} strokeWidth={2.5} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  trigger: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  triggerActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  triggerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  triggerText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  chevronClosed: {
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    maxHeight: 188,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: 4,
  },
  option: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginVertical: 1,
    borderRadius: 10,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionPressed: {
    backgroundColor: '#F1F5F9',
  },
  optionLast: {
    marginBottom: 2,
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  optionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  optionText: {
    fontSize: 10.5,
    fontFamily: 'Poppins_400Regular',
    color: '#334155',
  },
  optionTextSelected: {
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
});
