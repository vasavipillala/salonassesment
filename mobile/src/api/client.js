/**
 * Salonista API Client
 * Centralized HTTP service for interacting with the Node.js backend.
 */

import { getBaseUrl } from './config';

/**
 * Universal fetch helper with timeout and error parsing
 */
async function apiRequest(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out. Please check if your backend server is running.');
      timeoutErr.status = 408;
      throw timeoutErr;
    }

    // Enhance standard "Network request failed" error with actionable tips
    if (error.message === 'Network request failed') {
      const networkErr = new Error(
        `Unable to reach backend at ${baseUrl}. Ensure backend is running, phone & PC are on same Wi-Fi, and firewall allows port 5000.`
      );
      networkErr.isNetworkError = true;
      throw networkErr;
    }

    throw error;
  }
}

/**
 * API Methods
 */
export const salonApi = {
  // Retrieve all salons with optional search term
  getSalons: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await apiRequest(`/salons${query}`);
  },

  // Retrieve salon details by ID
  getSalonById: async (salonId) => {
    return await apiRequest(`/salons/${salonId}`);
  },

  // Retrieve services for a specific salon
  getSalonServices: async (salonId) => {
    return await apiRequest(`/salons/${salonId}/services`);
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Retrieve bookings for a specific customer
  getCustomerBookings: async (customerId = 1) => {
    return await apiRequest(`/bookings/${customerId}`);
  },

  // Check health and connectivity
  checkHealth: async () => {
    return await apiRequest('/health');
  },
};
