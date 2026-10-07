/**
 * Date and Time Selection Component
 * Provides intuitive date pill carousel and time slot grid for Screen 2
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

export default function DateTimeSelector({ selectedDate, onSelectDate, selectedTime, onSelectTime }) {
  // Generate next 8 calendar dates starting from today
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 8; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateString = d.toISOString().split('T')[0];
    
    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    dates.push({
      dateString,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      label,
    });
  }

  // Pre-configured standard salon appointment time slots
  const timeSlots = [
    '09:30', '10:30', '11:30', '13:00',
    '14:00', '15:30', '17:00', '18:30'
  ];

  return (
    <View style={styles.container}>
      {/* Date Selection */}
      <Text style={styles.sectionTitle}>1. Select Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesScroll}
      >
        {dates.map((item) => {
          const isSelected = selectedDate === item.dateString;
          return (
            <TouchableOpacity
              key={item.dateString}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => onSelectDate(item.dateString)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateDayName, isSelected && styles.textWhite]}>
                {item.dayName}
              </Text>
              <Text style={[styles.dateDayNumber, isSelected && styles.textWhite]}>
                {item.dayNumber}
              </Text>
              <Text style={[styles.dateMonth, isSelected && styles.textWhiteMuted]}>
                {item.month}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Time Selection */}
      <View style={styles.timeSectionHeader}>
        <Text style={styles.sectionTitle}>2. Select Time Slot</Text>
        <Text style={styles.subtext}>Showing available business hours</Text>
      </View>
      <View style={styles.timeGrid}>
        {timeSlots.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <TouchableOpacity
              key={time}
              style={[styles.timeChip, isSelected && styles.timeChipSelected]}
              onPress={() => onSelectTime(time)}
              activeOpacity={0.7}
            >
              <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  timeSectionHeader: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  subtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: -4,
  },
  datesScroll: {
    paddingVertical: SPACING.xs,
  },
  dateCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 68,
  },
  dateCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  dateDayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  textWhite: {
    color: COLORS.textInverse,
  },
  textWhiteMuted: {
    color: '#FFE4E6',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '22%',
    flexGrow: 1,
  },
  timeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  timeTextSelected: {
    color: COLORS.textInverse,
  },
});
