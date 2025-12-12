import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../styles/theme';
import ServerConfiguration from './settings/ServerConfiguration';
import AccountSection from './settings/AccountSection';
import AppSection from './settings/AppSection';
import AboutSection from './settings/AboutSection';
import SessionSection from './settings/SessionSection';
import MoreSection from './settings/MoreSection';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width * 0.85; // 85% of screen width

export default function SettingsModal({ visible, onClose }) {
  const navigation = useNavigation();
  const slideAnim = React.useRef(new Animated.Value(SLIDE_WIDTH)).current;
  const pan = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes to the right
        return Math.abs(gestureState.dx) > 10 && gestureState.dx > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging to the right (positive dx)
        if (gestureState.dx > 0) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged more than 100px to the right, close the modal
        if (gestureState.dx > 100) {
          onClose();
        } else {
          // Otherwise, snap back
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      pan.setValue(0); // Reset pan value
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SLIDE_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.slideMenu,
            {
              transform: [
                { translateX: slideAnim },
                { translateX: pan },
              ],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.logoIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoEmoji}>⚙️</Text>
              </LinearGradient>
              <Text style={styles.headerTitle}>Settings</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ServerConfiguration />
            <AccountSection navigation={navigation} />
            <MoreSection navigation={navigation} onClose={onClose} />
            <AppSection />
            <AboutSection />
            <SessionSection />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  slideMenu: {
    width: SLIDE_WIDTH,
    height: '100%',
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxlarge,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
});
