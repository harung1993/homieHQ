import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import WelcomeCard from '../components/WelcomeCard';
import ListItem from '../components/ListItem';
import SectionHeader from '../components/SectionHeader';
import ConnectionPrompt from '../components/ConnectionPrompt';
import useBackendConnection from '../hooks/useBackendConnection';
import apiService from '../services/api';

export default function FinancesScreen({ navigation }) {
  const { isConnected, isChecking, needsSetup, recheckConnection } = useBackendConnection();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, net: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFinances = async () => {
    if (!isConnected) return;

    try {
      setError(null);

      // Fetch both transactions and summary
      const [transactionsData, summaryData] = await Promise.all([
        apiService.finances.getTransactions(),
        apiService.finances.getSummary().catch(() => ({ income: 0, expenses: 0, net: 0 }))
      ]);

      // Map transactions to expected format
      const formattedTransactions = transactionsData.map(transaction => {
        const isIncome = transaction.type?.toLowerCase() === 'income' || transaction.amount > 0;
        return {
          id: transaction.id,
          icon: isIncome ? '💵' : '💸',
          title: transaction.description || transaction.title,
          subtitle: `${transaction.property?.address || 'Unknown'} • ${formatDate(transaction.date || transaction.created_at)}`,
          amount: formatAmount(transaction.amount),
          type: isIncome ? 'income' : 'expense',
          gradientColors: isIncome
            ? [colors.gradientGreenStart, colors.gradientGreenEnd]
            : [colors.gradientRedStart, colors.gradientRedEnd],
        };
      });

      setTransactions(formattedTransactions);
      setSummary({
        income: summaryData.income || summaryData.total_income || 0,
        expenses: summaryData.expenses || summaryData.total_expenses || 0,
        net: summaryData.net || summaryData.net_income || 0,
      });
    } catch (err) {
      console.error('Error fetching finances:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinances();
  };

  useEffect(() => {
    if (isConnected && !isChecking) {
      fetchFinances();
    }
  }, [isConnected, isChecking]);

  if (needsSetup && !isChecking) {
    return (
      <ConnectionPrompt
        visible={true}
        onConfigure={() => navigation.navigate('Settings')}
        onRetry={recheckConnection}
      />
    );
  }

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
              <Text style={styles.logoEmoji}>💰</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Finances</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading finances...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : (
            <>
              {/* Total Income Card */}
              <View style={styles.totalIncomeCard}>
                <LinearGradient
                  colors={[colors.gradientGreenStart, colors.gradientGreenEnd]}
                  style={styles.totalIncomeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.totalIncomeLabel}>Total Income</Text>
                  <Text style={styles.totalIncomeAmount}>
                    ${summary.income.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                </LinearGradient>
              </View>

              {/* Quick Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Expenses</Text>
                  <Text style={styles.statAmount}>
                    ${summary.expenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Net Income</Text>
                  <Text style={[styles.statAmount, { color: summary.net >= 0 ? colors.success : colors.error }]}>
                    ${summary.net.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>

              {/* Recent Transactions */}
              <SectionHeader title="Recent Transactions" />
              {transactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              ) : (
                transactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <LinearGradient
                        colors={transaction.gradientColors}
                        style={styles.transactionIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.transactionEmoji}>{transaction.icon}</Text>
                      </LinearGradient>
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionTitle}>{transaction.title}</Text>
                        <Text style={styles.transactionSubtitle}>{transaction.subtitle}</Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'income' ? colors.success : colors.error }
                    ]}>
                      {transaction.amount}
                    </Text>
                  </View>
                ))
              )}
            </>
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
  totalIncomeCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  totalIncomeGradient: {
    padding: spacing.xl,
  },
  totalIncomeLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  totalIncomeAmount: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxlarge * 1.2,
    fontWeight: typography.weights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  statAmount: {
    color: colors.textPrimary,
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionEmoji: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semibold,
    marginBottom: 2,
  },
  transactionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
  },
  transactionAmount: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    marginTop: spacing.md,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.medium,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
  },
});
