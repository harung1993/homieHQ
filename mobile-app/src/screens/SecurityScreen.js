import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../styles/theme';
import apiService from '../services/api';

export default function SecurityScreen({ navigation }) {
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
    };
  };

  const handleChangePassword = async () => {
    // Validate inputs
    if (!passwordData.currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!passwordData.newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // Validate password strength
    const validation = validatePassword(passwordData.newPassword);
    if (!validation.isValid) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters and contain uppercase, lowercase, and numbers'
      );
      return;
    }

    try {
      setSaving(true);
      await apiService.auth.updatePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setSaving(false);
    }
  };

  const passwordValidation = validatePassword(passwordData.newPassword);

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
              <Text style={styles.logoEmoji}>🔒</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Security</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <Text style={styles.sectionDescription}>
              Update your password to keep your account secure
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.currentPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, currentPassword: text })
                  }
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.newPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, newPassword: text })
                  }
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              {passwordData.newPassword.length > 0 && (
                <View style={styles.requirements}>
                  <Text style={styles.requirementsTitle}>
                    Password Requirements:
                  </Text>
                  <View style={styles.requirementItem}>
                    <Text
                      style={
                        passwordValidation.minLength
                          ? styles.requirementMet
                          : styles.requirementNotMet
                      }
                    >
                      {passwordValidation.minLength ? '✓' : '○'}
                    </Text>
                    <Text style={styles.requirementText}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Text
                      style={
                        passwordValidation.hasUpperCase
                          ? styles.requirementMet
                          : styles.requirementNotMet
                      }
                    >
                      {passwordValidation.hasUpperCase ? '✓' : '○'}
                    </Text>
                    <Text style={styles.requirementText}>
                      One uppercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Text
                      style={
                        passwordValidation.hasLowerCase
                          ? styles.requirementMet
                          : styles.requirementNotMet
                      }
                    >
                      {passwordValidation.hasLowerCase ? '✓' : '○'}
                    </Text>
                    <Text style={styles.requirementText}>
                      One lowercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Text
                      style={
                        passwordValidation.hasNumber
                          ? styles.requirementMet
                          : styles.requirementNotMet
                      }
                    >
                      {passwordValidation.hasNumber ? '✓' : '○'}
                    </Text>
                    <Text style={styles.requirementText}>One number</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordData.confirmPassword.length > 0 &&
                passwordData.newPassword !== passwordData.confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[
              styles.changeButton,
              saving && styles.changeButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={saving}
          >
            <LinearGradient
              colors={
                saving
                  ? [colors.cardBorder, colors.cardBorder]
                  : [colors.gradientStart, colors.gradientEnd]
              }
              style={styles.changeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.changeButtonText}>Change Password</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: spacing.md,
  },
  eyeIcon: {
    fontSize: 20,
  },
  requirements: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requirementMet: {
    color: colors.success,
    marginRight: spacing.sm,
    fontSize: typography.sizes.medium,
  },
  requirementNotMet: {
    color: colors.textSecondary,
    marginRight: spacing.sm,
    fontSize: typography.sizes.medium,
  },
  requirementText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.sizes.small,
    color: colors.error,
    marginTop: spacing.sm,
  },
  changeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  changeButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
});
