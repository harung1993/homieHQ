import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_BASE_URL } from '../../config/api';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import SectionHeader from '../SectionHeader';

export default function ServerConfiguration() {
  const [serverUrl, setServerUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
      setServerUrl(savedUrl || API_BASE_URL);
    } catch (error) {
      console.error('Error loading server URL:', error);
      setServerUrl(API_BASE_URL);
    }
  };

  const saveServerUrl = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid server URL');
      return;
    }

    setIsSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_URL, serverUrl.trim());
      Alert.alert(
        'Success',
        'Server URL saved successfully! Go back to Home screen to reconnect.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving server URL:', error);
      Alert.alert('Error', 'Failed to save server URL');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.API_URL);
      setServerUrl(API_BASE_URL);
      Alert.alert('Success', 'Reset to default server URL');
    } catch (error) {
      console.error('Error resetting server URL:', error);
    }
  };

  return (
    <>
      <SectionHeader title="Server Configuration" />
      <View style={styles.serverConfigCard}>
        <Text style={styles.label}>Backend Server URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.100:5008/api"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>
          Example: http://192.168.68.119:5008/api
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={saveServerUrl}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetToDefault}
          >
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  serverConfigCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.sizes.small,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  primaryButton: {
    // No additional styles needed, gradient handles it
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
  },
});
