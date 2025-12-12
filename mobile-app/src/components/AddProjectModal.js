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
import apiService from '../services/api';

const PROJECT_STATUSES = ['planned', 'in_progress', 'completed', 'on_hold'];

export default function AddProjectModal({ visible, onClose, onSuccess, projectToEdit = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('planned');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');

  useEffect(() => {
    if (visible) {
      fetchProperties();
      if (projectToEdit) {
        // Pre-fill form with project data for editing
        setTitle(projectToEdit.title || projectToEdit.name || '');
        setDescription(projectToEdit.description || '');
        setStatus(projectToEdit.status || 'planned');
        setBudget(projectToEdit.budget?.toString() || '');
        setStartDate(projectToEdit.start_date || '');
        setEndDate(projectToEdit.end_date || projectToEdit.estimated_completion || '');
        setSelectedProperty(projectToEdit.property_id?.toString() || '');
      } else {
        resetForm();
      }
    }
  }, [visible, projectToEdit]);

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
    if (!title) {
      Alert.alert('Error', 'Please enter a project title');
      return;
    }

    setLoading(true);
    try {
      const projectData = {
        title,
        description,
        status,
        budget: budget ? parseFloat(budget) : null,
        start_date: startDate || null,
        estimated_completion: endDate || null,
        property_id: selectedProperty ? parseInt(selectedProperty) : null,
      };

      if (projectToEdit) {
        await apiService.projects.update(projectToEdit.id, projectData);
        Alert.alert('Success', 'Project updated successfully');
      } else {
        await apiService.projects.create(projectData);
        Alert.alert('Success', 'Project created successfully');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || `Failed to ${projectToEdit ? 'update' : 'create'} project`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('planned');
    setBudget('');
    setStartDate('');
    setEndDate('');
    setSelectedProperty('');
  };

  const handleClose = () => {
    if (!projectToEdit) {
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
            <Text style={styles.title}>{projectToEdit ? 'Edit Project' : 'Add New Project'}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Project Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Kitchen Renovation"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Project details..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusGrid}>
                {PROJECT_STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusButton,
                      status === s && styles.statusButtonActive,
                    ]}
                    onPress={() => setStatus(s)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        status === s && styles.statusButtonTextActive,
                      ]}
                    >
                      {s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Property (Optional)</Text>
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
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Budget</Text>
              <TextInput
                style={styles.input}
                placeholder="10000"
                placeholderTextColor={colors.textSecondary}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-01-01"
                placeholderTextColor={colors.textSecondary}
                value={startDate}
                onChangeText={setStartDate}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Estimated Completion (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-12-31"
                placeholderTextColor={colors.textSecondary}
                value={endDate}
                onChangeText={setEndDate}
                editable={!loading}
              />
            </View>
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
                  <Text style={styles.submitButtonText} numberOfLines={1}>{projectToEdit ? 'Update' : 'Create Project'}</Text>
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
    height: 100,
    textAlignVertical: 'top',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  statusButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  statusButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  statusButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
