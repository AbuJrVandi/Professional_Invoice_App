import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Input, Button, Divider } from '@rneui/themed';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { theme } from '../constants/theme';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { invoices } from '../services/api';

interface InvoiceItem {
  description: string;
  quantity: string;
  rate: string;
  total: string;
}

interface InvoiceForm {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: string;
  tax: string;
  total: string;
  bankName: string;
  accountNumber: string;
  swift: string;
  mobilePayment: string;
  notes: string;
}

const COMPANY_INFO = {
  name: "Invoice App",
  email: "abujuniorv@gmail.com",
  address: "Hill Station",
  phone: "073914398",
  website: "abujuniorv.page.dev"
};

export function CreateInvoiceScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [form, setForm] = useState<InvoiceForm>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    items: [{ description: '', quantity: '', rate: '', total: '' }],
    subtotal: '0',
    tax: '0',
    total: '0',
    bankName: '',
    accountNumber: '',
    swift: '',
    mobilePayment: '',
    notes: 'Thank you for your business! Please pay within 14 days.\nLate payments are subject to a 5% penalty.',
  });

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const asset = Asset.fromModule(require('../../assets/Invoice_logo.jpg'));
      await asset.downloadAsync();
      if (asset.localUri) {
        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setLogoBase64(base64);
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.rate) || 0;
      return sum + itemTotal;
    }, 0);
    
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    setForm(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    }));
  };

  const updateItemTotal = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...form.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].total = (qty * rate).toFixed(2);
    }

    setForm(prev => ({
      ...prev,
      items: newItems,
    }));

    calculateTotals();
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '', rate: '', total: '' }],
    }));
  };

  const removeItem = (index: number) => {
    if (form.items.length === 1) {
      Alert.alert('Error', 'You must have at least one item');
      return;
    }

    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    calculateTotals();
  };

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 40px;
              color: #333;
              line-height: 1.5;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            
            .company-logo {
              max-width: 120px;
              height: auto;
              margin-bottom: 15px;
              filter: grayscale(100%);
            }
            
            .company-name {
              font-size: 24px;
              font-weight: 600;
              color: #4361ee;
              margin: 10px 0;
            }
            
            .company-info {
              font-size: 14px;
              color: #666;
              margin: 4px 0;
            }
            
            .divider {
              border-top: 1px solid #e0e0e0;
              margin: 20px 0;
            }
            
            .invoice-details {
              margin-bottom: 30px;
            }
            
            .invoice-number {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            
            .date-info {
              color: #666;
              margin: 5px 0;
            }
            
            .bill-to {
              margin-bottom: 30px;
            }
            
            .bill-to h3 {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            
            .bill-to p {
              margin: 5px 0;
              color: #666;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background-color: #fff;
            }
            
            th {
              background-color: #f8f9fa;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #333;
              border-bottom: 2px solid #e0e0e0;
            }
            
            td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e0e0e0;
            }
            
            .totals {
              margin-left: auto;
              width: 300px;
              margin-top: 20px;
            }
            
            .totals p {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              padding: 5px 0;
            }
            
            .total-due {
              font-weight: 600;
              font-size: 16px;
              border-top: 2px solid #e0e0e0;
              padding-top: 10px !important;
            }
            
            .payment-info {
              margin: 30px 0;
            }
            
            .payment-info h3 {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            
            .payment-info p {
              margin: 5px 0;
              color: #666;
            }
            
            .notes {
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            
            .notes h3 {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${logoBase64 ? `<img src="data:image/jpeg;base64,${logoBase64}" alt="Invoice App Logo" class="company-logo"/>` : ''}
              <div class="company-name">${COMPANY_INFO.name}</div>
              <div class="company-info">${COMPANY_INFO.address}</div>
              <div class="company-info">Phone: ${COMPANY_INFO.phone}</div>
              <div class="company-info">Email: ${COMPANY_INFO.email}</div>
              <div class="company-info">Website: ${COMPANY_INFO.website}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="invoice-details">
              <div class="invoice-number">INVOICE #: ${form.invoiceNumber}</div>
              <div class="date-info">Date: ${form.date}</div>
              <div class="date-info">Due Date: ${form.dueDate}</div>
            </div>

            <div class="bill-to">
              <h3>Bill To:</h3>
              <p>${form.clientName}</p>
              <p>${form.clientCompany}</p>
              <p>${form.clientEmail}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${form.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>NLe ${item.rate}</td>
                    <td>NLe ${item.total}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <p>
                <span>Subtotal:</span>
                <span>NLe ${form.subtotal}</span>
              </p>
              <p>
                <span>Tax (5%):</span>
                <span>NLe ${form.tax}</span>
              </p>
              <p class="total-due">
                <span>Total Due:</span>
                <span>NLe ${form.total}</span>
              </p>
            </div>

            <div class="divider"></div>

            <div class="payment-info">
              <h3>Payment Instructions:</h3>
              <p>Bank Name: ${form.bankName}</p>
              <p>Account Number: ${form.accountNumber}</p>
              <p>SWIFT: ${form.swift}</p>
              <p>Mobile Payment: ${form.mobilePayment}</p>
            </div>

            <div class="notes">
              <h3>Notes:</h3>
              <p>${form.notes.replace(/\n/g, '<br/>')}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const html = generateHTML();
      
      if (Platform.OS === 'web') {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
        }
      } else {
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false
        });
        
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf'
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!form.clientName || !form.clientEmail) {
        Alert.alert('Error', 'Client name and email are required');
        return;
      }

      // Validate items
      const hasInvalidItems = form.items.some(item => 
        !item.description || 
        !item.quantity || 
        !item.rate || 
        parseFloat(item.quantity) <= 0 || 
        parseFloat(item.rate) <= 0
      );

      if (hasInvalidItems) {
        Alert.alert('Error', 'All items must have a description, quantity, and rate');
        return;
      }

      // Calculate totals one final time to ensure accuracy
      calculateTotals();

      // Format data for backend
      const invoiceData = {
        invoiceNumber: form.invoiceNumber,
        date: new Date(form.date).toISOString(),
        dueDate: new Date(form.dueDate).toISOString(),
        clientName: form.clientName.trim(),
        clientCompany: form.clientCompany.trim() || null,
        clientEmail: form.clientEmail.trim(),
        items: form.items.map(item => ({
          description: item.description.trim(),
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          total: parseFloat(item.total)
        })).filter(item => item.quantity > 0 && item.rate > 0),
        subtotal: parseFloat(form.subtotal),
        tax: parseFloat(form.tax),
        total: parseFloat(form.total),
        bankName: form.bankName.trim() || null,
        accountNumber: form.accountNumber.trim() || null,
        swift: form.swift.trim() || null,
        mobilePayment: form.mobilePayment.trim() || null,
        notes: form.notes.trim() || null,
        status: 'draft'
      };

      // Validate final data
      if (invoiceData.items.length === 0) {
        Alert.alert('Error', 'At least one valid item is required');
        return;
      }

      if (invoiceData.total <= 0) {
        Alert.alert('Error', 'Total amount must be greater than zero');
        return;
      }

      const response = await invoices.create(invoiceData);
      
      Alert.alert(
        'Success',
        'Invoice created successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and refresh the invoice list
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [
                    { name: 'InvoicesMain' }
                  ],
                })
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text h4 style={[styles.sectionTitle, { color: theme.lightColors.primary }]}>Invoice Details</Text>
        <Input
          label="Invoice Number"
          value={form.invoiceNumber}
          onChangeText={(value) => setForm(prev => ({ ...prev, invoiceNumber: value }))}
        />
        <Input
          label="Date"
          value={form.date}
          onChangeText={(value) => setForm(prev => ({ ...prev, date: value }))}
        />
        <Input
          label="Due Date"
          value={form.dueDate}
          onChangeText={(value) => setForm(prev => ({ ...prev, dueDate: value }))}
        />

        <Divider style={styles.divider} />
        
        <Text h4 style={[styles.sectionTitle, { color: theme.lightColors.primary }]}>Client Information</Text>
        <Input
          label="Client Name"
          value={form.clientName}
          onChangeText={(value) => setForm(prev => ({ ...prev, clientName: value }))}
        />
        <Input
          label="Company"
          value={form.clientCompany}
          onChangeText={(value) => setForm(prev => ({ ...prev, clientCompany: value }))}
        />
        <Input
          label="Email"
          value={form.clientEmail}
          onChangeText={(value) => setForm(prev => ({ ...prev, clientEmail: value }))}
          keyboardType="email-address"
        />

        <Divider style={styles.divider} />
        
        <Text h4 style={[styles.sectionTitle, { color: theme.lightColors.primary }]}>Items</Text>
        {form.items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Input
              label="Description"
              value={item.description}
              onChangeText={(value) => updateItemTotal(index, 'description', value)}
            />
            <Input
              label="Quantity"
              value={item.quantity}
              onChangeText={(value) => updateItemTotal(index, 'quantity', value)}
              keyboardType="numeric"
            />
            <Input
              label="Rate (NLe)"
              value={item.rate}
              onChangeText={(value) => updateItemTotal(index, 'rate', value)}
              keyboardType="numeric"
            />
            <Text style={styles.itemTotal}>Total: NLe {item.total}</Text>
            <Button
              title="Remove"
              type="outline"
              onPress={() => removeItem(index)}
              containerStyle={styles.removeButton}
            />
          </View>
        ))}
        
        <Button
          title="Add Item"
          type="outline"
          onPress={addItem}
          containerStyle={styles.addButton}
        />

        <Divider style={styles.divider} />
        
        <Text h4 style={[styles.sectionTitle, { color: theme.lightColors.primary }]}>Payment Information</Text>
        <Input
          label="Bank Name"
          value={form.bankName}
          onChangeText={(value) => setForm(prev => ({ ...prev, bankName: value }))}
        />
        <Input
          label="Account Number"
          value={form.accountNumber}
          onChangeText={(value) => setForm(prev => ({ ...prev, accountNumber: value }))}
        />
        <Input
          label="SWIFT"
          value={form.swift}
          onChangeText={(value) => setForm(prev => ({ ...prev, swift: value }))}
        />
        <Input
          label="Mobile Payment"
          value={form.mobilePayment}
          onChangeText={(value) => setForm(prev => ({ ...prev, mobilePayment: value }))}
        />

        <Divider style={styles.divider} />
        
        <Text h4 style={[styles.sectionTitle, { color: theme.lightColors.primary }]}>Notes</Text>
        <Input
          label="Notes"
          value={form.notes}
          onChangeText={(value) => setForm(prev => ({ ...prev, notes: value }))}
          multiline
          numberOfLines={4}
        />

        <View style={styles.totalsContainer}>
          <Text style={styles.totalText}>Subtotal: NLe {form.subtotal}</Text>
          <Text style={styles.totalText}>Tax (5%): NLe {form.tax}</Text>
          <Text style={styles.totalText}>Total: NLe {form.total}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Saving...' : 'Save & Generate PDF'}
            onPress={handleSubmit}
            disabled={loading}
            containerStyle={styles.submitButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.lightColors.background,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 20,
  },
  itemContainer: {
    backgroundColor: theme.lightColors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.lightColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'right',
    color: theme.lightColors.primary,
  },
  removeButton: {
    marginTop: 8,
  },
  addButton: {
    marginVertical: 16,
  },
  totalsContainer: {
    backgroundColor: theme.lightColors.white,
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  totalText: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.lightColors.grey0,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  submitButton: {
    width: '100%',
  }
}); 