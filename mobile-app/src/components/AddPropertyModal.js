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

const PROPERTY_TYPES = ['Single Family', 'Multi-Family', 'Apartment', 'Condo', 'Townhouse', 'Other'];

export default function AddPropertyModal({ visible, onClose, onSuccess, propertyToEdit = null }) {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [propertyType, setPropertyType] = useState('Single Family');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && propertyToEdit) {
      // Pre-fill form with property data for editing
      setAddress(propertyToEdit.address || '');
      setCity(propertyToEdit.city || '');
      setState(propertyToEdit.state || '');
      setZipCode(propertyToEdit.zip || '');
      setPropertyType(propertyToEdit.property_type || 'Single Family');
      setBedrooms(propertyToEdit.bedrooms?.toString() || '');
      setBathrooms(propertyToEdit.bathrooms?.toString() || '');
      setSquareFeet(propertyToEdit.sqft?.toString() || propertyToEdit.square_feet?.toString() || '');
      setPurchasePrice(propertyToEdit.purchase_price?.toString() || '');
    }
  }, [visible, propertyToEdit]);

  const handleSubmit = async () => {
    // Validation
    if (!address || !city || !state || !zipCode) {
      Alert.alert('Error', 'Please fill in all required fields (address, city, state, zip code)');
      return;
    }

    setLoading(true);
    try {
      const propertyData = {
        address,
        city,
        state,
        zip_code: zipCode,
        property_type: propertyType,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        square_feet: squareFeet ? parseInt(squareFeet) : null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
      };

      if (propertyToEdit) {
        await apiService.properties.update(propertyToEdit.id, propertyData);
        Alert.alert('Success', 'Property updated successfully');
      } else {
        await apiService.properties.create(propertyData);
        Alert.alert('Success', 'Property added successfully');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || `Failed to ${propertyToEdit ? 'update' : 'add'} property`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setPropertyType('Single Family');
    setBedrooms('');
    setBathrooms('');
    setSquareFeet('');
    setPurchasePrice('');
  };

  const handleClose = () => {
    if (!propertyToEdit) {
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
            <Text style={styles.title}>{propertyToEdit ? 'Edit' : 'Add'}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main Street"
                placeholderTextColor={colors.textSecondary}
                value={address}
                onChangeText={setAddress}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="San Francisco"
                placeholderTextColor={colors.textSecondary}
                value={city}
                onChangeText={setCity}
                editable={!loading}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="CA"
                  placeholderTextColor={colors.textSecondary}
                  value={state}
                  onChangeText={setState}
                  autoCapitalize="characters"
                  maxLength={2}
                  editable={!loading}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Zip Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="94102"
                  placeholderTextColor={colors.textSecondary}
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Property Type</Text>
              <View style={styles.typeGrid}>
                {PROPERTY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      propertyType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setPropertyType(type)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        propertyType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Bedrooms</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  placeholderTextColor={colors.textSecondary}
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Bathrooms</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  placeholderTextColor={colors.textSecondary}
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Square Feet</Text>
              <TextInput
                style={styles.input}
                placeholder="1500"
                placeholderTextColor={colors.textSecondary}
                value={squareFeet}
                onChangeText={setSquareFeet}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Purchase Price</Text>
              <TextInput
                style={styles.input}
                placeholder="500000"
                placeholderTextColor={colors.textSecondary}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            {/* Photo Upload - Only show when editing */}
            {propertyToEdit && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>Photos</Text>
                <ImagePickerButton
                  propertyId={propertyToEdit.id}
                  onUploadSuccess={() => {
                    // Refresh will happen automatically when modal closes
                  }}
                />

                <View style={styles.sectionDivider} />
                <DocumentListSection
                  propertyId={propertyToEdit.id}
                  title="Property Documents"
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
                  <Text style={styles.submitButtonText} numberOfLines={1}>{propertyToEdit ? 'Update' : 'Add'}</Text>
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  typeButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
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
