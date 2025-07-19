import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Icon, Card } from '@rneui/themed';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { invoices } from '../services/api';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await invoices.list();
      setTotalInvoices(response.length);
      setRecentInvoices(response.slice(0, 5)); // Get last 5 invoices
      
      // Calculate total amount from all invoices
      const total = response.reduce((sum, invoice) => sum + invoice.total, 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <LinearGradient
        colors={[theme.lightColors.primary, '#4e6af5']}
        style={styles.welcomeContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user?.fullName || 'User'}</Text>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card containerStyle={styles.statCard}>
          <View style={styles.statContent}>
            <Icon
              name="receipt"
              type="material"
              color={theme.lightColors.primary}
              size={32}
            />
            <Text style={styles.statNumber}>{totalInvoices}</Text>
            <Text style={styles.statLabel}>Total Receipts</Text>
            <Text style={styles.statSubLabel}>Number of invoices created</Text>
          </View>
        </Card>

        <Card containerStyle={styles.statCard}>
          <View style={styles.statContent}>
            <Icon
              name="description"
              type="material"
              color="#2ecc71"
              size={32}
            />
            <Text style={styles.statNumber}>NLe {totalAmount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={styles.statSubLabel}>For {totalInvoices} invoice{totalInvoices !== 1 ? 's' : ''}</Text>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Button
          title="+ New Receipt"
          onPress={() => navigation.navigate('Invoices', { screen: 'CreateReceipt' })}
          buttonStyle={[styles.actionButton, { backgroundColor: theme.lightColors.primary }]}
          containerStyle={styles.actionButtonContainer}
          icon={{
            name: 'add-circle-outline',
            type: 'ionicon',
            color: 'white',
            size: 20,
          }}
        />
      </View>

      {/* Recent Receipts */}
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Receipts</Text>
          <Text style={styles.sectionSubtitle}>Total: {totalInvoices} invoice{totalInvoices !== 1 ? 's' : ''}</Text>
        </View>
        {recentInvoices.length > 0 ? (
          recentInvoices.map((invoice, index) => (
            <Card key={invoice.id} containerStyle={styles.receiptCard}>
              <View style={styles.receiptContent}>
                <View>
                  <Text style={styles.receiptNumber}>{invoice.invoiceNumber}</Text>
                  <Text style={styles.receiptClient}>{invoice.clientName}</Text>
                </View>
                <Text style={styles.receiptAmount}>NLe {invoice.total.toLocaleString()}</Text>
              </View>
            </Card>
          ))
        ) : (
          <Card containerStyle={styles.emptyCard}>
            <Icon
              name="receipt-long"
              type="material"
              color={theme.lightColors.grey3}
              size={40}
            />
            <Text style={styles.emptyText}>No recent receipts</Text>
            <Button
              title="Create New Receipt"
              onPress={() => navigation.navigate('Invoices', { screen: 'CreateReceipt' })}
              type="clear"
              titleStyle={{ color: theme.lightColors.primary }}
            />
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  nameText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2d3436',
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 5,
  },
  statSubLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 15,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionButtonContainer: {
    borderRadius: 12,
    marginBottom: 10,
  },
  recentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  receiptCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  receiptContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  receiptClient: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 5,
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.lightColors.primary,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.lightColors.grey3,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
}); 