import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import ListItem from '../components/ListItem';
import SectionHeader from '../components/SectionHeader';
import QuickActionButton from '../components/QuickActionButton';
import FloatingActionButton from '../components/FloatingActionButton';
import AddTenantModal from '../components/AddTenantModal';
import TenantDetailsModal from '../components/TenantDetailsModal';
import ConnectionPrompt from '../components/ConnectionPrompt';
import useBackendConnection from '../hooks/useBackendConnection';
import apiService from '../services/api';

export default function TenantsScreen({ navigation }) {
  const { isConnected, isChecking, needsSetup, recheckConnection } = useBackendConnection();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [rawTenants, setRawTenants] = useState([]);

  const fetchTenants = async () => {
    if (!isConnected) return;

    try {
      setError(null);
      const data = await apiService.tenants.getAll();

      // Store raw tenant data for editing
      setRawTenants(data);

      // Map backend data to expected format for display
      const formattedTenants = data.map(tenant => {
        const leaseStatus = getLeaseStatus(tenant.lease_end_date);
        return {
          id: tenant.id,
          icon: '👤',
          name: `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || tenant.name || 'Unknown',
          property: tenant.property?.address || 'No property',
          lease: tenant.lease_end_date ? `Lease until ${formatLeaseDate(tenant.lease_end_date)}` : 'No lease',
          status: leaseStatus.status,
          leaseEndDate: tenant.lease_end_date ? new Date(tenant.lease_end_date) : null,
        };
      });

      setTenants(formattedTenants);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getLeaseStatus = (leaseEndDate) => {
    if (!leaseEndDate) return { status: 'unknown', isExpiring: false };

    const endDate = new Date(leaseEndDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30;

    if (diffDays < 0) {
      return { status: 'expired', isExpiring: true };
    } else if (diffMonths < 3) {
      return { status: 'expiring', isExpiring: true };
    } else {
      return { status: 'good', isExpiring: false };
    }
  };

  const formatLeaseDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const expiringTenants = tenants.filter(t => t.status === 'expiring' || t.status === 'expired');
  const activeTenants = tenants.filter(t => t.status === 'good' || t.status === 'expiring');

  const handleTenantPress = (tenantId) => {
    // Find the raw tenant data by id
    const tenant = rawTenants.find(t => t.id === tenantId);
    if (tenant) {
      setSelectedTenant(tenant);
      setShowDetailsModal(true);
    }
  };

  const handleEditTenant = () => {
    // Close details modal and open edit modal
    setShowDetailsModal(false);
    setShowAddModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTenant(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedTenant(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenants();
  };

  useEffect(() => {
    if (isConnected && !isChecking) {
      fetchTenants();
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
              <Text style={styles.logoEmoji}>👥</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Tenants</Text>
          </View>
        </View>

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
              <Text style={styles.loadingText}>Loading tenants...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : tenants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tenants found</Text>
              <Text style={styles.emptySubtext}>Add your first tenant to get started</Text>
            </View>
          ) : (
            <>
              {/* Active Tenants */}
              <SectionHeader title="Active Tenants" />
              {activeTenants.map((tenant) => (
                <ListItem
                  key={tenant.id}
                  icon={tenant.icon}
                  title={tenant.name}
                  subtitle={`${tenant.property} • ${tenant.lease}`}
                  gradientColors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
                  rightContent={
                    <Text style={styles.statusIcon}>
                      {tenant.status === 'good' ? '✓' : '⚠️'}
                    </Text>
                  }
                  onPress={() => handleTenantPress(tenant.id)}
                />
              ))}

              {/* Lease Expiring Soon Alert */}
              {expiringTenants.length > 0 && (
                <>
                  <SectionHeader title="Lease Expiring Soon" />
                  {expiringTenants.map((tenant) => (
                    <View key={tenant.id} style={styles.alertCard}>
                      <View style={styles.alertHeader}>
                        <LinearGradient
                          colors={[colors.warning, '#d97706']}
                          style={styles.alertIcon}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.alertEmoji}>⏰</Text>
                        </LinearGradient>
                        <View style={styles.alertContent}>
                          <Text style={styles.alertName}>{tenant.name}</Text>
                          <Text style={styles.alertProperty}>{tenant.property}</Text>
                        </View>
                      </View>
                      <Text style={styles.alertMessage}>
                        {tenant.status === 'expired'
                          ? '⚠️ Lease has expired'
                          : `⚠️ ${tenant.lease}`}
                      </Text>
                    </View>
                  ))}
                </>
              )}

              {/* Quick Actions */}
              <SectionHeader title="Quick Actions" />
              <View style={styles.quickActions}>
                <QuickActionButton
                  icon="📧"
                  label="Message"
                  onPress={() => {}}
                />
                <QuickActionButton
                  icon="📋"
                  label="Add Note"
                  onPress={() => {}}
                />
                <QuickActionButton
                  icon="📄"
                  label="Documents"
                  onPress={() => {}}
                />
              </View>
            </>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <FloatingActionButton onPress={() => {
          setSelectedTenant(null);
          setShowAddModal(true);
        }} />

        {/* Tenant Details Modal */}
        <TenantDetailsModal
          visible={showDetailsModal}
          onClose={handleCloseDetailsModal}
          tenant={selectedTenant}
          onEdit={handleEditTenant}
        />

        {/* Add/Edit Tenant Modal */}
        <AddTenantModal
          visible={showAddModal}
          onClose={handleCloseAddModal}
          onSuccess={() => {
            fetchTenants();
            handleCloseAddModal();
          }}
          tenantToEdit={selectedTenant}
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
  statusIcon: {
    fontSize: 20,
    color: colors.success,
  },
  alertCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertEmoji: {
    fontSize: 20,
  },
  alertContent: {
    flex: 1,
  },
  alertName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  alertProperty: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
  },
  alertMessage: {
    color: colors.warning,
    fontSize: typography.sizes.small + 1,
    fontWeight: typography.weights.semibold,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
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
