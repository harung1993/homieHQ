import React from 'react';
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

export default function ApplianceDetailsModal({ visible, onClose, appliance, onEdit }) {
  if (!appliance) return null;

  const getApplianceIcon = (type) => {
    const icons = {
      'HVAC': '❄️',
      'Plumbing': '🚰',
      'Electrical': '⚡',
      'Kitchen': '🍳',
      'Laundry': '👕',
      'Other': '🔧',
    };
    return icons[type] || '🔧';
  };

  const getWarrantyStatus = () => {
    if (!appliance.warranty_expiration) return { text: 'No warranty info', color: colors.textSecondary };

    const expirationDate = new Date(appliance.warranty_expiration);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Expired', color: colors.error };
    } else if (diffDays < 90) {
      return { text: `Expires in ${diffDays} days`, color: colors.warning };
    } else {
      return { text: `Valid until ${expirationDate.toLocaleDateString()}`, color: colors.success };
    }
  };

  const warrantyStatus = getWarrantyStatus();

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
            <Text style={styles.title}>Appliance Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Appliance Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.iconCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.iconText}>
                    {getApplianceIcon(appliance.type)}
                  </Text>
                </LinearGradient>
              </View>

              <Text style={styles.name}>{appliance.name}</Text>
              <Text style={styles.type}>{appliance.type}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Brand:</Text>
                <Text style={styles.infoValue}>{appliance.brand || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Model:</Text>
                <Text style={styles.infoValue}>{appliance.model_number || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Serial Number:</Text>
                <Text style={styles.infoValue}>{appliance.serial_number || 'N/A'}</Text>
              </View>

              {appliance.purchase_date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Purchase Date:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(appliance.purchase_date).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {appliance.installation_date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Installation Date:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(appliance.installation_date).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {appliance.warranty_expiration && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Warranty:</Text>
                  <Text style={[styles.infoValue, { color: warrantyStatus.color }]}>
                    {warrantyStatus.text}
                  </Text>
                </View>
              )}

              {appliance.location && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <Text style={styles.infoValue}>{appliance.location}</Text>
                </View>
              )}

              {appliance.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{appliance.notes}</Text>
                </View>
              )}
            </View>

            {/* Documents & Photos Section */}
            <View style={styles.documentsSection}>
              <DocumentListSection
                applianceId={appliance.id}
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 40,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  type: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
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
  uploadSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  notesSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  notesLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  notesText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    lineHeight: 22,
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
