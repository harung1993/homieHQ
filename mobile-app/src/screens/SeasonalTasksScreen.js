import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import SectionHeader from '../components/SectionHeader';
import apiService from '../services/api';

export default function SeasonalTasksScreen({ navigation }) {
  const [checklist, setChecklist] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSeason, setCurrentSeason] = useState('spring');

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  const fetchChecklist = async (season) => {
    try {
      // Capitalize the season name for the API (backend expects 'Spring', 'Summer', etc.)
      const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1);
      const data = await apiService.seasonal.getChecklist(capitalizedSeason);
      // Backend returns an array directly, so wrap it in an object with 'items' property
      setChecklist({ items: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Error fetching seasonal checklist:', error);
      setChecklist({ items: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const season = getCurrentSeason();
    setCurrentSeason(season);
    fetchChecklist(season);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchChecklist(currentSeason);
    }, [currentSeason])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchChecklist(currentSeason);
  };

  const toggleTaskCompletion = async (itemId, currentStatus) => {
    try {
      // Use the toggle endpoint which doesn't need the season or status
      await apiService.seasonal.toggleItem(itemId);
      // Refresh the list
      fetchChecklist(currentSeason);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const getSeasonIcon = (season) => {
    const icons = {
      spring: '🌸',
      summer: '☀️',
      fall: '🍂',
      winter: '❄️',
    };
    return icons[season] || '📋';
  };

  const getSeasonColor = (season) => {
    const colors = {
      spring: '#4CAF50',
      summer: '#FFC107',
      fall: '#FF9800',
      winter: '#2196F3',
    };
    return colors[season] || '#9E9E9E';
  };

  const completedCount = checklist.items.filter(item => item.is_completed).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>{getSeasonIcon(currentSeason)}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Seasonal Tasks</Text>
              <Text style={styles.headerSubtitle}>
                {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Checklist
              </Text>
            </View>
          </View>
        </View>

        {/* Season Selector */}
        <View style={styles.seasonSelector}>
          {['spring', 'summer', 'fall', 'winter'].map((season) => (
            <TouchableOpacity
              key={season}
              style={[
                styles.seasonPill,
                currentSeason === season && { borderColor: getSeasonColor(season) },
              ]}
              onPress={() => {
                setCurrentSeason(season);
                setLoading(true);
                fetchChecklist(season);
              }}
            >
              <Text style={styles.seasonIcon}>{getSeasonIcon(season)}</Text>
              <Text
                style={[
                  styles.seasonText,
                  currentSeason === season && { color: colors.textPrimary },
                ]}
              >
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Bar */}
        {!loading && totalCount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Progress</Text>
              <Text style={styles.progressCount}>
                {completedCount} of {totalCount} completed
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%`, backgroundColor: getSeasonColor(currentSeason) },
                ]}
              />
            </View>
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading checklist...</Text>
            </View>
          ) : checklist.items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>{getSeasonIcon(currentSeason)}</Text>
              <Text style={styles.emptyText}>No tasks for {currentSeason}</Text>
              <Text style={styles.emptySubtext}>
                Seasonal maintenance tasks will appear here
              </Text>
            </View>
          ) : (
            <>
              <SectionHeader title="Tasks" />
              {checklist.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  style={styles.taskItem}
                  onPress={() => toggleTaskCompletion(item.id || index, item.is_completed)}
                >
                  <View style={styles.checkbox}>
                    {item.is_completed && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        item.is_completed && styles.taskTitleCompleted,
                      ]}
                    >
                      {item.task || item.description}
                    </Text>
                    {item.description && item.task && (
                      <Text style={styles.taskDescription}>{item.description}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
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
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
  },
  seasonSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  seasonPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  seasonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  seasonText: {
    fontSize: typography.sizes.tiny,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.semibold,
  },
  progressCount: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.cardBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    marginTop: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskDescription: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    marginTop: 4,
  },
});
