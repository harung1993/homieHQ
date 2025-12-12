import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function PropertyCard({ property, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.image}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.imageEmoji}>{property.emoji || '🏡'}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>{property.address}</Text>
        <Text style={styles.subtitle}>
          {property.city}, {property.state} {property.zip}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🛏️</Text>
            <Text style={styles.statText}>{property.bedrooms} bed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🚿</Text>
            <Text style={styles.statText}>{property.bathrooms} bath</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>📐</Text>
            <Text style={styles.statText}>{property.sqft} sqft</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 48,
  },
  content: {
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small + 1,
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIcon: {
    fontSize: 16,
    color: colors.primary,
  },
  statText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
  },
});
