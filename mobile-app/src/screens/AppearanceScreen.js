import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../styles/theme';
import apiService from '../services/api';

export default function AppearanceScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    layout: 'card',
  });

  useEffect(() => {
    loadAppearanceSettings();
  }, []);

  const loadAppearanceSettings = async () => {
    try {
      setLoading(true);
      const settings = await apiService.settings.get();
      if (settings.appearance) {
        setAppearance({
          theme: settings.appearance.theme || 'dark',
          layout: settings.appearance.layout || 'card',
        });
      }
    } catch (error) {
      console.error('Error loading appearance settings:', error);
      Alert.alert('Error', 'Failed to load appearance settings');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (theme) => {
    const newAppearance = { ...appearance, theme };
    setAppearance(newAppearance);

    try {
      setSaving(true);
      await apiService.settings.updateAppearance(newAppearance);
      Alert.alert('Theme Updated', 'Theme changes will be applied in a future update');
    } catch (error) {
      console.error('Error updating theme:', error);
      setAppearance(appearance);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update theme'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLayoutChange = async (layout) => {
    const newAppearance = { ...appearance, layout };
    setAppearance(newAppearance);

    try {
      setSaving(true);
      await apiService.settings.updateAppearance(newAppearance);
      Alert.alert('Layout Updated', 'Layout changes will be applied in a future update');
    } catch (error) {
      console.error('Error updating layout:', error);
      setAppearance(appearance);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update layout'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>🎨</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Appearance</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Theme Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme</Text>
            <Text style={styles.sectionDescription}>
              Choose your preferred color scheme
            </Text>

            <TouchableOpacity
              style={[
                styles.option,
                appearance.theme === 'light' && styles.optionSelected,
              ]}
              onPress={() => handleThemeChange('light')}
              disabled={saving}
            >
              <View style={styles.optionContent}>
                <View style={styles.themePreview}>
                  <View style={[styles.themeBox, styles.lightTheme]} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Light</Text>
                  <Text style={styles.optionDescription}>
                    Bright and clean interface
                  </Text>
                </View>
              </View>
              {appearance.theme === 'light' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                appearance.theme === 'dark' && styles.optionSelected,
              ]}
              onPress={() => handleThemeChange('dark')}
              disabled={saving}
            >
              <View style={styles.optionContent}>
                <View style={styles.themePreview}>
                  <View style={[styles.themeBox, styles.darkTheme]} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Dark</Text>
                  <Text style={styles.optionDescription}>
                    Easy on the eyes, perfect for night
                  </Text>
                </View>
              </View>
              {appearance.theme === 'dark' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                appearance.theme === 'auto' && styles.optionSelected,
              ]}
              onPress={() => handleThemeChange('auto')}
              disabled={saving}
            >
              <View style={styles.optionContent}>
                <View style={styles.themePreview}>
                  <View style={[styles.themeBox, styles.autoTheme]} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Auto</Text>
                  <Text style={styles.optionDescription}>
                    Matches your system settings
                  </Text>
                </View>
              </View>
              {appearance.theme === 'auto' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Layout Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dashboard Layout</Text>
            <Text style={styles.sectionDescription}>
              Choose how you want to view your dashboard
            </Text>

            <TouchableOpacity
              style={[
                styles.option,
                appearance.layout === 'card' && styles.optionSelected,
              ]}
              onPress={() => handleLayoutChange('card')}
              disabled={saving}
            >
              <View style={styles.optionContent}>
                <Text style={styles.layoutEmoji}>📱</Text>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Card View</Text>
                  <Text style={styles.optionDescription}>
                    Modern card-based layout
                  </Text>
                </View>
              </View>
              {appearance.layout === 'card' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                appearance.layout === 'compact' && styles.optionSelected,
              ]}
              onPress={() => handleLayoutChange('compact')}
              disabled={saving}
            >
              <View style={styles.optionContent}>
                <Text style={styles.layoutEmoji}>📋</Text>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Compact View</Text>
                  <Text style={styles.optionDescription}>
                    More information in less space
                  </Text>
                </View>
              </View>
              {appearance.layout === 'compact' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          </View>

          {saving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 20,
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  optionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themePreview: {
    marginRight: spacing.md,
  },
  themeBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  lightTheme: {
    backgroundColor: '#FFFFFF',
  },
  darkTheme: {
    backgroundColor: '#1A1A1A',
  },
  autoTheme: {
    background: 'linear-gradient(to bottom, #FFFFFF 50%, #1A1A1A 50%)',
    backgroundColor: '#1A1A1A',
  },
  layoutEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  savingText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
});
