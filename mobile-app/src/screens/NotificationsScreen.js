import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../styles/theme';
import apiService from '../services/api';

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    maintenance: true,
    payment: true,
    project: true,
    document: true,
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const settings = await apiService.settings.get();
      if (settings.notifications) {
        setNotifications({
          email: settings.notifications.email ?? true,
          maintenance: settings.notifications.maintenance ?? true,
          payment: settings.notifications.payment ?? true,
          project: settings.notifications.project ?? true,
          document: settings.notifications.document ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(newNotifications);

    try {
      setSaving(true);
      await apiService.settings.updateNotifications(newNotifications);
    } catch (error) {
      console.error('Error updating notifications:', error);
      // Revert the change
      setNotifications(notifications);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update notification settings'
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
              <Text style={styles.logoEmoji}>🔔</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            <Text style={styles.sectionDescription}>
              Choose what notifications you want to receive
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive email updates and alerts
                </Text>
              </View>
              <Switch
                value={notifications.email}
                onValueChange={() => handleToggle('email')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.white}
                disabled={saving}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Maintenance Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified about upcoming maintenance tasks
                </Text>
              </View>
              <Switch
                value={notifications.maintenance}
                onValueChange={() => handleToggle('maintenance')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.white}
                disabled={saving}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Payment Reminders</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications for payment due dates
                </Text>
              </View>
              <Switch
                value={notifications.payment}
                onValueChange={() => handleToggle('payment')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.white}
                disabled={saving}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Project Updates</Text>
                <Text style={styles.settingDescription}>
                  Stay informed about project progress and changes
                </Text>
              </View>
              <Switch
                value={notifications.project}
                onValueChange={() => handleToggle('project')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.white}
                disabled={saving}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Document Updates</Text>
                <Text style={styles.settingDescription}>
                  Get notified when documents are added or expire
                </Text>
              </View>
              <Switch
                value={notifications.document}
                onValueChange={() => handleToggle('document')}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor={colors.white}
                disabled={saving}
              />
            </View>
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
  settingItem: {
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
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
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
