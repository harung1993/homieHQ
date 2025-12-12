import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import ListItem from '../components/ListItem';
import SectionHeader from '../components/SectionHeader';
import FloatingActionButton from '../components/FloatingActionButton';
import AddMaintenanceModal from '../components/AddMaintenanceModal';
import ConnectionPrompt from '../components/ConnectionPrompt';
import useBackendConnection from '../hooks/useBackendConnection';
import apiService from '../services/api';

export default function MaintenanceScreen({ navigation }) {
  const { isConnected, isChecking, needsSetup, recheckConnection } = useBackendConnection();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTasks = async () => {
    if (!isConnected) return;

    try {
      setError(null);
      const data = await apiService.maintenance.getAll();

      // Map backend data to expected format
      const formattedTasks = data.map(task => ({
        id: task.id,
        icon: getPriorityIcon(task.priority),
        title: task.title || task.description,
        subtitle: `${task.property?.address || 'Unknown'} • ${formatDate(task.due_date || task.created_at)}`,
        badge: task.priority || task.status,
        badgeType: getPriorityType(task.priority),
        dueDate: new Date(task.due_date || task.created_at),
        priority: task.priority,
      }));

      setTasks(formattedTasks);
    } catch (err) {
      console.error('Error fetching maintenance tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getPriorityIcon = (priority) => {
    const priorityLower = (priority || '').toLowerCase();
    if (priorityLower === 'urgent') return '🚨';
    if (priorityLower === 'high') return '🔧';
    if (priorityLower === 'medium') return '🏠';
    return '🌿';
  };

  const getPriorityType = (priority) => {
    const priorityLower = (priority || '').toLowerCase();
    if (priorityLower === 'urgent') return 'urgent';
    if (priorityLower === 'high') return 'high';
    if (priorityLower === 'medium') return 'medium';
    return 'low';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    return `Due ${date.toLocaleDateString()}`;
  };

  const categorizedTasks = () => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const urgent = tasks.filter(t => t.priority?.toLowerCase() === 'urgent');
    const thisWeek = tasks.filter(t => {
      return t.priority?.toLowerCase() !== 'urgent' &&
             t.dueDate <= weekFromNow &&
             t.dueDate >= now;
    });
    const scheduled = tasks.filter(t => {
      return t.priority?.toLowerCase() !== 'urgent' &&
             t.dueDate > weekFromNow;
    });

    return { urgent, thisWeek, scheduled };
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  useEffect(() => {
    if (isConnected && !isChecking) {
      fetchTasks();
    }
  }, [isConnected, isChecking]);

  if (needsSetup && !isChecking) {
    return (
      <ConnectionPrompt
        visible={true}
        onConfigure={() => navigation.navigate('Settings')}
        onRetry={recheckConnection}
      />
    );
  }

  const { urgent, thisWeek, scheduled } = categorizedTasks();

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
              <Text style={styles.logoEmoji}>🔧</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Maintenance</Text>
          </View>
        </View>

        {/* Tasks List */}
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
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No maintenance tasks</Text>
              <Text style={styles.emptySubtext}>All caught up!</Text>
            </View>
          ) : (
            <>
              {urgent.length > 0 && (
                <>
                  <SectionHeader title="Urgent" />
                  {urgent.map((task) => (
                    <ListItem
                      key={task.id}
                      icon={task.icon}
                      title={task.title}
                      subtitle={task.subtitle}
                      badge={task.badge}
                      badgeType={task.badgeType}
                      onPress={() => {}}
                    />
                  ))}
                </>
              )}

              {thisWeek.length > 0 && (
                <>
                  <SectionHeader title="This Week" />
                  {thisWeek.map((task) => (
                    <ListItem
                      key={task.id}
                      icon={task.icon}
                      title={task.title}
                      subtitle={task.subtitle}
                      badge={task.badge}
                      badgeType={task.badgeType}
                      onPress={() => {}}
                    />
                  ))}
                </>
              )}

              {scheduled.length > 0 && (
                <>
                  <SectionHeader title="Scheduled" />
                  {scheduled.map((task) => (
                    <ListItem
                      key={task.id}
                      icon={task.icon}
                      title={task.title}
                      subtitle={task.subtitle}
                      badge={task.badge}
                      badgeType={task.badgeType}
                      onPress={() => {}}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <FloatingActionButton onPress={() => setShowAddModal(true)} />

        {/* Add Maintenance Modal */}
        <AddMaintenanceModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchTasks();
          }}
        />
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
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.medium,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
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
  },
});
