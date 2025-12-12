import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import DocumentUploadModal from './DocumentUploadModal';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../services/api';

export default function DocumentListSection({
  propertyId = null,
  tenantId = null,
  applianceId = null,
  title = 'Documents',
  showUploadButton = true,
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [propertyId, tenantId, applianceId]);

  const fetchDocuments = async () => {
    try {
      let data = [];
      if (applianceId) {
        data = await apiService.documents.getByAppliance(applianceId);
      } else if (tenantId) {
        data = await apiService.documents.getByTenant(tenantId);
      } else if (propertyId) {
        data = await apiService.documents.getByProperty(propertyId);
      } else {
        data = await apiService.documents.getAll();
      }
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      manual: '📘',
      warranty: '🛡️',
      receipt: '🧾',
      lease: '📄',
      insurance: '🏥',
      invoice: '💰',
      contract: '📝',
      id: '🆔',
      photo: '📷',
      other: '📎',
    };
    return icons[category?.toLowerCase()] || '📎';
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are needed to take or select photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async (useCamera = false) => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (asset) => {
    if (!applianceId && !tenantId && !propertyId) {
      Alert.alert('Error', 'Cannot upload photo without entity association.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      const uriParts = asset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      let entityType = 'photo';
      if (applianceId) entityType = 'appliance';
      else if (tenantId) entityType = 'tenant';
      else if (propertyId) entityType = 'property';

      formData.append('file', {
        uri: asset.uri,
        name: `${entityType}-photo-${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      });
      formData.append('title', `Photo - ${new Date().toLocaleDateString()}`);
      formData.append('category', 'photo');

      if (applianceId) formData.append('appliance_id', applianceId.toString());
      if (tenantId) formData.append('tenant_id', tenantId.toString());
      if (propertyId) formData.append('property_id', propertyId.toString());

      await apiService.documents.upload(formData);
      Alert.alert('Success', 'Photo uploaded successfully!');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImage(true),
        },
        {
          text: 'Choose from Library',
          onPress: () => pickImage(false),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showUploadButton && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={showPhotoOptions}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <Text style={styles.photoButtonText}>📸</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setUploadModalVisible(true)}
            >
              <Text style={styles.uploadButtonText}>+ Upload</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : documents.length === 0 ? (
        <Text style={styles.emptyText}>No documents uploaded yet</Text>
      ) : (
        documents.map((doc) => (
          <View key={doc.id} style={styles.documentItem}>
            <Text style={styles.documentIcon}>{getCategoryIcon(doc.category)}</Text>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              <Text style={styles.documentMeta}>
                {doc.category} • {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
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

      <DocumentUploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onSuccess={fetchDocuments}
        propertyId={propertyId}
        tenantId={tenantId}
        applianceId={applianceId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    fontSize: 18,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  uploadButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.semibold,
  },
  loadingContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
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
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
});
