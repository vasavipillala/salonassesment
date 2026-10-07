/**
 * Payment Method Selection Component
 * Emphasizes required "Pay at Salon" method with clear UI
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

export default function PaymentSelector({ selectedMethod, onSelectMethod }) {
  const options = [
    {
      id: 'pay_at_salon',
      title: 'Pay at Salon',
      subtitle: 'Pay easily with Cash, Credit Card, or Mobile Pay upon arrival',
      badge: 'Zero Pre-payment',
      icon: '🏪',
    },
    {
      id: 'credit_card',
      title: 'Credit / Debit Card',
      subtitle: 'Instant secure reservation with saved card (Optional)',
      badge: null,
      icon: '💳',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>3. Payment Method</Text>

      {options.map((opt) => {
        const isSelected = selectedMethod === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => onSelectMethod(opt.id)}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>{opt.icon}</Text>
            </View>

            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                {opt.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{opt.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
            </View>

            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  optionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 6,
  },
  badge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  optionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});
