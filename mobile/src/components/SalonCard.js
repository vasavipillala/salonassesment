/**
 * Salon Card Component (Discovery Screen)
 * Displays: Salon Name, Location, Rating, Available Services, Service Price, and Book Now button
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

export default function SalonCard({ salon, onBookService }) {
  const [expanded, setExpanded] = useState(false);

  // Default fallback image if null
  const imageUrl = salon.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';

  // Show up to 2 services initially, or all if expanded
  const visibleServices = expanded ? salon.services : salon.services?.slice(0, 2);

  return (
    <View style={styles.card}>
      {/* Salon Cover Image with Badges */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingText}>{Number(salon.rating).toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({salon.review_count || 50})</Text>
        </View>
        <View style={styles.cityBadge}>
          <Text style={styles.cityText}>{salon.city}</Text>
        </View>
      </View>

      {/* Salon Details */}
      <View style={styles.content}>
        <Text style={styles.name}>{salon.name}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.address} numberOfLines={1}>{salon.address}</Text>
        </View>
        <View style={styles.hoursRow}>
          <Text style={styles.hoursIcon}>🕒</Text>
          <Text style={styles.hoursText}>
            Open {salon.open_time?.substring(0, 5)} - {salon.close_time?.substring(0, 5)}
          </Text>
        </View>

        {/* Available Services Section */}
        <View style={styles.servicesSection}>
          <View style={styles.servicesHeader}>
            <Text style={styles.servicesTitle}>Available Services</Text>
            {salon.services && salon.services.length > 2 && (
              <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Text style={styles.toggleText}>
                  {expanded ? 'Show Less' : `+${salon.services.length - 2} More`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {visibleServices && visibleServices.length > 0 ? (
            visibleServices.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceNameRow}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{service.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.serviceDuration}>⏱ {service.duration_minutes} mins</Text>
                  {service.description ? (
                    <Text style={styles.serviceDesc} numberOfLines={2}>
                      {service.description}
                    </Text>
                  ) : null}
                </View>

                {/* Price & Book Now Button */}
                <View style={styles.priceActionCol}>
                  <Text style={styles.servicePrice}>${Number(service.price).toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.bookNowButton}
                    onPress={() => onBookService(salon, service)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bookNowText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noServicesText}>No services listed at the moment.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    color: COLORS.gold,
    fontSize: 13,
    marginRight: 4,
  },
  ratingText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 12,
  },
  reviewCount: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginLeft: 3,
  },
  cityBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  cityText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.lg,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  address: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  hoursIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  hoursText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  servicesSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  serviceItem: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 6,
  },
  categoryBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  serviceDuration: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  priceActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  bookNowButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
  },
  bookNowText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  noServicesText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});
