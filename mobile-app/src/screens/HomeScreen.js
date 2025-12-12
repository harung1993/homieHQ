import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../styles/theme';
import WelcomeCard from '../components/WelcomeCard';
import QuickActionButton from '../components/QuickActionButton';
import ListItem from '../components/ListItem';
import SectionHeader from '../components/SectionHeader';
import ConnectionPrompt from '../components/ConnectionPrompt';
import useBackendConnection from '../hooks/useBackendConnection';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { isConnected, isChecking, needsSetup, recheckConnection} = useBackendConnection();
  const [tasks, setTasks] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [seasonalTasks, setSeasonalTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  const fetchData = async () => {
    if (!isConnected) return;

    try {
      setError(null);

      // Fetch all data in parallel
      const currentSeason = getCurrentSeason();
      // Capitalize the season name for the API (backend expects 'Spring', 'Summer', etc.)
      const capitalizedSeason = currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1);

      const [maintenanceData, warrantiesData, projectsData, seasonalData] = await Promise.all([
        apiService.maintenance.getAll().catch(() => []),
        apiService.appliances.getExpiringWarranties().catch(() => []),
        apiService.projects.getByStatus('in_progress').catch(() => []),
        apiService.seasonal.getChecklist(capitalizedSeason).catch(() => ({ items: [] })),
      ]);

      // Map maintenance data to task format
      const formattedTasks = maintenanceData.slice(0, 5).map(item => ({
        id: item.id,
        icon: getPriorityIcon(item.priority),
        title: item.title || item.description,
        subtitle: item.due_date ? `Due ${formatDate(item.due_date)}` : item.status,
        badge: item.priority || item.status,
        badgeType: getPriorityType(item.priority),
      }));

      // Format warranties
      const formattedWarranties = warrantiesData.slice(0, 3).map(appliance => ({
        id: appliance.id,
        icon: '📱',
        title: `${appliance.brand || ''} ${appliance.model || 'Appliance'}`.trim(),
        subtitle: appliance.warranty_expiry ? `Warranty expires ${formatDate(appliance.warranty_expiry)}` : 'No warranty date',
        badge: appliance.category,
      }));

      // Format projects
      const formattedProjects = projectsData.slice(0, 3).map(project => ({
        id: project.id,
        icon: '🏗️',
        title: project.title || project.name,
        subtitle: project.budget ? `Budget: $${project.budget}` : project.status,
        badge: project.status,
        badgeType: project.status === 'in_progress' ? 'medium' : 'low',
      }));

      // Format seasonal tasks (only incomplete ones)
      // Backend returns an array directly, not an object with 'items'
      const seasonalArray = Array.isArray(seasonalData) ? seasonalData : [];
      const incompleteSeasonal = seasonalArray
        .filter(item => !item.is_completed)
        .slice(0, 3)
        .map((item, index) => ({
          id: item.id || index,
          icon: '📋',
          title: item.task || item.description,
          subtitle: `${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} task`,
          badge: 'seasonal',
        }));

      setTasks(formattedTasks);
      setWarranties(formattedWarranties);
      setProjects(formattedProjects);
      setSeasonalTasks(incompleteSeasonal);
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getPriorityIcon = (priority) => {
    const priorityLower = (priority || '').toLowerCase();
    if (priorityLower === 'urgent' || priorityLower === 'high') return '🚨';
    if (priorityLower === 'medium') return '🏠';
    return '🔧';
  };

  const getPriorityType = (priority) => {
    const priorityLower = (priority || '').toLowerCase();
    if (priorityLower === 'urgent') return 'urgent';
    if (priorityLower === 'high') return 'high';
    if (priorityLower === 'medium') return 'medium';
    return 'low';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    if (diffDays < 14) return 'in 1 week';
    return date.toLocaleDateString();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    if (isConnected && !isChecking) {
      fetchData();
      setShowPrompt(false);
    } else if (needsSetup && !isChecking) {
      setShowPrompt(true);
    }
  }, [isConnected, isChecking, needsSetup]);

  // Recheck connection when screen is focused (e.g., after configuring in Settings)
  useFocusEffect(
    React.useCallback(() => {
      recheckConnection();
    }, [])
  );

  const handleConfigure = () => {
    setShowPrompt(false);
    navigation.navigate('Settings');
  };

  const handleRetry = async () => {
    await recheckConnection();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          <WelcomeCard
            title={user ? `Welcome back, ${user.first_name || user.name || user.email}!` : "Welcome back!"}
            subtitle="Here's your property overview"
          />

          <SectionHeader title="Quick Actions" />
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="🏠"
              label="Properties"
              onPress={() => navigation.navigate('Properties')}
            />
            <QuickActionButton
              icon="👥"
              label="Tenants"
              onPress={() => navigation.navigate('Tenants')}
            />
            <QuickActionButton
              icon="📋"
              label="Maintenance"
              onPress={() => navigation.navigate('Maintenance')}
            />
            <QuickActionButton
              icon="📄"
              label="Documents"
              onPress={() => navigation.navigate('DocumentsTab')}
            />
          </View>

          <SectionHeader title="Upcoming Tasks" />

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
              <Text style={styles.emptyText}>✨ No upcoming tasks</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <ListItem
                key={task.id}
                icon={task.icon}
                title={task.title}
                subtitle={task.subtitle}
                badge={task.badge}
                badgeType={task.badgeType}
                onPress={() => navigation.navigate('Maintenance')}
              />
            ))
          )}

          {/* Expiring Warranties Section */}
          {!loading && warranties.length > 0 && (
            <>
              <SectionHeader title="Expiring Warranties" />
              {warranties.map((warranty) => (
                <ListItem
                  key={warranty.id}
                  icon={warranty.icon}
                  title={warranty.title}
                  subtitle={warranty.subtitle}
                  badge={warranty.badge}
                />
              ))}
            </>
          )}

          {/* Active Projects Section */}
          {!loading && projects.length > 0 && (
            <>
              <SectionHeader title="Active Projects" />
              {projects.map((project) => (
                <ListItem
                  key={project.id}
                  icon={project.icon}
                  title={project.title}
                  subtitle={project.subtitle}
                  badge={project.badge}
                  badgeType={project.badgeType}
                />
              ))}
            </>
          )}

          {/* Seasonal Maintenance Section */}
          {!loading && seasonalTasks.length > 0 && (
            <>
              <SectionHeader title={`${getCurrentSeason().charAt(0).toUpperCase() + getCurrentSeason().slice(1)} Maintenance`} />
              {seasonalTasks.map((task) => (
                <ListItem
                  key={task.id}
                  icon={task.icon}
                  title={task.title}
                  subtitle={task.subtitle}
                  badge={task.badge}
                  onPress={() => navigation.navigate('SeasonalTab')}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <ConnectionPrompt
        visible={showPrompt}
        onConfigure={handleConfigure}
        onRetry={handleRetry}
        onDismiss={handleDismiss}
      />
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
  content: {
    padding: spacing.xl,
    paddingTop: 50,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
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
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
  },
});
