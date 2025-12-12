import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import SectionHeader from '../SectionHeader';

export default function SessionSection() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <>
      <SectionHeader title="Session" />
      <TouchableOpacity onPress={handleLogout}>
        <View style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
  },
});
