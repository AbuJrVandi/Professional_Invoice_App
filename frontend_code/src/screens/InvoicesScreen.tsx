import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Animated, Platform, TouchableOpacity, Switch } from 'react-native';
import { Text, Card, Button, Icon, Input, FAB, Divider, Overlay } from '@rneui/themed';
import { categories, invoices } from '../services/api';
import { Category, CategoryField, Invoice } from '../types';
import { theme, styles as globalStyles } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { Theme } from '@rneui/themed';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InvoiceCard } from '../components/InvoiceCard';

type RootStackParamList = {
  CreateInvoice: undefined;
  InvoicesMain: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_COLORS = [
  ['#4158D0', '#C850C0'],
  ['#0093E9', '#80D0C7'],
  ['#8EC5FC', '#E0C3FC'],
  ['#D9AFD9', '#97D9E1'],
  ['#00DBDE', '#FC00FF'],
  ['#0700b8', '#00ff88'],
];

const STATUS_COLORS = {
  draft: ['#718096', '#4A5568'] as [string, string],
  pending: ['#ED8936', '#DD6B20'] as [string, string],
  paid: ['#48BB78', '#38A169'] as [string, string],
  cancelled: ['#E53E3E', '#C53030'] as [string, string],
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export function InvoicesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    fields: [] as CategoryField[],
  });
  const [newField, setNewField] = useState({
    name: '',
    type: 'text',
    required: true,
    label: '',
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const gradientColors: [string, string][] = [
    ['#4e54c8', '#8f94fb'], // Blue-Purple
    ['#11998e', '#38ef7d'], // Green
    ['#fc4a1a', '#f7b733'], // Orange
    ['#00b4db', '#0083b0'], // Light Blue
    ['#ad5389', '#3c1053']  // Purple
  ];

  useEffect(() => {
    loadCategories();
    loadInvoices();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [categoryList]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categories.getAll();
      const formattedCategories = response.map(category => ({
        ...category,
        fields: Array.isArray(category.fields) 
          ? category.fields.map(field => ({
              name: field.name,
              label: field.label,
              type: field.type || 'text',
              required: field.required ?? true
            }))
          : []
      }));
      console.log('Loaded categories:', formattedCategories);
      setCategoryList(formattedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoices.getAll();
      setInvoiceList(response);
    } catch (error) {
      console.error('Error loading invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  // Refresh invoices when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadInvoices();
    }, [])
  );

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      setLoading(true);
      const categoryToCreate = {
        ...newCategory,
        fields: newCategory.fields.map(field => ({
          ...field,
          type: field.type || 'text',
          required: field.required ?? true,
        })),
      };
      await categories.create(categoryToCreate);
      setShowAddForm(false);
      setNewCategory({ name: '', description: '', fields: [] });
      await loadCategories();
      Alert.alert('Success', 'Category created successfully');
    } catch (error) {
      console.error('Failed to create category:', error);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    if (!newField.name || !newField.label) {
      Alert.alert('Error', 'Field name and label are required');
      return;
    }

    setNewCategory({
      ...newCategory,
      fields: [...newCategory.fields, {
        ...newField,
        name: newField.name.toLowerCase().trim(),
      }],
    });
    setNewField({ name: '', type: 'text', required: true, label: '' });
  };

  const handleDeleteCategory = async (id: number) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await categories.delete(id);
              await loadCategories();
              Alert.alert('Success', 'Category deleted successfully');
            } catch (error) {
              console.error('Failed to delete category:', error);
              Alert.alert('Error', 'Failed to delete category. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsVisible(true);
  };

  const getBase64Logo = async () => {
    try {
      const asset = Asset.fromModule(require('../../assets/Invoice_logo.jpg'));
      await asset.downloadAsync();
      if (asset.localUri) {
        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return `data:image/jpeg;base64,${base64}`;
      }
      throw new Error('Failed to load logo');
    } catch (error) {
      console.error('Error loading logo:', error);
      return null;
    }
  };

  const handleDownload = async (invoiceId: number) => {
    try {
      setLoading(true);
      await invoices.generatePDF(invoiceId);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
        'Failed to generate PDF. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId: number) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await invoices.delete(invoiceId);
              loadInvoices();
              Alert.alert('Success', 'Invoice deleted successfully');
            } catch (error) {
              console.error('Error deleting invoice:', error);
              Alert.alert('Error', 'Failed to delete invoice');
            }
          }
        }
      ]
    );
  };

  const getInvoiceFields = (invoice: Invoice) => {
    const fields = [];
    if (invoice.items && Array.isArray(invoice.items)) {
      fields.push(
        { label: 'Total', value: `NLe ${invoice.total.toLocaleString()}` }
      );
      
      invoice.items.forEach(item => {
        fields.push(
          { label: item.description, value: `NLe ${item.total.toLocaleString()}` }
        );
      });
    }
    return fields;
  };

  const renderFieldBadge = (field: CategoryField) => (
    <View style={[styles.fieldBadge, field.required ? styles.requiredField : styles.optionalField]}>
      <Text style={styles.fieldBadgeText}>{field.type}</Text>
    </View>
  );

  const renderInvoiceCard = (invoice: Invoice, index: number) => {
    const colorIndex = index % CATEGORY_COLORS.length;
    const colors = CATEGORY_COLORS[colorIndex];
    
    return (
        <Animated.View
          style={[
          styles.invoiceCard,
            { opacity: fadeAnim }
          ]}
        >
        <TouchableOpacity onPress={() => handleViewDetails(invoice)}>
          <LinearGradient
            colors={STATUS_COLORS[invoice.status]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
                <Text style={styles.categoryName}>{invoice.categoryName}</Text>
              </View>
              <Text style={styles.amount}>${invoice.totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Issue Date:</Text>
                <Text style={styles.dateValue}>
                  {formatDate(invoice.issueDate)}
                </Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Due Date:</Text>
                <Text style={styles.dateValue}>
                  {formatDate(invoice.dueDate)}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.statusContainer}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDownload(invoice.id)}
                >
                  <Icon name="download" type="font-awesome" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(invoice.id)}
                >
                  <Icon name="trash" type="font-awesome" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        </Animated.View>
    );
  };

  const renderAddForm = () => (
    <View style={styles.addFormContainer}>
      <Text style={styles.formTitle}>Add New Category</Text>
      
      <View style={styles.inputContainer}>
      <Input
        placeholder="Category Name"
        value={newCategory.name}
        onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
          leftIcon={<Icon name="folder" type="font-awesome" size={20} color={theme.lightColors?.primary} />}
      />
      </View>

      <View style={styles.inputContainer}>
      <Input
        placeholder="Description (Optional)"
        value={newCategory.description}
        onChangeText={(text) => setNewCategory({ ...newCategory, description: text })}
          leftIcon={<Icon name="file-text" type="font-awesome" size={20} color={theme.lightColors?.primary} />}
        multiline
      />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldTitle}>Add Field</Text>
        </View>

        <Input
          placeholder="Field Name (e.g., amount)"
          value={newField.name}
          onChangeText={(text) => setNewField({ ...newField, name: text })}
          leftIcon={<Icon name="tag" type="font-awesome" size={18} color={theme.lightColors?.primary} />}
        />

        <Input
          placeholder="Field Label (e.g., Amount)"
          value={newField.label}
          onChangeText={(text) => setNewField({ ...newField, label: text })}
          leftIcon={<Icon name="font" type="font-awesome" size={18} color={theme.lightColors?.primary} />}
        />

        <View style={styles.fieldTypeContainer}>
          {['text', 'number', 'date'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                newField.type === type && styles.activeTypeButton,
              ]}
              onPress={() => setNewField({ ...newField, type })}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  newField.type === type && styles.activeTypeButtonText,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.requiredSwitch}>
          <Text style={{ flex: 1, color: '#4a5568' }}>Required Field</Text>
          <Switch
            value={newField.required}
            onValueChange={(value) => setNewField({ ...newField, required: value })}
            trackColor={{ false: '#cbd5e0', true: theme.lightColors?.primary }}
          />
        </View>

        <Button
          title="Add Field"
          onPress={handleAddField}
          buttonStyle={styles.addFieldButton}
          icon={<Icon name="plus" type="font-awesome" size={16} color="white" style={{ marginRight: 8 }} />}
        />

        {newCategory.fields.length > 0 && (
          <View style={styles.fieldList}>
            {newCategory.fields.map((field, index) => (
              <View key={index} style={styles.fieldItem}>
                <View style={styles.fieldItemContent}>
                  <Text style={styles.fieldItemLabel}>{field.label}</Text>
                  <Text style={styles.fieldItemName}>{field.name}</Text>
                </View>
                {renderFieldBadge(field)}
              </View>
            ))}
          </View>
        )}
      </View>

        <Button
          title="Create Category"
          onPress={handleAddCategory}
        loading={loading}
        disabled={loading}
        buttonStyle={styles.submitButton}
        icon={<Icon name="check" type="font-awesome" size={16} color="white" style={{ marginRight: 8 }} />}
        />
      </View>
  );

  const handleCreateInvoice = () => {
    navigation.navigate('CreateInvoice');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
      >
        {showAddForm ? (
          renderAddForm()
        ) : (
          invoiceList.map((invoice, index) => (
            <React.Fragment key={invoice.id}>
              <InvoiceCard
                key={invoice.id}
                clientName={invoice.clientName}
                companyName={invoice.clientCompany || 'No Company'}
                invoiceNumber={invoice.invoiceNumber}
                gradientColors={gradientColors[index % gradientColors.length]}
                onDownload={() => handleDownload(invoice.id)}
                onDelete={() => handleDelete(invoice.id)}
              />
            </React.Fragment>
          ))
        )}
        </ScrollView>

      {!showAddForm && (
        <FAB
          icon={{ name: 'add', color: theme.lightColors.white }}
          color={theme.lightColors.primary}
          placement="right"
          onPress={() => navigation.navigate('CreateInvoice')}
          style={styles.fab}
        />
      )}

      {selectedInvoice && (
        <Overlay
          isVisible={detailsVisible}
          onBackdropPress={() => setDetailsVisible(false)}
          overlayStyle={styles.overlay}
        >
          <View style={styles.detailsContainer}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>
                Invoice #{selectedInvoice.invoiceNumber}
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDownload(selectedInvoice.id)}
                >
                  <Icon name="download" type="font-awesome" size={20} color={theme.lightColors?.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(selectedInvoice.id)}
                >
                  <Icon name="trash" type="font-awesome" size={20} color={theme.lightColors?.error} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.detailsContent}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{selectedInvoice.categoryName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[selectedInvoice.status][0] }]}>
                  <Text style={styles.statusText}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>${selectedInvoice.totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issue Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedInvoice.issueDate)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedInvoice.dueDate)}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <Text style={styles.sectionTitle}>Fields</Text>
              {Object.entries(selectedInvoice.fields).map(([key, value]) => (
                <View key={key} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))}

              <View style={styles.statusActions}>
                <Text style={styles.sectionTitle}>Update Status</Text>
                <View style={styles.statusButtons}>
                  {(['draft', 'pending', 'paid', 'cancelled'] as Invoice['status'][]).map((status) => (
                    <Button
                      key={status}
                      title={status.charAt(0).toUpperCase() + status.slice(1)}
                      type={selectedInvoice.status === status ? 'solid' : 'outline'}
                      buttonStyle={[
                        styles.statusButton,
                        selectedInvoice.status === status && { backgroundColor: STATUS_COLORS[status][0] }
                      ]}
                      titleStyle={styles.statusButtonText}
                      onPress={() => handleUpdateStatus(selectedInvoice.id, status)}
                      disabled={selectedInvoice.status === status}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </Overlay>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.lightColors.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.lightColors.grey3,
  },
  invoiceCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  categoryName: {
    fontSize: 16,
    color: theme.lightColors.grey2,
    marginBottom: 16,
  },
  amount: {
    fontSize: 14,
    color: 'white',
  },
  cardContent: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.lightColors.grey1,
  },
  dateValue: {
    fontSize: 14,
    color: theme.lightColors.grey2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: theme.lightColors.primary,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  description: {
    fontSize: 16,
    color: theme.lightColors.grey2,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  fieldsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.lightColors.grey1,
  },
  fieldsContainer: {
    gap: 12,
  },
  fieldItem: {
    backgroundColor: theme.lightColors.grey5,
    padding: 12,
    borderRadius: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.lightColors.grey1,
  },
  fieldName: {
    fontSize: 14,
    color: theme.lightColors.grey2,
  },
  fieldBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredField: {
    backgroundColor: theme.lightColors.primary,
  },
  optionalField: {
    backgroundColor: theme.lightColors.grey3,
  },
  fieldBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noFields: {
    fontSize: 16,
    color: theme.lightColors.grey3,
    fontStyle: 'italic',
  },
  noCategories: {
    fontSize: 18,
    color: theme.lightColors.grey3,
    textAlign: 'center',
    marginTop: 32,
  },
  addFormContainer: {
    borderRadius: 12,
    padding: 16,
    margin: 0,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.lightColors.grey1,
  },
  inputContainer: {
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.lightColors.grey1,
  },
  fieldTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activeTypeButton: {
    backgroundColor: theme.lightColors.primary,
  },
  typeButtonText: {
    color: theme.lightColors.grey1,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTypeButtonText: {
    color: 'white',
  },
  requiredSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addFieldButton: {
    marginBottom: 8,
  },
  fieldList: {
    marginBottom: 16,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.lightColors.grey5,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fieldItemContent: {
    flex: 1,
  },
  fieldItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.lightColors.grey1,
  },
  fieldItemName: {
    fontSize: 14,
    color: theme.lightColors.grey2,
  },
  submitButton: {
    marginTop: 16,
  },
  overlay: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  detailsContainer: {
    flex: 1,
  },
  detailsHeader: {
    backgroundColor: theme.lightColors.primary,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  detailsContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.lightColors.grey1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.lightColors.grey5,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.lightColors.grey1,
  },
  detailValue: {
    fontSize: 14,
    color: theme.lightColors.grey2,
  },
  closeButton: {
    margin: 20,
  },
  fab: {
    margin: 16,
    right: 0,
    bottom: 0,
  },
  statusActions: {
    marginTop: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
  },
  statusButtonText: {
    color: theme.lightColors.grey1,
    fontSize: 14,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
}); 