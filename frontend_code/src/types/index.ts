export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  fields: CategoryField[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryField {
  name: string;
  type: string;
  required: boolean;
  label: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  avatar?: string;
  avatarColor?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isBiometricEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  enableBiometric: () => Promise<void>;
  loginWithBiometric: () => Promise<boolean>;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface InvoiceFormData {
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  items: InvoiceItem[];
  notes?: string;
} 