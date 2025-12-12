import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import DocumentListSection from './DocumentListSection';

export default function TenantDetailsModal({ visible, onClose, tenant, onEdit }) {
  if (!tenant) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Tenant Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Tenant Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                  </Text>
                </LinearGradient>
              </View>

              <Text style={styles.name}>
                {tenant.first_name} {tenant.last_name}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{tenant.email || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{tenant.phone || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Property:</Text>
                <Text style={styles.infoValue}>
                  {tenant.property?.address || 'No property assigned'}
                </Text>
              </View>

              {tenant.lease_end && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lease End:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(tenant.lease_end).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {tenant.monthly_rent && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Monthly Rent:</Text>
                  <Text style={styles.infoValue}>${tenant.monthly_rent}</Text>
                </View>
              )}

              {tenant.status && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <Text style={[styles.infoValue, styles.statusText]}>
                    {tenant.status.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Documents & Photos Section */}
            <View style={styles.documentsSection}>
              <DocumentListSection
                tenantId={tenant.id}
                title="Documents & Photos"
                showUploadButton={true}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText} numberOfLines={1}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButtonContainer}
              onPress={() => {
                onClose();
                onEdit();
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryButtonText} numberOfLines={1}>Edit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 24,
    fontWeight: typography.weights.bold,
  },
  content: {
    padding: spacing.xl,
    maxHeight: 500,
  },
  infoCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxlarge,
    fontWeight: typography.weights.bold,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    flex: 1,
    textAlign: 'right',
  },
  statusText: {
    color: colors.success,
  },
  uploadSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  documentsSection: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  secondaryButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  primaryButtonContainer: {
    flex: 1,
  },
  primaryButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
