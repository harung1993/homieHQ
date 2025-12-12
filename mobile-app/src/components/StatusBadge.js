import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function StatusBadge({ status, type = 'default' }) {
  const getBackgroundColor = () => {
    switch (type.toLowerCase()) {
      case 'urgent':
        return colors.badgeUrgent;
      case 'high':
        return colors.badgeHigh;
      case 'medium':
        return colors.badgeMedium;
      case 'low':
        return colors.badgeLow;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.semibold,
  },
});
