/**
 * Screen 4 – My Bookings List
 * Fulfills requirement: "The application should allow a customer to: View their bookings"
 * and submission item: "Booking list"
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { salonApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function MyBookingsScreen({ onOpenSettings }) {
  const { customer, navigate } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomerBookings = useCallback(async () => {
    setError(null);
    try {
      const response = await salonApi.getCustomerBookings(customer.id);
      if (response && response.data) {
        setBookings(response.data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customer.id]);

  useEffect(() => {
    fetchCustomerBookings();
  }, [fetchCustomerBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomerBookings();
  };

  return (
    <View style={styles.container}>
      {/* Customer Header Card */}
      <View style={styles.customerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{customer.name.charAt(0)}</Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerContact}>{customer.email} • {customer.phone}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{bookings.length} Bookings</Text>
        </View>
      </View>

      {/* Bookings List */}
      {loading && !refreshing ? (
        <LoadingSpinner message="Fetching your appointment records..." />
      ) : error ? (
        <View style={styles.paddedContent}>
          <ErrorMessage
            error={error}
            onRetry={fetchCustomerBookings}
            onOpenSettings={onOpenSettings}
          />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.bookingId.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Scheduled Appointments</Text>
              <Text style={styles.listSubtitle}>Manage and review your upcoming salon visits</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              {/* Card Header: Salon Name & Status */}
              <View style={styles.cardHeader}>
                <View style={styles.salonInfoCol}>
                  <Text style={styles.salonName}>{item.salonName}</Text>
                  <Text style={styles.salonAddress}>📍 {item.salonAddress}, {item.salonCity}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              {/* Service Details */}
              <View style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{item.serviceName}</Text>
                  <Text style={styles.serviceDuration}>⏱ {item.durationMinutes || 45} mins</Text>
                </View>
                <Text style={styles.servicePrice}>${Number(item.totalPrice).toFixed(2)}</Text>
              </View>

              {/* Schedule Chips & Payment Badge */}
              <View style={styles.footerRow}>
                <View style={styles.scheduleChips}>
                  <View style={styles.scheduleChip}>
                    <Text style={styles.scheduleChipText}>📅 {item.date}</Text>
                  </View>
                  <View style={styles.scheduleChip}>
                    <Text style={styles.scheduleChipText}>🕒 {item.time}</Text>
                  </View>
                </View>

                <View style={styles.paymentMethodTag}>
                  <Text style={styles.paymentMethodText}>
                    {item.paymentMethod === 'pay_at_salon' ? 'Pay at Salon' : item.paymentMethod}
                  </Text>
                </View>
              </View>

              {item.notes ? (
                <View style={styles.notesRow}>
                  <Text style={styles.notesText}>💬 "{item.notes}"</Text>
                </View>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No Appointments Yet</Text>
              <Text style={styles.emptySubtitle}>
                You haven't scheduled any salon appointments. Browse top-rated salons now!
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigate('discovery')}
                activeOpacity={0.8}
              >
                <Text style={styles.browseButtonText}>Explore Salons</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  customerHeader: {
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryMuted,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  customerContact: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  paddedContent: {
    padding: SPACING.lg,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  listHeader: {
    marginBottom: SPACING.md,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  listSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  salonInfoCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  salonAddress: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: COLORS.successLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.successDark,
  },
  serviceRow: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  serviceDuration: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  scheduleChips: {
    flexDirection: 'row',
    gap: 6,
  },
  scheduleChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  scheduleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  paymentMethodTag: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  notesRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: RADIUS.md,
  },
  browseButtonText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
});
