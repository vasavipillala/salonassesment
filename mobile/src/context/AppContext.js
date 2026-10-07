/**
 * App State Management Context
 * Manages screen navigation, current customer session, booking flow state,
 * and API synchronization.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { salonApi } from '../api/client';
import { getBaseUrl, setCustomBaseUrl } from '../api/config';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState('discovery');
  const [navHistory, setNavHistory] = useState([]);

  // Active Customer (Alice Johnson as default demo customer)
  const [customer, setCustomer] = useState({
    id: 1,
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1-555-0101',
  });

  // Booking Flow State
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDraft, setBookingDraft] = useState({
    date: getNextAvailableDateString(),
    time: '14:00',
    paymentMethod: 'pay_at_salon',
    notes: '',
  });

  // Confirmed Booking Result (Screen 3)
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Customer Bookings List (Screen 4)
  const [customerBookings, setCustomerBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Backend Health & Connectivity
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy' | 'unreachable' | 'checking'
  const [currentApiUrl, setCurrentApiUrl] = useState(getBaseUrl());

  // Check backend health on mount
  useEffect(() => {
    checkServerConnection();
  }, [currentApiUrl]);

  async function checkServerConnection() {
    setBackendStatus('checking');
    try {
      await salonApi.checkHealth();
      setBackendStatus('healthy');
    } catch (err) {
      setBackendStatus('unreachable');
    }
  }

  function getNextAvailableDateString() {
    const d = new Date();
    // Default to tomorrow or today
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Navigation handlers
  const navigate = (screenName, params = {}) => {
    setNavHistory((prev) => [...prev, currentScreen]);
    if (params.salon) setSelectedSalon(params.salon);
    if (params.service) setSelectedService(params.service);
    if (params.confirmed) setConfirmedBooking(params.confirmed);
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    if (navHistory.length > 0) {
      const prevScreen = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('discovery');
    }
  };

  const startBooking = (salon, service) => {
    setSelectedSalon(salon);
    setSelectedService(service);
    setBookingDraft((prev) => ({
      ...prev,
      paymentMethod: 'pay_at_salon',
    }));
    navigate('booking', { salon, service });
  };

  const updateDraft = (updates) => {
    setBookingDraft((prev) => ({ ...prev, ...updates }));
  };

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await salonApi.getCustomerBookings(customer.id);
      if (response && response.data) {
        setCustomerBookings(response.data);
      }
    } catch (err) {
      console.warn('Failed to load customer bookings:', err.message);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const updateApiBaseUrl = (newUrl) => {
    setCustomBaseUrl(newUrl);
    setCurrentApiUrl(getBaseUrl());
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        navigate,
        goBack,
        customer,
        setCustomer,
        selectedSalon,
        setSelectedSalon,
        selectedService,
        setSelectedService,
        bookingDraft,
        updateDraft,
        confirmedBooking,
        setConfirmedBooking,
        startBooking,
        customerBookings,
        isLoadingBookings,
        fetchBookings,
        backendStatus,
        checkServerConnection,
        currentApiUrl,
        updateApiBaseUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
