/**
 * Elegant Loading Spinner Component
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../theme/colors';

export default function LoadingSpinner({ message = 'Loading salons and services...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
