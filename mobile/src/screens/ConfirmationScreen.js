/**
 * Screen 3 – Booking Confirmation
 * After successful booking, display:
 * - Booking confirmation message
 * - Salon
 * - Service
 * - Date
 * - Time
 * - Payment method
 * - Booking status
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function ConfirmationScreen() {
  const { confirmedBooking, navigate, fetchBookings } = useApp();

  if (!confirmedBooking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Booking Confirmation</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigate('discovery')}
        >
          <Text style={styles.primaryButtonText}>Return to Discovery</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleGoToMyBookings = () => {
    fetchBookings();
    navigate('my_bookings');
  };

  const handleBookAnother = () => {
    navigate('discovery');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success Hero Header */}
      <View style={styles.heroSection}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your appointment has been successfully scheduled. We look forward to seeing you!
        </Text>
        <View style={styles.bookingIdTag}>
          <Text style={styles.bookingIdText}>
            Reference ID: #BKG-{String(confirmedBooking.bookingId).padStart(4, '0')}
          </Text>
        </View>
      </View>

      {/* Confirmation Details Card (Fulfills all Screen 3 required fields) */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardSectionHeader}>Appointment Details</Text>

        {/* 1. Salon */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Salon</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValueBold}>{confirmedBooking.salonName}</Text>
            <Text style={styles.fieldSubValue}>{confirmedBooking.salonAddress}, {confirmedBooking.salonCity}</Text>
          </View>
        </View>

        {/* 2. Service */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Service</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValueBold}>{confirmedBooking.serviceName}</Text>
            <Text style={styles.fieldSubValue}>Duration: {confirmedBooking.durationMinutes || 45} mins</Text>
          </View>
        </View>

        {/* 3. Date */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date</Text>
          <Text style={styles.fieldValueText}>{confirmedBooking.date}</Text>
        </View>

        {/* 4. Time */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Time</Text>
          <Text style={styles.fieldValueText}>{confirmedBooking.time}</Text>
        </View>

        {/* 5. Payment Method */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentBadgeText}>
              {confirmedBooking.paymentMethod === 'pay_at_salon' ? 'Pay at Salon' : confirmedBooking.paymentMethod}
            </Text>
          </View>
        </View>

        {/* 6. Booking Status */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Booking Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {confirmedBooking.status ? confirmedBooking.status.toUpperCase() : 'CONFIRMED'}
            </Text>
          </View>
        </View>

        {/* Total Price */}
        <View style={[styles.fieldRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Due Upon Arrival</Text>
          <Text style={styles.totalPrice}>
            ${Number(confirmedBooking.totalPrice).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Helpful Instructions Card */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Important Arrival Notice</Text>
        <Text style={styles.infoText}>
          Please arrive 5 to 10 minutes prior to your scheduled time. Since you selected "Pay at Salon", you can settle the bill with cash or credit card at the front desk when your treatment concludes.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoToMyBookings}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBookAnother}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Discover More Salons</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  checkCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  checkIcon: {
    color: COLORS.textInverse,
    fontSize: 34,
    fontWeight: '900',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  bookingIdTag: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookingIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  cardSectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    width: '35%',
  },
  fieldValueContainer: {
    width: '65%',
    alignItems: 'flex-end',
  },
  fieldValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  fieldSubValue: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  fieldValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  paymentBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  statusBadge: {
    backgroundColor: COLORS.successLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.successDark,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 16,
  },
  actionsContainer: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
});
