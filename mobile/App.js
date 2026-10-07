/**
 * Salonista Mobile Application Root
 * Beauty & Salon Discovery and Booking Marketplace
 */

import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import Navbar from './src/components/Navbar';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import BookingScreen from './src/screens/BookingScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ApiSettingsModal from './src/components/ApiSettingsModal';
import { COLORS } from './src/theme/colors';

function MainNavigator() {
  const { currentScreen } = useApp();
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />
      
      {/* Top Navbar */}
      <Navbar onOpenSettings={() => setSettingsVisible(true)} />

      {/* Screen Router */}
      <View style={styles.screenContainer}>
        {currentScreen === 'discovery' && (
          <DiscoveryScreen onOpenSettings={() => setSettingsVisible(true)} />
        )}
        {currentScreen === 'booking' && <BookingScreen />}
        {currentScreen === 'confirmation' && <ConfirmationScreen />}
        {currentScreen === 'my_bookings' && (
          <MyBookingsScreen onOpenSettings={() => setSettingsVisible(true)} />
        )}
      </View>

      {/* Connection Settings Modal */}
      <ApiSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.card,
    ...Platform.select({
      web: {
        maxWidth: 520,
        marginHorizontal: 'auto',
        width: '100%',
        minHeight: '100vh',
        boxShadow: '0 0 20px rgba(0,0,0,0.08)',
      },
    }),
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
