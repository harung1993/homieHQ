import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import SectionHeader from '../components/SectionHeader';
import ListItem from '../components/ListItem';
import AddPropertyModal from '../components/AddPropertyModal';
import apiService from '../services/api';

export default function PropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;
  const [showEditModal, setShowEditModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    loadPropertyDocuments();
    loadPropertyPhotos();
  }, []);

  const loadPropertyDocuments = async () => {
    try {
      setLoadingDocs(true);
      const data = await apiService.documents.getByProperty(property.id);
      // Filter out photos
      const docs = data.filter(d => d.category !== 'property_photo');
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadPropertyPhotos = async () => {
    try {
      const data = await apiService.propertyPhotos.getByProperty(property.id);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const uploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingDoc(true);
        const file = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
        formData.append('property_id', property.id);
        formData.append('title', 'Property Photo');
        formData.append('is_primary', 'false');

        await apiService.propertyPhotos.upload(formData);
        Alert.alert('Success', 'Photo uploaded successfully');
        loadPropertyPhotos();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploadingDoc(false);
    }
  };

  const uploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Alert.prompt(
          'Document Title',
          'Enter a title for this document:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Upload',
              onPress: async (title) => {
                if (!title || !title.trim()) {
                  Alert.alert('Error', 'Please enter a title');
                  return;
                }

                try {
                  setUploadingDoc(true);
                  const file = result.assets[0];
                  const formData = new FormData();
                  formData.append('file', {
                    uri: file.uri,
                    type: file.mimeType || 'application/octet-stream',
                    name: file.name || 'document',
                  });
                  formData.append('title', title.trim());
                  formData.append('property_id', property.id);
                  formData.append('category', 'general');
                  formData.append('description', '');

                  await apiService.documents.upload(formData);
                  Alert.alert('Success', 'Document uploaded successfully');
                  loadPropertyDocuments();
                } catch (error) {
                  console.error('Error uploading document:', error);
                  Alert.alert('Error', 'Failed to upload document');
                } finally {
                  setUploadingDoc(false);
                }
              },
            },
          ],
          'plain-text'
        );
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Details</Text>
          <View style={styles.headerSpacer} />
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Image Card */}
          <View style={styles.propertyCard}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.propertyImage}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.propertyEmoji}>{property.emoji || '🏡'}</Text>
            </LinearGradient>
            <Text style={styles.propertyTitle}>{property.address}</Text>
            <Text style={styles.propertySubtitle}>
              {property.city}, {property.state} {property.zip}
            </Text>
          </View>

          {/* Overview Section */}
          <SectionHeader title="Overview" />
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View>
                <Text style={styles.statLabel}>Monthly Rent</Text>
                <Text style={styles.statValue}>$2,500</Text>
                <Text style={styles.statChange}>↑ 5% vs last year</Text>
              </View>
              <Text style={styles.statEmoji}>💵</Text>
            </View>
          </View>

          {/* Quick Info Section */}
          <SectionHeader title="Quick Info" />
          <ListItem
            icon="📅"
            title="Purchase Date"
            subtitle="January 15, 2020"
          />
          <ListItem
            icon="🏷️"
            title="Property Type"
            subtitle="Single Family"
          />
          <ListItem
            icon="✅"
            title="Status"
            subtitle="Active - Occupied"
          />

          {/* Documents & Photos Section */}
          <SectionHeader title="Documents & Photos" />
          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={[styles.uploadBtn, uploadingDoc && styles.uploadBtnDisabled]}
              onPress={uploadPhoto}
              disabled={uploadingDoc}
            >
              <Text style={styles.uploadBtnIcon}>📷</Text>
              <Text style={styles.uploadBtnText}>Add Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadBtn, uploadingDoc && styles.uploadBtnDisabled]}
              onPress={uploadDocument}
              disabled={uploadingDoc}
            >
              <Text style={styles.uploadBtnIcon}>📄</Text>
              <Text style={styles.uploadBtnText}>Add Document</Text>
            </TouchableOpacity>
          </View>

          {uploadingDoc && (
            <View style={styles.uploadingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}

          {loadingDocs ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <>
              {photos.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Photos ({photos.length})</Text>
                  {photos.slice(0, 3).map((photo) => (
                    <ListItem
                      key={photo.id}
                      icon="🖼️"
                      title={photo.title}
                      subtitle={`Added ${new Date(photo.created_at).toLocaleDateString()}`}
                    />
                  ))}
                </>
              )}

              {documents.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Documents ({documents.length})</Text>
                  {documents.slice(0, 3).map((doc) => (
                    <ListItem
                      key={doc.id}
                      icon="📄"
                      title={doc.title}
                      subtitle={`Added ${new Date(doc.created_at).toLocaleDateString()}`}
                    />
                  ))}
                </>
              )}

              {photos.length === 0 && documents.length === 0 && (
                <Text style={styles.emptyText}>No documents or photos yet</Text>
              )}
            </>
          )}
        </ScrollView>

        {/* Edit Property Modal */}
        <AddPropertyModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          propertyToEdit={property}
          onSuccess={() => {
            setShowEditModal(false);
            navigation.goBack();
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 10,
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxlarge,
    fontWeight: typography.weights.bold,
  },
  headerSpacer: {
    flex: 1,
  },
  editButton: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  propertyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  propertyImage: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyEmoji: {
    fontSize: 64,
  },
  propertyTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  propertySubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small + 1,
  },
  statCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    marginBottom: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
    marginVertical: spacing.sm,
  },
  statChange: {
    color: colors.success,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.semibold,
  },
  statEmoji: {
    fontSize: 32,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    gap: spacing.sm,
  },
  uploadBtnDisabled: {
    opacity: 0.5,
  },
  uploadBtnIcon: {
    fontSize: 20,
  },
  uploadBtnText: {
    fontSize: typography.sizes.small,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  uploadingText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  subsectionTitle: {
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
