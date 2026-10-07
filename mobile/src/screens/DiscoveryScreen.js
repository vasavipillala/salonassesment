/**
 * Screen 1 – Salon Discovery
 * Displays: Salon name, Location, Rating, Available services, Service price, "Book Now" button
 * Features: Search field that allows the user to search/filter salons.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { salonApi } from '../api/client';
import SalonCard from '../components/SalonCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useApp } from '../context/AppContext';

export default function DiscoveryScreen({ onOpenSettings }) {
  const { startBooking, backendStatus } = useApp();

  const [salons, setSalons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['All', 'Hair', 'Color', 'Nails', 'Skincare', 'Grooming', 'Spa'];

  const loadSalons = useCallback(async (query = '') => {
    setError(null);
    try {
      const response = await salonApi.getSalons(query);
      if (response && response.data) {
        setSalons(response.data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    loadSalons();
  }, [loadSalons]);

  // Debounced/triggered search
  const handleSearchSubmit = () => {
    setLoading(true);
    loadSalons(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setLoading(true);
    loadSalons('');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSalons(searchQuery);
  };

  // Filter salons by selected category locally
  const filteredSalons = salons.filter((salon) => {
    if (selectedCategory === 'All') return true;
    return salon.services?.some(
      (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search salons, locations, or services..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading && !refreshing ? (
        <LoadingSpinner message="Discovering top salons near you..." />
      ) : error ? (
        <View style={styles.paddedContent}>
          <ErrorMessage
            error={error}
            onRetry={() => loadSalons(searchQuery)}
            onOpenSettings={onOpenSettings}
          />
        </View>
      ) : (
        <FlatList
          data={filteredSalons}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SalonCard
              salon={item}
              onBookService={(salon, service) => startBooking(salon, service)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Salons & Studios'}
              </Text>
              <Text style={styles.listHeaderSubtitle}>
                {filteredSalons.length} salon{filteredSalons.length === 1 ? '' : 's'} available
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💇</Text>
              <Text style={styles.emptyTitle}>No Salons Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search keywords or clear filters to see all partner salons.
              </Text>
              <TouchableOpacity style={styles.resetButton} onPress={handleClearSearch}>
                <Text style={styles.resetButtonText}>View All Salons</Text>
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
  searchSection: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    height: '100%',
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  categoryScroll: {
    paddingBottom: SPACING.xs,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  paddedContent: {
    padding: SPACING.lg,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  listHeader: {
    marginBottom: SPACING.md,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  listHeaderSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 44,
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
  resetButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
  },
  resetButtonText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
});
