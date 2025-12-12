import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import apiService from '../services/api';
import { API_BASE_URL } from '../config/api';

export default function ServerSettingsScreen({ navigation }) {
  const [customUrl, setCustomUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState(API_BASE_URL);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    const savedUrl = await apiService.settings.getCustomApiUrl();
    if (savedUrl) {
      setCustomUrl(savedUrl);
      setCurrentUrl(savedUrl);
    } else {
      setCurrentUrl(API_BASE_URL);
    }
  };

  const handleSaveUrl = async () => {
    if (!customUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    // Basic URL validation
    if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      Alert.alert(
        'Invalid URL',
        'URL must start with http:// or https://\n\nExample: http://192.168.1.100:5000/api'
      );
      return;
    }

    setLoading(true);
    try {
      await apiService.settings.setCustomApiUrl(customUrl);
      setCurrentUrl(customUrl);
      Alert.alert(
        'Success',
        'Server URL updated successfully. Please restart the app for changes to take effect.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save server URL');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    Alert.alert(
      'Reset to Default',
      `Reset server URL to default?\n\n${API_BASE_URL}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await apiService.settings.clearCustomApiUrl();
            setCustomUrl('');
            setCurrentUrl(API_BASE_URL);
            Alert.alert('Success', 'Server URL reset to default');
          },
        },
      ]
    );
  };

  const handleTestConnection = async () => {
    const testUrl = customUrl.trim() || currentUrl;

    Alert.alert(
      'Test Connection',
      `Testing connection to:\n${testUrl}\n\nThis feature will attempt to connect to the server.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: () => {
            // TODO: Implement actual connection test
            Alert.alert('Info', 'Connection test coming soon!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Server Settings</Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Server Configuration</Text>
              <Text style={styles.infoText}>
                Configure the API server URL to connect to your PropertyPal backend.
              </Text>
            </View>
          </View>

          {/* Current URL */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Server URL</Text>
            <View style={styles.currentUrlCard}>
              <Text style={styles.currentUrl}>{currentUrl}</Text>
            </View>
          </View>

          {/* Custom URL Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Server URL</Text>
            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.100:5000/api"
              placeholderTextColor={colors.textSecondary}
              value={customUrl}
              onChangeText={setCustomUrl}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <Text style={styles.hint}>
              Enter your server's IP address and port. Common formats:
            </Text>
            <Text style={styles.exampleText}>• http://192.168.1.100:5000/api (Local network)</Text>
            <Text style={styles.exampleText}>• http://10.0.2.2:5000/api (Android emulator)</Text>
            <Text style={styles.exampleText}>• http://localhost:5000/api (iOS simulator)</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButtonContainer}
            onPress={handleSaveUrl}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>Save Custom URL</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleTestConnection}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Test Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetToDefault}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>Reset to Default</Text>
          </TouchableOpacity>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              1. Make sure your backend server is running{'\n'}
              2. Check that your device is on the same network{'\n'}
              3. Find your computer's IP address in network settings{'\n'}
              4. Use the correct port (usually 5000 for Flask)
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 10,
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxlarge,
    fontWeight: typography.weights.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    lineHeight: 18,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  currentUrlCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  currentUrl: {
    color: colors.primary,
    fontSize: typography.sizes.small,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  input: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    marginBottom: spacing.sm,
  },
  exampleText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  primaryButtonContainer: {
    marginBottom: spacing.md,
  },
  primaryButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
  },
  secondaryButton: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
  },
  resetButton: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.error,
    fontSize: typography.sizes.body,
  },
  helpSection: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  helpTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    lineHeight: 20,
  },
});
