import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import ListItem from '../components/ListItem';
import SectionHeader from '../components/SectionHeader';
import AddApplianceModal from '../components/AddApplianceModal';
import ApplianceDetailsModal from '../components/ApplianceDetailsModal';
import apiService from '../services/api';

export default function AppliancesScreen({ navigation }) {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWarrantyOnly, setShowWarrantyOnly] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedAppliance, setSelectedAppliance] = useState(null);

  const fetchAppliances = async () => {
    try {
      const data = showWarrantyOnly
        ? await apiService.appliances.getExpiringWarranties()
        : await apiService.appliances.getAll();
      setAppliances(data);
    } catch (error) {
      console.error('Error fetching appliances:', error);
      Alert.alert('Error', 'Failed to load appliances');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppliances();
  }, [showWarrantyOnly]);

  useFocusEffect(
    React.useCallback(() => {
      fetchAppliances();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppliances();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 30) return `in ${diffDays} days`;
    if (diffDays < 60) return 'in 1 month';
    return date.toLocaleDateString();
  };

  const getApplianceIcon = (category) => {
    const icons = {
      hvac: '❄️',
      refrigerator: '🧊',
      washer: '🧺',
      dryer: '🌀',
      dishwasher: '🍽️',
      oven: '🔥',
      microwave: '📡',
      water_heater: '💧',
    };
    return icons[category?.toLowerCase()] || '📱';
  };

  const handleAppliancePress = (appliance) => {
    setSelectedAppliance(appliance);
    setDetailsModalVisible(true);
  };

  const handleEditAppliance = () => {
    setDetailsModalVisible(false);
    setModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedAppliance(null);
  };

  const handleCloseAddModal = () => {
    setModalVisible(false);
    setSelectedAppliance(null);
  };

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
              <Text style={styles.logoEmoji}>📱</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Appliances</Text>
          </View>
        </View>

        {/* Filter Toggle */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterPill, !showWarrantyOnly && styles.filterPillActive]}
            onPress={() => setShowWarrantyOnly(false)}
          >
            <Text style={[styles.filterPillText, !showWarrantyOnly && styles.filterPillTextActive]}>
              All Appliances
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, showWarrantyOnly && styles.filterPillActive]}
            onPress={() => setShowWarrantyOnly(true)}
          >
            <Text style={[styles.filterPillText, showWarrantyOnly && styles.filterPillTextActive]}>
              Expiring Warranties
            </Text>
          </TouchableOpacity>
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
              <Text style={styles.loadingText}>Loading appliances...</Text>
            </View>
          ) : appliances.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📱</Text>
              <Text style={styles.emptyText}>No appliances found</Text>
              <Text style={styles.emptySubtext}>
                {showWarrantyOnly
                  ? 'No warranties expiring soon'
                  : 'Start tracking your appliances and warranties'}
              </Text>
            </View>
          ) : (
            <>
              <SectionHeader title={`${appliances.length} ${appliances.length === 1 ? 'Appliance' : 'Appliances'}`} />
              {appliances.map((appliance) => (
                <ListItem
                  key={appliance.id}
                  icon={getApplianceIcon(appliance.category)}
                  title={`${appliance.brand || ''} ${appliance.model || 'Appliance'}`.trim()}
                  subtitle={
                    appliance.warranty_expiry
                      ? `Warranty: ${formatDate(appliance.warranty_expiry)}`
                      : appliance.install_date
                      ? `Installed: ${new Date(appliance.install_date).toLocaleDateString()}`
                      : 'No warranty info'
                  }
                  badge={appliance.category || 'Other'}
                  onPress={() => handleAppliancePress(appliance)}
                />
              ))}
            </>
          )}
        </ScrollView>

        {/* Add Appliance Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setSelectedAppliance(null);
            setModalVisible(true);
          }}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.fabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Appliance Details Modal */}
        <ApplianceDetailsModal
          visible={detailsModalVisible}
          onClose={handleCloseDetailsModal}
          appliance={selectedAppliance}
          onEdit={handleEditAppliance}
        />

        {/* Add/Edit Appliance Modal */}
        <AddApplianceModal
          visible={modalVisible}
          onClose={handleCloseAddModal}
          onSuccess={() => {
            fetchAppliances();
            handleCloseAddModal();
          }}
          applianceToEdit={selectedAppliance}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: spacing.sm,
  },
  filterPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.large,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.semibold,
  },
  filterPillTextActive: {
    color: colors.textPrimary,
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
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: colors.textPrimary,
    fontWeight: '300',
  },
});
