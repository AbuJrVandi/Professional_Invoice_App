import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Input, Button, Divider, Icon, Overlay } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { theme } from '../constants/theme';
import { invoices } from '../services/api';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  total: number;
  date: string;
}

interface Receipt {
  receiptNumber: string;
  date: string;
  invoiceId: number;
  invoiceNumber: string;
  clientName: string;
  paymentMethod: string;
  amountPaid: string;
  notes: string;
}

const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Mobile Money'];

export function CreateReceiptScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  const [form, setForm] = useState<Receipt>({
    receiptNumber: `RCPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    invoiceId: 0,
    invoiceNumber: '',
    clientName: '',
    paymentMethod: 'Bank Transfer',
    amountPaid: '',
    notes: 'Thank you for your payment.',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoices.list();
      setInvoicesList(response);
    } catch (error) {
      console.error('Error loading invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setForm(prev => ({
      ...prev,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      amountPaid: invoice.total.toString(),
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0],
      }));
    }
  };

  const validateForm = () => {
    if (!selectedInvoice) {
      Alert.alert('Error', 'Please select an invoice');
      return false;
    }

    if (!form.amountPaid || parseFloat(form.amountPaid) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (parseFloat(form.amountPaid) > selectedInvoice.total) {
      Alert.alert('Error', 'Amount paid cannot exceed invoice total');
      return false;
    }

    return true;
  };

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .receipt-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .receipt-details {
              margin-bottom: 30px;
            }
            .receipt-row {
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              margin-right: 10px;
            }
            .amount {
              font-size: 20px;
              font-weight: bold;
              margin: 20px 0;
            }
            .notes {
              margin-top: 30px;
              font-style: italic;
            }
            .signature {
              margin-top: 50px;
              border-top: 1px solid #000;
              width: 200px;
              text-align: center;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="receipt-title">RECEIPT</div>
          </div>
          
          <div class="receipt-details">
            <div class="receipt-row">
              <span class="label">Receipt No:</span>
              <span>${form.receiptNumber}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Date:</span>
              <span>${new Date(form.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          <div class="receipt-details">
            <div class="receipt-row">
              <span class="label">Received From:</span>
              <span>${form.clientName}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Invoice No:</span>
              <span>${form.invoiceNumber}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Payment Method:</span>
              <span>${form.paymentMethod}</span>
            </div>
          </div>

          <div class="amount">
            Amount Paid: NLe ${parseFloat(form.amountPaid).toLocaleString()}
          </div>

          <div class="notes">
            ${form.notes}
          </div>

          <div class="signature">
            Signature
          </div>
        </body>
      </html>
    `;
  };

  const handlePreview = async () => {
    if (!validateForm()) return;
    setPreviewVisible(true);
  };

  const handleDownload = async () => {
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
      setPreviewVisible(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      // TODO: Implement receipt saving to backend
      await handleDownload();
      navigation.goBack();
    } catch (error) {
      console.error('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text h4 style={styles.sectionTitle}>Create Receipt</Text>
        
        {/* Invoice Selection */}
        <Text style={styles.label}>Select Invoice</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedInvoice?.id || ''}
            onValueChange={(itemValue) => {
              const invoice = invoicesList.find(inv => inv.id === itemValue);
              if (invoice) handleInvoiceSelect(invoice);
            }}
          >
            <Picker.Item label="Select an invoice..." value="" />
            {invoicesList.map(invoice => (
              <Picker.Item
                key={invoice.id}
                label={`${invoice.invoiceNumber} - ${invoice.clientName}`}
                value={invoice.id}
              />
            ))}
          </Picker>
        </View>

        <Divider style={styles.divider} />

        {/* Receipt Details */}
        <Input
          label="Receipt Number"
          value={form.receiptNumber}
          onChangeText={(value) => setForm(prev => ({ ...prev, receiptNumber: value }))}
        />

        <Text style={styles.label}>Date</Text>
        <Button
          title={form.date || 'Select date'}
          type="outline"
          onPress={() => setShowDatePicker(true)}
          buttonStyle={styles.dateButton}
        />
        {showDatePicker && (
          <DateTimePicker
            value={new Date(form.date)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Input
          label="Client Name"
          value={form.clientName}
          disabled
        />

        <Input
          label="Invoice Number"
          value={form.invoiceNumber}
          disabled
        />

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.paymentMethod}
            onValueChange={(value) => setForm(prev => ({ ...prev, paymentMethod: value }))}
          >
            {PAYMENT_METHODS.map(method => (
              <Picker.Item key={method} label={method} value={method} />
            ))}
          </Picker>
        </View>

        <Input
          label="Amount Paid"
          value={form.amountPaid}
          onChangeText={(value) => setForm(prev => ({ ...prev, amountPaid: value }))}
          keyboardType="numeric"
          placeholder="0.00"
        />

        <Input
          label="Notes"
          value={form.notes}
          onChangeText={(value) => setForm(prev => ({ ...prev, notes: value }))}
          multiline
          numberOfLines={3}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Preview"
            onPress={handlePreview}
            type="outline"
            containerStyle={[styles.button, styles.previewButton]}
          />
          <Button
            title={loading ? 'Saving...' : 'Save & Download'}
            onPress={handleSubmit}
            disabled={loading}
            containerStyle={styles.button}
          />
        </View>
      </View>

      <Overlay
        isVisible={previewVisible}
        onBackdropPress={() => setPreviewVisible(false)}
        overlayStyle={styles.overlay}
      >
        <ScrollView>
          <View style={styles.previewHeader}>
            <Text h4>Receipt Preview</Text>
            <Icon
              name="close"
              onPress={() => setPreviewVisible(false)}
              containerStyle={styles.closeIcon}
            />
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>RECEIPT</Text>
            <Text>Receipt No: {form.receiptNumber}</Text>
            <Text>Date: {new Date(form.date).toLocaleDateString()}</Text>
            <Text>Received From: {form.clientName}</Text>
            <Text>Invoice No: {form.invoiceNumber}</Text>
            <Text>Payment Method: {form.paymentMethod}</Text>
            <Text style={styles.previewAmount}>
              Amount Paid: NLe {parseFloat(form.amountPaid).toLocaleString()}
            </Text>
            <Text style={styles.previewNotes}>{form.notes}</Text>
          </View>
          <Button
            title="Download PDF"
            onPress={handleDownload}
            containerStyle={styles.downloadButton}
          />
        </ScrollView>
      </Overlay>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    color: theme.lightColors.primary,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#86939e',
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 10,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e1e8ee',
  },
  dateButton: {
    marginHorizontal: 10,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  previewButton: {
    borderColor: theme.lightColors.primary,
  },
  overlay: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ee',
  },
  closeIcon: {
    padding: 5,
  },
  previewContent: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  previewNotes: {
    fontStyle: 'italic',
    marginTop: 20,
  },
  downloadButton: {
    marginTop: 20,
    marginHorizontal: 20,
  },
}); 