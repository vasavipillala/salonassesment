/**
 * Screen 2 – Booking
 * After selecting a salon/service, display:
 * - Salon name
 * - Service name
 * - Price
 * - Date
 * - Time
 * - Payment method ("Pay at Salon")
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { salonApi } from '../api/client';
import DateTimeSelector from '../components/DateTimeSelector';
import PaymentSelector from '../components/PaymentSelector';

export default function BookingScreen() {
  const {
    selectedSalon,
    selectedService,
    bookingDraft,
    updateDraft,
    customer,
    navigate,
  } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  if (!selectedSalon || !selectedService) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Service Selected</Text>
        <Text style={styles.errorSubtitle}>
          Please select a salon and service from the discovery screen first.
        </Text>
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => navigate('discovery')}
        >
          <Text style={styles.backHomeText}>Browse Salons</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleConfirmBooking = async () => {
    setConflictError(null);

    // Validation
    if (!bookingDraft.date) {
      Alert.alert('Validation Error', 'Please select an appointment date.');
      return;
    }
    if (!bookingDraft.time) {
      Alert.alert('Validation Error', 'Please select an appointment time slot.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerId: customer.id,
        salonId: selectedSalon.id,
        serviceId: selectedService.id,
        date: bookingDraft.date,
        time: bookingDraft.time,
        paymentMethod: bookingDraft.paymentMethod || 'pay_at_salon',
        notes: bookingDraft.notes || null,
      };

      const response = await salonApi.createBooking(payload);

      if (response && response.success) {
        // Navigate to Screen 3: Booking Confirmation
        navigate('confirmation', { confirmed: response.data });
      } else {
        throw new Error(response.message || 'Could not complete booking.');
      }
    } catch (err) {
      if (err.status === 409 || err.message?.includes('Double booking') || err.message?.includes('already booked')) {
        // Double booking conflict caught!
        setConflictError(
          `Slot Conflict: This time slot (${bookingDraft.time}) on ${bookingDraft.date} is already reserved by another customer. Please choose another time slot above.`
        );
      } else {
        setConflictError(err.message || 'An error occurred while creating your appointment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.activeStepBadge}>
            <Text style={styles.stepBadgeText}>Step 2 of 3 • Review & Schedule</Text>
          </View>
          <Text style={styles.ratingText}>★ {Number(selectedSalon.rating).toFixed(1)}</Text>
        </View>

        <Text style={styles.salonName}>{selectedSalon.name}</Text>
        <Text style={styles.salonLocation}>📍 {selectedSalon.address}, {selectedSalon.city}</Text>

        {/* Selected Service Box */}
        <View style={styles.serviceDetailCard}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceLeft}>
              <Text style={styles.serviceLabel}>Selected Service:</Text>
              <Text style={styles.serviceName}>{selectedService.name}</Text>
              <Text style={styles.serviceMeta}>
                ⏱ {selectedService.duration_minutes} mins • Category: {selectedService.category}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>
                ${Number(selectedService.price).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Conflict / Double Booking Error Notice */}
      {conflictError && (
        <View style={styles.conflictBanner}>
          <Text style={styles.conflictIcon}>⚠️</Text>
          <View style={styles.conflictTextWrapper}>
            <Text style={styles.conflictTitle}>Time Slot Unavailable</Text>
            <Text style={styles.conflictMessage}>{conflictError}</Text>
          </View>
        </View>
      )}

      {/* Date & Time Selector */}
      <DateTimeSelector
        selectedDate={bookingDraft.date}
        onSelectDate={(date) => {
          setConflictError(null);
          updateDraft({ date });
        }}
        selectedTime={bookingDraft.time}
        onSelectTime={(time) => {
          setConflictError(null);
          updateDraft({ time });
        }}
      />

      {/* Payment Method Selector (Includes "Pay at Salon") */}
      <PaymentSelector
        selectedMethod={bookingDraft.paymentMethod}
        onSelectMethod={(method) => updateDraft({ paymentMethod: method })}
      />

      {/* Special Requests Notes */}
      <View style={styles.notesSection}>
        <Text style={styles.notesLabel}>4. Special Requests / Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="E.g., Preferred stylist, product allergies, aroma preference..."
          placeholderTextColor={COLORS.textMuted}
          value={bookingDraft.notes}
          onChangeText={(notes) => updateDraft({ notes })}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Booking Summary Box */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Customer</Text>
          <Text style={styles.summaryValue}>{customer.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date & Time</Text>
          <Text style={styles.summaryValue}>
            {bookingDraft.date} at {bookingDraft.time}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method</Text>
          <Text style={styles.summaryValue}>
            {bookingDraft.paymentMethod === 'pay_at_salon' ? 'Pay at Salon (Due on arrival)' : 'Credit Card'}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalValue}>
            ${Number(selectedService.price).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Confirm Button CTA */}
      <TouchableOpacity
        style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
        onPress={handleConfirmBooking}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={COLORS.textInverse} size="small" />
            <Text style={styles.confirmButtonText}> Confirming Booking...</Text>
          </View>
        ) : (
          <Text style={styles.confirmButtonText}>Confirm Appointment (${Number(selectedService.price).toFixed(2)})</Text>
        )}
      </TouchableOpacity>
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
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  activeStepBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gold,
  },
  salonName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  salonLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  serviceDetailCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  serviceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 2,
  },
  serviceMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  conflictBanner: {
    backgroundColor: COLORS.dangerLight,
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    flexDirection: 'row',
  },
  conflictIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  conflictTextWrapper: {
    flex: 1,
  },
  conflictTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.danger,
    marginBottom: 2,
  },
  conflictMessage: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
  },
  notesSection: {
    marginVertical: SPACING.md,
  },
  notesLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: 13,
    color: COLORS.text,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  backHomeBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
  },
  backHomeText: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
});
