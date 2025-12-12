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

const APPLIANCE_CATEGORIES = [
  'HVAC',
  'Refrigerator',
  'Washer',
  'Dryer',
  'Dishwasher',
  'Oven',
  'Microwave',
  'Water Heater',
  'Other',
];

export default function AddApplianceModal({ visible, onClose, onSuccess, applianceToEdit = null }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Other');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');

  useEffect(() => {
    if (visible) {
      fetchProperties();
      if (applianceToEdit) {
        // Pre-fill form with appliance data for editing
        setName(applianceToEdit.name || '');
        setBrand(applianceToEdit.brand || '');
        setModel(applianceToEdit.model || '');
        setCategory(applianceToEdit.category || 'Other');
        setSerialNumber(applianceToEdit.serial_number || '');
        setLocation(applianceToEdit.location || '');
        setInstallDate(applianceToEdit.purchase_date || '');
        setWarrantyExpiry(applianceToEdit.warranty_expiration || '');
        setNotes(applianceToEdit.notes || '');
        setSelectedProperty(applianceToEdit.property_id?.toString() || '');
      } else {
        resetForm();
      }
    }
  }, [visible, applianceToEdit]);

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
    if (!name) {
      Alert.alert('Error', 'Please enter appliance name');
      return;
    }

    setLoading(true);
    try {
      const applianceData = {
        name: name,
        brand: brand || null,
        model: model || null,
        category: category || 'Other',
        serial_number: serialNumber || null,
        location: location || null,
        purchase_date: installDate || null,
        warranty_expiration: warrantyExpiry || null,
        notes: notes || null,
        property_id: selectedProperty ? parseInt(selectedProperty) : null,
      };

      if (applianceToEdit) {
        await apiService.appliances.update(applianceToEdit.id, applianceData);
        Alert.alert('Success', 'Appliance updated successfully');
      } else {
        await apiService.appliances.create(applianceData);
        Alert.alert('Success', 'Appliance added successfully');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || `Failed to ${applianceToEdit ? 'update' : 'add'} appliance`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setBrand('');
    setModel('');
    setCategory('Other');
    setSerialNumber('');
    setLocation('');
    setInstallDate('');
    setWarrantyExpiry('');
    setNotes('');
    setSelectedProperty('');
  };

  const handleClose = () => {
    if (!applianceToEdit) {
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
            <Text style={styles.title}>{applianceToEdit ? 'Edit' : 'Add'}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Kitchen Refrigerator, Living Room AC..."
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.input}
                placeholder="Samsung, LG, Whirlpool..."
                placeholderTextColor={colors.textSecondary}
                value={brand}
                onChangeText={setBrand}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="Model number"
                placeholderTextColor={colors.textSecondary}
                value={model}
                onChangeText={setModel}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryGrid}>
                  {APPLIANCE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        category === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => setCategory(cat)}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          category === cat && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Property (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.propertyGrid}>
                  <TouchableOpacity
                    style={[
                      styles.propertyButton,
                      !selectedProperty && styles.propertyButtonActive,
                    ]}
                    onPress={() => setSelectedProperty('')}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.propertyButtonText,
                        !selectedProperty && styles.propertyButtonTextActive,
                      ]}
                    >
                      None
                    </Text>
                  </TouchableOpacity>
                  {properties.map((property) => (
                    <TouchableOpacity
                      key={property.id}
                      style={[
                        styles.propertyButton,
                        selectedProperty === property.id.toString() && styles.propertyButtonActive,
                      ]}
                      onPress={() => setSelectedProperty(property.id.toString())}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.propertyButtonText,
                          selectedProperty === property.id.toString() && styles.propertyButtonTextActive,
                        ]}
                      >
                        {property.address}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Serial Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Serial number"
                placeholderTextColor={colors.textSecondary}
                value={serialNumber}
                onChangeText={setSerialNumber}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Kitchen, Master Bedroom, Basement..."
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Install Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-01-01"
                placeholderTextColor={colors.textSecondary}
                value={installDate}
                onChangeText={setInstallDate}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Warranty Expiry (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2025-01-01"
                placeholderTextColor={colors.textSecondary}
                value={warrantyExpiry}
                onChangeText={setWarrantyExpiry}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes..."
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            {/* Photo Upload - Only show when editing */}
            {applianceToEdit && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>Photos</Text>
                <ImagePickerButton
                  applianceId={applianceToEdit.id}
                  onUploadSuccess={() => {
                    // Refresh will happen automatically when modal closes
                  }}
                />

                <View style={styles.sectionDivider} />
                <DocumentListSection
                  applianceId={applianceToEdit.id}
                  title="Documents & Manuals"
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
                  <Text style={styles.submitButtonText} numberOfLines={1}>{applianceToEdit ? 'Update' : 'Add'}</Text>
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
  form: {
    padding: spacing.xl,
    maxHeight: 450,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  categoryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  categoryButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  categoryButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  categoryButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  propertyGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  propertyButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  propertyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  propertyButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  propertyButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
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
