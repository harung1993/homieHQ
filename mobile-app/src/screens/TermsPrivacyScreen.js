import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../styles/theme';

export default function TermsPrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>📖</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Terms & Privacy</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Terms of Service Section */}
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionTitle}>Terms of Service</Text>

            <View style={styles.section}>
              <Text style={styles.lastUpdated}>Last Updated: December 12, 2025</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.paragraph}>
                By accessing and using HomieHQ ("the Service"), you accept and agree to
                be bound by the terms and provision of this agreement. If you do not
                agree to these Terms of Service, please do not use the Service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Description of Service</Text>
              <Text style={styles.paragraph}>
                HomieHQ provides property management tools including maintenance
                tracking, document storage, financial tracking, and other related
                features for property owners and managers.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.paragraph}>
                You are responsible for maintaining the confidentiality of your account
                and password. You agree to accept responsibility for all activities that
                occur under your account.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
              <Text style={styles.paragraph}>
                You agree to use the Service only for lawful purposes and in accordance
                with these Terms. You agree not to use the Service:
              </Text>
              <Text style={styles.bulletPoint}>
                • In any way that violates any applicable law or regulation
              </Text>
              <Text style={styles.bulletPoint}>
                • To transmit any malicious code or malware
              </Text>
              <Text style={styles.bulletPoint}>
                • To impersonate or attempt to impersonate another user
              </Text>
              <Text style={styles.bulletPoint}>
                • To interfere with or disrupt the Service
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Data and Privacy</Text>
              <Text style={styles.paragraph}>
                Your use of the Service is also governed by our Privacy Policy. Please
                review our Privacy Policy to understand our practices.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
              <Text style={styles.paragraph}>
                The Service and its original content, features, and functionality are
                owned by HomieHQ and are protected by international copyright,
                trademark, patent, trade secret, and other intellectual property laws.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
              <Text style={styles.paragraph}>
                In no event shall HomieHQ, its directors, employees, partners, agents,
                suppliers, or affiliates, be liable for any indirect, incidental,
                special, consequential or punitive damages arising out of your use of
                the Service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
              <Text style={styles.paragraph}>
                We reserve the right to modify or replace these Terms at any time. We
                will provide notice of any changes by posting the new Terms on this
                page and updating the "Last Updated" date.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have any questions about these Terms, please contact us at
                support@homiehq.com
              </Text>
            </View>
          </View>

          {/* Privacy Policy Section */}
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionTitle}>Privacy Policy</Text>

            <View style={styles.section}>
              <Text style={styles.lastUpdated}>Last Updated: December 12, 2025</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              <Text style={styles.paragraph}>
                We collect information you provide directly to us, including:
              </Text>
              <Text style={styles.bulletPoint}>
                • Account information (name, email, phone number)
              </Text>
              <Text style={styles.bulletPoint}>
                • Property information and documents
              </Text>
              <Text style={styles.bulletPoint}>
                • Maintenance records and financial data
              </Text>
              <Text style={styles.bulletPoint}>
                • Usage data and device information
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.paragraph}>
                We use the information we collect to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Provide, maintain, and improve our services
              </Text>
              <Text style={styles.bulletPoint}>
                • Send you notifications and updates
              </Text>
              <Text style={styles.bulletPoint}>
                • Respond to your comments and questions
              </Text>
              <Text style={styles.bulletPoint}>
                • Protect against fraudulent or illegal activity
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Information Sharing</Text>
              <Text style={styles.paragraph}>
                We do not sell your personal information. We may share your information
                only in the following circumstances:
              </Text>
              <Text style={styles.bulletPoint}>
                • With your consent
              </Text>
              <Text style={styles.bulletPoint}>
                • With service providers who assist in our operations
              </Text>
              <Text style={styles.bulletPoint}>
                • To comply with legal obligations
              </Text>
              <Text style={styles.bulletPoint}>
                • To protect rights and safety
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Data Security</Text>
              <Text style={styles.paragraph}>
                We implement appropriate security measures to protect your personal
                information. However, no method of transmission over the internet is
                100% secure, and we cannot guarantee absolute security.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Data Retention</Text>
              <Text style={styles.paragraph}>
                We retain your personal information for as long as necessary to provide
                our services and as required by law. You may request deletion of your
                data at any time.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Your Rights</Text>
              <Text style={styles.paragraph}>
                You have the right to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Access your personal information
              </Text>
              <Text style={styles.bulletPoint}>
                • Correct inaccurate data
              </Text>
              <Text style={styles.bulletPoint}>
                • Request deletion of your data
              </Text>
              <Text style={styles.bulletPoint}>
                • Export your data
              </Text>
              <Text style={styles.bulletPoint}>
                • Opt-out of marketing communications
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
              <Text style={styles.paragraph}>
                We use cookies and similar tracking technologies to collect information
                about your browsing activities and to improve our services.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
              <Text style={styles.paragraph}>
                Our Service is not intended for children under 13. We do not knowingly
                collect personal information from children under 13.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Changes to Privacy Policy</Text>
              <Text style={styles.paragraph}>
                We may update this Privacy Policy from time to time. We will notify you
                of any changes by posting the new Privacy Policy on this page.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have any questions about this Privacy Policy, please contact us
                at privacy@homiehq.com
              </Text>
            </View>
          </View>
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
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.textPrimary,
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
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  lastUpdated: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  mainSection: {
    marginBottom: spacing.xxl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  mainSectionTitle: {
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
    paddingLeft: spacing.md,
  },
});
