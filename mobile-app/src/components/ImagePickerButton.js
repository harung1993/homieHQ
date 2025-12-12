import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import apiService from '../services/api';

export default function ImagePickerButton({ applianceId, tenantId, propertyId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [lastImage, setLastImage] = useState(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are needed to take or select photos.',
        [{ text: 'OK' }]
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
      Alert.alert('Error', 'Please save first before adding photos.');
      return;
    }

    setUploading(true);
    try {
      // Create form data
      const formData = new FormData();

      // Get file extension from uri
      const uriParts = asset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      // Determine entity type for filename
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

      setLastImage(asset.uri);
      Alert.alert('Success', 'Photo uploaded successfully!');

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const showOptions = () => {
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
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={showOptions}
        disabled={uploading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {uploading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <>
              <Text style={styles.icon}>📸</Text>
              <Text style={styles.buttonText} numberOfLines={1}>Add Photo</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {lastImage && (
        <View style={styles.lastImageContainer}>
          <Image source={{ uri: lastImage }} style={styles.lastImage} />
          <Text style={styles.successText}>✓ Photo uploaded</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  lastImageContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  lastImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  successText: {
    color: colors.success,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
});
