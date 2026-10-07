/**
 * API Configuration Module
 * Dynamically resolves the API Host based on environment (Web, Emulator, Physical Device)
 * Addresses Part E debugging requirements directly.
 */

import { Platform } from 'react-native';

// Default LAN IP detected from host development computer
const DEFAULT_LAN_IP = '192.168.1.48';
const DEFAULT_PORT = '5000';

let customBaseUrl = null;

export const getBaseUrl = () => {
  if (customBaseUrl) {
    return customBaseUrl;
  }

  // Check Expo Public Environment Variable if set
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Platform-specific defaults
  if (Platform.OS === 'web') {
    return `http://localhost:${DEFAULT_PORT}`;
  }

  if (Platform.OS === 'android') {
    // Note: If running on physical Android device over Wi-Fi, LAN IP is needed.
    // If running in Android Studio emulator, 10.0.2.2 points to host.
    return `http://${DEFAULT_LAN_IP}:${DEFAULT_PORT}`;
  }

  if (Platform.OS === 'ios') {
    // Physical iPhone uses LAN IP; simulator can use localhost
    return `http://${DEFAULT_LAN_IP}:${DEFAULT_PORT}`;
  }

  return `http://localhost:${DEFAULT_PORT}`;
};

export const setCustomBaseUrl = (url) => {
  if (url && typeof url === 'string') {
    // Strip trailing slash if present
    customBaseUrl = url.trim().replace(/\/+$/, '');
  } else {
    customBaseUrl = null;
  }
};
