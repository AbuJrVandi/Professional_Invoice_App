import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateInvoiceScreen } from '../screens/CreateInvoiceScreen';
import { InvoicesScreen } from '../screens/InvoicesScreen';
import { theme } from '../constants/theme';
import { Logo } from '../components/Logo';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreateReceiptScreen } from '../screens/CreateReceiptScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
}

function InvoicesStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="InvoicesMain" 
        component={InvoicesScreen}
        options={{ title: 'Invoices' }}
      />
      <Stack.Screen 
        name="CreateInvoice" 
        component={CreateInvoiceScreen}
        options={{ title: 'Create Invoice' }}
      />
      <Stack.Screen
        name="CreateReceipt"
        component={CreateReceiptScreen}
        options={{
          title: 'Create Receipt',
        }}
      />
    </Stack.Navigator>
  );
}

export function Navigation() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Invoices') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Invoices" 
        component={InvoicesStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
} 