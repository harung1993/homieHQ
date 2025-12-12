import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import apiService from '../services/api';

const DOCUMENT_TYPES = [
  { key: 'manual', label: 'Manual', icon: '📘', category: 'manual' },
  { key: 'warranty', label: 'Warranty', icon: '🛡️', category: 'warranty' },
  { key: 'receipt', label: 'Receipt', icon: '🧾', category: 'receipt' },
];

export default function ApplianceDetailsScreen({ route, navigation }) {
  const { appliance } = route.params;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await apiService.documents.getByAppliance(appliance.id);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async (documentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      await uploadDocument(file, documentType);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadDocument = async (file, documentType) => {
    setUploading(true);
    try {
      const formData = new FormData();

      // For React Native, we need to create a proper file object
      const fileData = {
        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
        type: file.mimeType || 'application/octet-stream',
        name: file.name,
      };

      formData.append('file', fileData);
      formData.append('title', `${appliance.brand || ''} ${appliance.model || 'Appliance'} ${documentType.label}`.trim());
      formData.append('category', documentType.category);
      formData.append('appliance_id', appliance.id.toString());
      formData.append('description', `${documentType.label} for ${appliance.brand || ''} ${appliance.model || ''}`.trim());

      await apiService.documents.upload(formData);
      Alert.alert('Success', `${documentType.label} uploaded successfully`);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.documents.delete(documentId);
              Alert.alert('Success', 'Document deleted');
              fetchDocuments();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const getDocumentsByType = (type) => {
    return documents.filter((doc) => doc.category === type);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {appliance.brand || ''} {appliance.model || 'Appliance'}
            </Text>
            <Text style={styles.headerSubtitle}>{appliance.category || 'Unknown Category'}</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Appliance Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Serial Number:</Text>
              <Text style={styles.infoValue}>{appliance.serial_number || 'N/A'}</Text>
            </View>
            {appliance.install_date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Installed:</Text>
                <Text style={styles.infoValue}>{formatDate(appliance.install_date)}</Text>
              </View>
            )}
            {appliance.warranty_expiry && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Warranty Expires:</Text>
                <Text style={styles.infoValue}>{formatDate(appliance.warranty_expiry)}</Text>
              </View>
            )}
          </View>

          {/* Documents Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            DOCUMENT_TYPES.map((docType) => {
              const docsOfType = getDocumentsByType(docType.category);
              return (
                <View key={docType.key} style={styles.documentTypeCard}>
                  <View style={styles.documentTypeHeader}>
                    <View style={styles.documentTypeInfo}>
                      <Text style={styles.documentTypeIcon}>{docType.icon}</Text>
                      <Text style={styles.documentTypeTitle}>{docType.label}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => pickDocument(docType)}
                      disabled={uploading}
                    >
                      <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>

                  {docsOfType.length === 0 ? (
                    <Text style={styles.emptyDocText}>No {docType.label.toLowerCase()} uploaded</Text>
                  ) : (
                    docsOfType.map((doc) => (
                      <View key={doc.id} style={styles.documentItem}>
                        <View style={styles.documentInfo}>
                          <Text style={styles.documentTitle}>{doc.title}</Text>
                          <Text style={styles.documentMeta}>
                            {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteDocument(doc.id)}
                        >
                          <Text style={styles.deleteButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              );
            })
          )}

          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
  },
  documentTypeCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  documentTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  documentTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentTypeIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  documentTypeTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.semibold,
  },
  emptyDocText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontStyle: 'italic',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    marginBottom: 2,
  },
  documentMeta: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 20,
    fontWeight: typography.weights.bold,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  uploadingOverlay: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  uploadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    marginTop: spacing.md,
  },
});
