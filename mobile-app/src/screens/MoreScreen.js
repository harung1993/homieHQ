import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../styles/theme';
import ListItem from '../components/ListItem';
import SectionHeader from '../components/SectionHeader';

export default function MoreScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>⚡</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>More</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader title="Features" />
          <ListItem
            icon="🏗️"
            title="Projects"
            subtitle="Track renovation and improvement projects"
            onPress={() => navigation.navigate('ProjectsTab')}
          />
          <ListItem
            icon="📱"
            title="Appliances"
            subtitle="Manage appliances and warranties"
            onPress={() => navigation.navigate('AppliancesTab')}
          />
          <ListItem
            icon="🌸"
            title="Seasonal Tasks"
            subtitle="Seasonal maintenance checklists"
            onPress={() => navigation.navigate('SeasonalTab')}
          />
          <ListItem
            icon="📄"
            title="Documents"
            subtitle="Manage your documents and files"
            onPress={() => navigation.navigate('DocumentsTab')}
          />

          <SectionHeader title="Settings" />
          <ListItem
            icon="⚙️"
            title="Settings"
            subtitle="App settings and configuration"
            onPress={() => navigation.navigate('SettingsTab')}
          />
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
});
