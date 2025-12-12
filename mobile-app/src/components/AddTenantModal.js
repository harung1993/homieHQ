import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import DocumentListSection from './DocumentListSection';
import ImagePickerButton from './ImagePickerButton';
import apiService from '../services/api';

export default function AddTenantModal({ visible, onClose, onSuccess, tenantToEdit = null }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchProperties();
      if (tenantToEdit) {
        // Pre-fill form with tenant data for editing
        setFirstName(tenantToEdit.first_name || '');
        setLastName(tenantToEdit.last_name || '');
        setEmail(tenantToEdit.email || '');
        setPhone(tenantToEdit.phone || '');
        setPropertyId(tenantToEdit.property_id?.toString() || '');
        setLeaseEndDate(tenantToEdit.lease_end || '');
      } else {
        resetForm();
      }
    }
  }, [visible, tenantToEdit]);

  const fetchProperties = async () => {
    try {
      const data = await apiService.properties.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!firstName || !lastName) {
      Alert.alert('Error', 'Please enter first and last name');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!propertyId) {
      Alert.alert('Error', 'Please select a property');
      return;
    }

    setLoading(true);
    try {
      const tenantData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        property_id: parseInt(propertyId),
        lease_end: leaseEndDate || null,
      };

      if (tenantToEdit) {
        await apiService.tenants.update(tenantToEdit.id, tenantData);
        Alert.alert('Success', 'Tenant updated successfully');
      } else {
        await apiService.tenants.create(tenantData);
        Alert.alert('Success', 'Tenant added successfully');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      // Extract detailed error message from backend response
      let errorMessage = `Failed to ${tenantToEdit ? 'update' : 'add'} tenant`;

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setQuickLeaseDate = (months) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setMonth(futureDate.getMonth() + months);

    // Format as YYYY-MM-DD
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');

    setLeaseEndDate(`${year}-${month}-${day}`);
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPropertyId('');
    setLeaseEndDate('');
  };

  const handleClose = () => {
    if (!tenantToEdit) {
      resetForm();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{tenantToEdit ? 'Edit' : 'Add'}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                placeholderTextColor={colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                placeholderTextColor={colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="tenant@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Property</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {propertyId
                    ? properties.find(p => p.id === parseInt(propertyId))?.address || 'Select property'
                    : 'Select property'}
                </Text>
              </View>
              {properties.length > 0 && (
                <ScrollView style={styles.propertyList} nestedScrollEnabled>
                  {properties.map(property => (
                    <TouchableOpacity
                      key={property.id}
                      style={[
                        styles.propertyItem,
                        propertyId === property.id.toString() && styles.propertyItemSelected
                      ]}
                      onPress={() => setPropertyId(property.id.toString())}
                    >
                      <Text style={styles.propertyItemText}>{property.address}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Lease End Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={leaseEndDate}
                onChangeText={setLeaseEndDate}
                editable={!loading}
              />
              <View style={styles.quickDateButtons}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setQuickLeaseDate(6)}
                  disabled={loading}
                >
                  <Text style={styles.quickDateButtonText}>6 months</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setQuickLeaseDate(12)}
                  disabled={loading}
                >
                  <Text style={styles.quickDateButtonText}>1 year</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setQuickLeaseDate(24)}
                  disabled={loading}
                >
                  <Text style={styles.quickDateButtonText}>2 years</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Photo Upload - Only show when editing */}
            {tenantToEdit && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>Photos</Text>
                <ImagePickerButton
                  tenantId={tenantToEdit.id}
                  onUploadSuccess={() => {
                    // Refresh will happen automatically when modal closes
                  }}
                />

                <View style={styles.sectionDivider} />
                <DocumentListSection
                  tenantId={tenantToEdit.id}
                  title="Documents"
                  showUploadButton={true}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText} numberOfLines={1}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={styles.submitButtonText} numberOfLines={1}>{tenantToEdit ? 'Update' : 'Add'}</Text>
                )}
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
    maxHeight: '80%',
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
  form: {
    padding: spacing.xl,
    maxHeight: 400,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
  },
  pickerContainer: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  pickerText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
  },
  propertyList: {
    maxHeight: 150,
    marginTop: spacing.sm,
  },
  propertyItem: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  propertyItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.cardBg + '40',
  },
  propertyItemText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.small,
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  quickDateButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  submitButtonContainer: {
    flex: 1,
  },
  submitButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
