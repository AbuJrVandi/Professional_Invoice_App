import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Category, UpdateProfileData, AuthResponse, Invoice, InvoiceFormData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Configure axios defaults
axios.defaults.baseURL = 'http://172.20.10.3:3000';
axios.defaults.timeout = 10000; // 10 second timeout

// Add token to requests
axios.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // Handle unauthorized error (e.g., redirect to login)
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  getStoredToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem('token');
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await axios.put('/api/auth/profile', data);
    return response.data;
  },
};

export const categories = {
  getAll: async () => {
    const response = await axios.get('/api/categories');
    return response.data;
  },
  
  create: async (categoryData: any) => {
    const response = await axios.post('/api/categories', categoryData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axios.delete(`/api/categories/${id}`);
    return response.data;
  }
};

export const invoices = {
  create: async (invoiceData: any) => {
    const response = await axios.post('/api/invoices', invoiceData);
    return response.data;
  },

  getAll: async () => {
    const response = await axios.get('/api/invoices');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`/api/invoices/${id}`);
    return response.data;
  },

  update: async (id: string, invoiceData: any) => {
    const response = await axios.patch(`/api/invoices/${id}`, invoiceData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`/api/invoices/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: Invoice['status']): Promise<Invoice> => {
    const response = await axios.patch(`/api/invoices/${id}/status`, { status });
    return response.data;
  },

  generatePDF: async (id: number): Promise<void> => {
    try {
      // First verify the server is reachable
      await axios.get('/api/health');

      // Download PDF
      const response = await axios.get(`/api/invoices/${id}/pdf`, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout for PDF generation
      });

      if (!response.data) {
        throw new Error('No PDF data received from server');
      }

      // Create a temporary file path
      const fileUri = FileSystem.documentDirectory + `invoice-${id}.pdf`;
      
      // Convert blob to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (!reader.result) {
            reject(new Error('Failed to read PDF data'));
            return;
          }
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read PDF data'));
        reader.readAsDataURL(response.data);
      });

      // Write the PDF file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        // Share the PDF file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Invoice PDF',
          UTI: 'com.adobe.pdf'
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }

      // Clean up the temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.error('PDF generation error:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        const errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  list: async () => {
    try {
      const response = await axios.get('/api/invoices');
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },
};

export const receipts = {
  create: async (data: any) => {
    const response = await axios.post('/receipts', data);
    return response.data;
  },

  list: async () => {
    const response = await axios.get('/receipts');
    return response.data;
  },

  get: async (id: number) => {
    const response = await axios.get(`/receipts/${id}`);
    return response.data;
  },

  generatePDF: async (id: number) => {
    const response = await axios.get(`/receipts/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default axios; 