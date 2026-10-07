/**
 * Top App Navbar Header
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function Navbar({ onOpenSettings }) {
  const { currentScreen, goBack, navigate, customerBookings, backendStatus } = useApp();

  const isHome = currentScreen === 'discovery';

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {!isHome && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigate('discovery')}
          activeOpacity={0.8}
        >
          <View style={styles.brandRow}>
            <Text style={styles.brandLogo}>✂</Text>
            <Text style={styles.brandTitle}>Salonista</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.rightRow}>
        {/* Backend Connectivity Status Dot */}
        <TouchableOpacity
          style={styles.statusIndicator}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.statusDot,
              backendStatus === 'healthy'
                ? styles.dotHealthy
                : backendStatus === 'checking'
                ? styles.dotChecking
                : styles.dotOffline,
            ]}
          />
          <Text style={styles.statusText}>
            {backendStatus === 'healthy' ? 'API OK' : backendStatus === 'checking' ? 'Connecting' : 'Offline'}
          </Text>
        </TouchableOpacity>

        {/* My Bookings Button */}
        <TouchableOpacity
          style={[
            styles.bookingsButton,
            currentScreen === 'my_bookings' && styles.bookingsButtonActive,
          ]}
          onPress={() => navigate('my_bookings')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.bookingsButtonText,
              currentScreen === 'my_bookings' && styles.bookingsButtonTextActive,
            ]}
          >
            My Bookings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 44 : SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    fontSize: 22,
    marginRight: 6,
    color: COLORS.primary,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  dotHealthy: {
    backgroundColor: COLORS.success,
  },
  dotChecking: {
    backgroundColor: COLORS.warning,
  },
  dotOffline: {
    backgroundColor: COLORS.danger,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  bookingsButton: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
  },
  bookingsButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bookingsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  bookingsButtonTextActive: {
    color: COLORS.textInverse,
  },
});
