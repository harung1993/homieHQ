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
import apiService from '../services/api';
import { getSeasonalTasks, getCurrentSeason, getSeasonName, formatSeasonalTask } from '../utils/seasonalTasks';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function AddMaintenanceModal({ visible, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [propertyId, setPropertyId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showSeasonalTasks, setShowSeasonalTasks] = useState(false);
  const [seasonalTasks, setSeasonalTasks] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchProperties();
      setSeasonalTasks(getSeasonalTasks());
    }
  }, [visible]);

  const fetchProperties = async () => {
    try {
      const data = await apiService.properties.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSeasonalTaskSelect = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority.charAt(0).toUpperCase() + task.priority.slice(1));
    setShowSeasonalTasks(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!propertyId) {
      Alert.alert('Error', 'Please select a property');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title,
        description: description || null,
        priority: priority.toLowerCase(),
        property_id: parseInt(propertyId),
        due_date: dueDate || null,
        status: 'pending',
      };

      await apiService.maintenance.create(taskData);
      Alert.alert('Success', 'Maintenance task added successfully');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add maintenance task');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setPropertyId('');
    setDueDate('');
  };

  const handleClose = () => {
    resetForm();
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
            <Text style={styles.title}>Add Maintenance Task</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Seasonal Tasks Toggle */}
          <View style={styles.seasonalToggle}>
            <TouchableOpacity
              style={styles.seasonalButton}
              onPress={() => setShowSeasonalTasks(!showSeasonalTasks)}
            >
              <Text style={styles.seasonalButtonText}>
                {showSeasonalTasks ? '📝 Custom Task' : `${getSeasonName(getCurrentSeason())} Tasks`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Seasonal Tasks List */}
          {showSeasonalTasks && (
            <View style={styles.seasonalTasksList}>
              <Text style={styles.seasonalTasksTitle}>Recommended for {getSeasonName(getCurrentSeason())}</Text>
              <ScrollView style={styles.seasonalTasksScroll} nestedScrollEnabled>
                {seasonalTasks.map((task, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.seasonalTaskItem}
                    onPress={() => handleSeasonalTaskSelect(task)}
                  >
                    <View style={styles.seasonalTaskHeader}>
                      <Text style={styles.seasonalTaskTitle}>{task.title}</Text>
                      <View style={[
                        styles.seasonalTaskBadge,
                        task.priority === 'high' && styles.seasonalTaskBadgeHigh,
                        task.priority === 'urgent' && styles.seasonalTaskBadgeUrgent,
                      ]}>
                        <Text style={styles.seasonalTaskBadgeText}>{task.priority}</Text>
                      </View>
                    </View>
                    <Text style={styles.seasonalTaskDesc} numberOfLines={2}>{task.description}</Text>
                    <Text style={styles.seasonalTaskCategory}>Category: {task.category}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Fix leaking faucet"
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
                placeholder="Add details about the task..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Priority *</Text>
              <View style={styles.priorityContainer}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && styles.priorityButtonActive,
                      priority === p && p === 'Urgent' && styles.priorityButtonUrgent,
                      priority === p && p === 'High' && styles.priorityButtonHigh,
                    ]}
                    onPress={() => setPriority(p)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        priority === p && styles.priorityButtonTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Property *</Text>
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
              <Text style={styles.label}>Due Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={dueDate}
                onChangeText={setDueDate}
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
                  <Text style={styles.submitButtonText} numberOfLines={1}>Add Task</Text>
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
  textArea: {
    minHeight: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  priorityButtonUrgent: {
    borderColor: colors.error,
    backgroundColor: colors.error + '20',
  },
  priorityButtonHigh: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + '20',
  },
  priorityButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  priorityButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
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
  seasonalToggle: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  seasonalButton: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  seasonalButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
  },
  seasonalTasksList: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  seasonalTasksTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  seasonalTasksScroll: {
    maxHeight: 250,
  },
  seasonalTaskItem: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  seasonalTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  seasonalTaskTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  seasonalTaskBadge: {
    backgroundColor: colors.primary + '40',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  seasonalTaskBadgeHigh: {
    backgroundColor: colors.warning + '40',
  },
  seasonalTaskBadgeUrgent: {
    backgroundColor: colors.error + '40',
  },
  seasonalTaskBadgeText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.small - 2,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  seasonalTaskDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    marginBottom: spacing.xs,
  },
  seasonalTaskCategory: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small - 1,
    fontStyle: 'italic',
  },
});
