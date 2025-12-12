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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import apiService from '../services/api';

const DOCUMENT_CATEGORIES = [
  { key: 'manual', label: 'Manual', icon: '📘' },
  { key: 'warranty', label: 'Warranty', icon: '🛡️' },
  { key: 'receipt', label: 'Receipt', icon: '🧾' },
  { key: 'lease', label: 'Lease', icon: '📄' },
  { key: 'insurance', label: 'Insurance', icon: '🏥' },
  { key: 'invoice', label: 'Invoice', icon: '💰' },
  { key: 'contract', label: 'Contract', icon: '📝' },
  { key: 'id', label: 'ID Document', icon: '🆔' },
  { key: 'photo', label: 'Photo', icon: '📷' },
  { key: 'other', label: 'Other', icon: '📎' },
];

export default function DocumentUploadModal({
  visible,
  onClose,
  onSuccess,
  propertyId = null,
  tenantId = null,
  applianceId = null,
  preselectedCategory = null,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(preselectedCategory || 'other');
  const [selectedFile, setSelectedFile] = useState(null);
  const [expirationDate, setExpirationDate] = useState('');
  const [uploading, setUploading] = useState(false);

  // Entity selection for standalone upload
  const [selectedEntityType, setSelectedEntityType] = useState('none');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [appliances, setAppliances] = useState([]);

  useEffect(() => {
    if (visible) {
      if (!preselectedCategory) {
        setCategory('other');
      }
      // Only fetch entities if no IDs were provided (standalone upload)
      if (!propertyId && !tenantId && !applianceId) {
        fetchEntities();
      }
    } else {
      resetForm();
    }
  }, [visible]);

  const fetchEntities = async () => {
    try {
      const [propertiesData, tenantsData, appliancesData] = await Promise.all([
        apiService.properties.getAll().catch(() => []),
        apiService.tenants.getAll().catch(() => []),
        apiService.appliances.getAll().catch(() => []),
      ]);
      setProperties(propertiesData);
      setTenants(tenantsData);
      setAppliances(appliancesData);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(preselectedCategory || 'other');
    setSelectedFile(null);
    setExpirationDate('');
    setSelectedEntityType('none');
    setSelectedEntityId('');
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setSelectedFile(file);

      // Auto-populate title if empty
      if (!title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setTitle(fileName);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    if (!title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();

      // Create proper file object for React Native
      const fileData = {
        uri: Platform.OS === 'android' ? selectedFile.uri : selectedFile.uri.replace('file://', ''),
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name,
      };

      formData.append('file', fileData);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);

      // Use provided entity IDs or selected entity IDs
      if (propertyId) {
        formData.append('property_id', propertyId.toString());
      } else if (selectedEntityType === 'property' && selectedEntityId) {
        formData.append('property_id', selectedEntityId);
      }

      if (tenantId) {
        formData.append('tenant_id', tenantId.toString());
      } else if (selectedEntityType === 'tenant' && selectedEntityId) {
        formData.append('tenant_id', selectedEntityId);
      }

      if (applianceId) {
        formData.append('appliance_id', applianceId.toString());
      } else if (selectedEntityType === 'appliance' && selectedEntityId) {
        formData.append('appliance_id', selectedEntityId);
      }

      if (expirationDate) {
        formData.append('expiration_date', expirationDate);
      }

      await apiService.documents.upload(formData);
      Alert.alert('Success', 'Document uploaded successfully');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
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
            <Text style={styles.title}>Upload Document</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Entity Selection - Only show if no entity IDs were provided */}
            {!propertyId && !tenantId && !applianceId && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Associate with (Optional)</Text>
                  <View style={styles.entityTypeGrid}>
                    <TouchableOpacity
                      style={[
                        styles.entityTypeButton,
                        selectedEntityType === 'none' && styles.entityTypeButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedEntityType('none');
                        setSelectedEntityId('');
                      }}
                      disabled={uploading}
                    >
                      <Text style={styles.entityTypeIcon}>📎</Text>
                      <Text
                        style={[
                          styles.entityTypeButtonText,
                          selectedEntityType === 'none' && styles.entityTypeButtonTextActive,
                        ]}
                      >
                        None
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.entityTypeButton,
                        selectedEntityType === 'property' && styles.entityTypeButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedEntityType('property');
                        setSelectedEntityId('');
                      }}
                      disabled={uploading}
                    >
                      <Text style={styles.entityTypeIcon}>🏠</Text>
                      <Text
                        style={[
                          styles.entityTypeButtonText,
                          selectedEntityType === 'property' && styles.entityTypeButtonTextActive,
                        ]}
                      >
                        Property
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.entityTypeButton,
                        selectedEntityType === 'tenant' && styles.entityTypeButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedEntityType('tenant');
                        setSelectedEntityId('');
                      }}
                      disabled={uploading}
                    >
                      <Text style={styles.entityTypeIcon}>👤</Text>
                      <Text
                        style={[
                          styles.entityTypeButtonText,
                          selectedEntityType === 'tenant' && styles.entityTypeButtonTextActive,
                        ]}
                      >
                        Tenant
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.entityTypeButton,
                        selectedEntityType === 'appliance' && styles.entityTypeButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedEntityType('appliance');
                        setSelectedEntityId('');
                      }}
                      disabled={uploading}
                    >
                      <Text style={styles.entityTypeIcon}>🔧</Text>
                      <Text
                        style={[
                          styles.entityTypeButtonText,
                          selectedEntityType === 'appliance' && styles.entityTypeButtonTextActive,
                        ]}
                      >
                        Appliance
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Entity Selection Dropdown */}
                {selectedEntityType === 'property' && properties.length > 0 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Select Property</Text>
                    <ScrollView style={styles.entityList} nestedScrollEnabled>
                      {properties.map((property) => (
                        <TouchableOpacity
                          key={property.id}
                          style={[
                            styles.entityItem,
                            selectedEntityId === property.id.toString() && styles.entityItemSelected,
                          ]}
                          onPress={() => setSelectedEntityId(property.id.toString())}
                          disabled={uploading}
                        >
                          <Text style={styles.entityItemText}>{property.address}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {selectedEntityType === 'tenant' && tenants.length > 0 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Select Tenant</Text>
                    <ScrollView style={styles.entityList} nestedScrollEnabled>
                      {tenants.map((tenant) => (
                        <TouchableOpacity
                          key={tenant.id}
                          style={[
                            styles.entityItem,
                            selectedEntityId === tenant.id.toString() && styles.entityItemSelected,
                          ]}
                          onPress={() => setSelectedEntityId(tenant.id.toString())}
                          disabled={uploading}
                        >
                          <Text style={styles.entityItemText}>
                            {tenant.first_name} {tenant.last_name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {selectedEntityType === 'appliance' && appliances.length > 0 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Select Appliance</Text>
                    <ScrollView style={styles.entityList} nestedScrollEnabled>
                      {appliances.map((appliance) => (
                        <TouchableOpacity
                          key={appliance.id}
                          style={[
                            styles.entityItem,
                            selectedEntityId === appliance.id.toString() && styles.entityItemSelected,
                          ]}
                          onPress={() => setSelectedEntityId(appliance.id.toString())}
                          disabled={uploading}
                        >
                          <Text style={styles.entityItemText}>{appliance.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}

            {/* File Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>File *</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={pickDocument}
                disabled={uploading}
              >
                <Text style={styles.filePickerIcon}>📁</Text>
                <View style={styles.filePickerContent}>
                  {selectedFile ? (
                    <>
                      <Text style={styles.filePickerTextSelected} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text style={styles.filePickerSubtext}>
                        {formatFileSize(selectedFile.size)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.filePickerText}>Tap to select file</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Document title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                editable={!uploading}
              />
            </View>

            {/* Category */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryGrid}>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryButton,
                        category === cat.key && styles.categoryButtonActive,
                      ]}
                      onPress={() => setCategory(cat.key)}
                      disabled={uploading}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryButtonText,
                          category === cat.key && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional details..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={!uploading}
              />
            </View>

            {/* Expiration Date (for certain categories) */}
            {['lease', 'insurance', 'warranty', 'id'].includes(category) && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Expiration Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025-12-31"
                  placeholderTextColor={colors.textSecondary}
                  value={expirationDate}
                  onChangeText={setExpirationDate}
                  editable={!uploading}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={uploading}
            >
              <Text style={styles.cancelButtonText} numberOfLines={1}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleSubmit}
              disabled={uploading || !selectedFile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={[styles.submitButton, (uploading || !selectedFile) && styles.submitButtonDisabled]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {uploading ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={styles.submitButtonText} numberOfLines={1}>Upload</Text>
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
  filePickerButton: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  filePickerIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  filePickerContent: {
    flex: 1,
  },
  filePickerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
  },
  filePickerTextSelected: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
  },
  filePickerSubtext: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    marginTop: 2,
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
    alignItems: 'center',
    minWidth: 80,
  },
  categoryButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
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
  entityTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  entityTypeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
  },
  entityTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  entityTypeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  entityTypeButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  entityTypeButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  entityList: {
    maxHeight: 150,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  entityItem: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  entityItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  entityItemText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
