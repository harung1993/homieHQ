import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import StatusBadge from './StatusBadge';

export default function ListItem({
  icon,
  title,
  subtitle,
  badge,
  badgeType,
  rightContent,
  gradientColors,
  onPress,
}) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <LinearGradient
        colors={gradientColors || [colors.gradientStart, colors.gradientEnd]}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.icon}>{icon}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {badge && <StatusBadge status={badge} type={badgeType} />}
      {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
  },
  rightContent: {
    marginLeft: 'auto',
  },
});
