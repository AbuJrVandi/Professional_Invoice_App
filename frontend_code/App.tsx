import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { AuthProvider } from './src/components/AuthProvider';
import { Navigation } from './src/navigation';
import { theme } from './src/constants/theme';

export default function App() {
  return (
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
}
