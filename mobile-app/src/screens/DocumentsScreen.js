import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import DocumentUploadModal from '../components/DocumentUploadModal';
import apiService from '../services/api';

const DOCUMENT_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'tenant_lease', label: 'Lease Agreement' },
  { value: 'tenant_id', label: 'Identification' },
  { value: 'property_deed', label: 'Property Deed' },
  { value: 'property_insurance', label: 'Insurance' },
  { value: 'property_inspection', label: 'Inspection Report' },
  { value: 'maintenance_receipt', label: 'Maintenance Receipt' },
  { value: 'contract', label: 'Contract' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
];

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, [selectedCategory]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const data = await apiService.documents.getAll(params);
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };

  const deleteDocument = (docId) => {
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
              await apiService.documents.delete(docId);
              Alert.alert('Success', 'Document deleted');
              loadDocuments();
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {DOCUMENT_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.categoryChip, selectedCategory === cat.value && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.value)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.value && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Upload Button */}
      <View style={styles.uploadButtonsContainer}>
        <TouchableOpacity
          style={styles.uploadButtonContainer}
          onPress={() => setUploadModalVisible(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.uploadButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.uploadButtonIcon}>📁</Text>
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptySubtext}>Upload your first document to get started</Text>
          </View>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <Text style={styles.documentIcon}>{getFileIcon(doc.file_type)}</Text>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{doc.title}</Text>
                  <Text style={styles.documentMeta}>
                    {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                  </Text>
                  {doc.description && (
                    <Text style={styles.documentDescription}>{doc.description}</Text>
                  )}
                  {doc.expiration_date && (
                    <Text style={styles.expirationDate}>
                      Expires: {formatDate(doc.expiration_date)}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.documentActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('View', 'Document viewer coming soon')}
                >
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteDocument(doc.id)}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onSuccess={loadDocuments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoryScroll: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  categoryContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  categoryTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  uploadButtonsContainer: {
    padding: spacing.md,
  },
  uploadButtonContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  uploadButtonIcon: {
    fontSize: 24,
  },
  uploadButtonText: {
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.large,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
  },
  documentCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  documentHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  documentIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  documentMeta: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  documentDescription: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  expirationDate: {
    fontSize: typography.sizes.small,
    color: colors.error || '#FF4444',
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  documentActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: typography.sizes.small,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  deleteButton: {
    backgroundColor: colors.error + '20' || '#FF444420',
  },
  deleteButtonText: {
    color: colors.error || '#FF4444',
  },
});
