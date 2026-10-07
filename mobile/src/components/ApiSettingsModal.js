/**
 * API Connection Settings Modal
 * Direct solution for Part E: allows user to easily switch between localhost,
 * Android emulator (10.0.2.2), host LAN IP, or ngrok tunnel right from the phone.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function ApiSettingsModal({ visible, onClose }) {
  const { currentApiUrl, updateApiBaseUrl, checkServerConnection, backendStatus } = useApp();
  const [inputUrl, setInputUrl] = useState(currentApiUrl);
  const [isTesting, setIsTesting] = useState(false);

  const presets = [
    { label: 'Web / Mac Simulator', url: 'http://localhost:5000' },
    { label: 'Android Emulator', url: 'http://10.0.2.2:5000' },
    { label: 'Physical Phone (LAN)', url: 'http://192.168.1.48:5000' },
  ];

  const handleSave = async () => {
    updateApiBaseUrl(inputUrl);
    setIsTesting(true);
    await checkServerConnection();
    setIsTesting(false);
    onClose();
  };

  const handleSelectPreset = (url) => {
    setInputUrl(url);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Backend Connection Setup</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            If running on a physical mobile device, localhost won't work. Select your LAN IP address below or enter your tunnel URL:
          </Text>

          {/* Quick Presets */}
          <Text style={styles.label}>Quick Presets:</Text>
          <View style={styles.presetContainer}>
            {presets.map((p) => (
              <TouchableOpacity
                key={p.url}
                style={[styles.presetChip, inputUrl === p.url && styles.presetChipActive]}
                onPress={() => handleSelectPreset(p.url)}
              >
                <Text style={[styles.presetText, inputUrl === p.url && styles.presetTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Input */}
          <Text style={styles.label}>Backend Base URL:</Text>
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="http://192.168.1.48:5000"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Status: </Text>
            <Text
              style={[
                styles.statusValue,
                backendStatus === 'healthy' ? styles.statusHealthy : styles.statusOffline,
              ]}
            >
              {backendStatus === 'healthy' ? 'CONNECTED (Port 5000)' : 'UNREACHABLE'}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isTesting}>
              <Text style={styles.saveText}>{isTesting ? 'Testing...' : 'Save & Connect'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 440,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  presetChip: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusHealthy: {
    color: COLORS.success,
  },
  statusOffline: {
    color: COLORS.danger,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.md,
  },
  saveText: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
});
