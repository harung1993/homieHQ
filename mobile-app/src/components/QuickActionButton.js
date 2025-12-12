import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function QuickActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 150,
    minHeight: 120,
  },
  icon: {
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.small + 1,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
});
