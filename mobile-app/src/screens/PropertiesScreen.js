import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import PropertyCard from '../components/PropertyCard';
import FloatingActionButton from '../components/FloatingActionButton';
import AddPropertyModal from '../components/AddPropertyModal';
import ConnectionPrompt from '../components/ConnectionPrompt';
import { LinearGradient } from 'expo-linear-gradient';
import useBackendConnection from '../hooks/useBackendConnection';
import apiService from '../services/api';

export default function PropertiesScreen({ navigation }) {
  const { isConnected, isChecking, needsSetup, recheckConnection } = useBackendConnection();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProperties = async () => {
    if (!isConnected) return;

    try {
      setError(null);
      const data = await apiService.properties.getAll();

      // Map backend data to expected format
      const formattedProperties = data.map(property => ({
        id: property.id,
        address: property.address,
        city: property.city,
        state: property.state,
        zip: property.zip_code || property.zip,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.square_feet?.toString() || property.sqft?.toString() || 'N/A',
        emoji: getPropertyEmoji(property.property_type),
      }));

      setProperties(formattedProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getPropertyEmoji = (type) => {
    const typeLower = (type || '').toLowerCase();
    if (typeLower.includes('apartment') || typeLower.includes('condo')) return '🏢';
    if (typeLower.includes('townhouse')) return '🏘️';
    return '🏡';
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  useEffect(() => {
    if (isConnected && !isChecking) {
      fetchProperties();
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
              <Text style={styles.logoEmoji}>🏠</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>My Properties</Text>
          </View>
        </View>

        {/* Properties List */}
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
              <Text style={styles.loadingText}>Loading properties...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : properties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No properties found</Text>
              <Text style={styles.emptySubtext}>Add your first property to get started</Text>
            </View>
          ) : (
            properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => navigation.navigate('PropertyDetail', { property })}
              />
            ))
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <FloatingActionButton onPress={() => setShowAddModal(true)} />

        {/* Add Property Modal */}
        <AddPropertyModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchProperties();
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
