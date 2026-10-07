/**
 * Error Message Banner & Diagnostic Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

export default function ErrorMessage({ error, onRetry, onOpenSettings }) {
  if (!error) return null;

  const isNetwork = error.isNetworkError || (typeof error === 'string' && error.includes('backend'));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>{isNetwork ? 'Connection Alert' : 'Notice'}</Text>
      </View>
      <Text style={styles.message}>
        {typeof error === 'string' ? error : error.message || 'An unexpected error occurred.'}
      </Text>

      <View style={styles.actionRow}>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
        {onOpenSettings && (
          <TouchableOpacity style={styles.configButton} onPress={onOpenSettings} activeOpacity={0.8}>
            <Text style={styles.configText}>Change API Host</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.dangerLight,
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  message: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  retryButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  retryText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 12,
  },
  configButton: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  configText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
});
