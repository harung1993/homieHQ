import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

export default function SectionHeader({ title }) {
  return <Text style={styles.header}>{title}</Text>;
}

const styles = StyleSheet.create({
  header: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
});
