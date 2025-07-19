import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Input, Button, Icon } from '@rneui/themed';
import { useAuth } from '../hooks/useAuth';
import { theme, styles as globalStyles } from '../constants/theme';

export function LoginScreen() {
  const navigation = useNavigation();
  const { signIn, isBiometricEnabled, loginWithBiometric, enableBiometric, disableBiometric } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    checkBiometricLogin();
  }, []);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const checkBiometricLogin = async () => {
    if (isBiometricEnabled) {
      const shouldPrompt = await new Promise(resolve => {
        Alert.alert(
          'Biometric Login',
          'Would you like to use biometric login?',
          [
            { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Yes', onPress: () => resolve(true) },
          ],
          { cancelable: false }
        );
      });

      if (shouldPrompt) {
        handleBiometricLogin();
      }
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      
      // After successful login, ask user if they want to enable biometric
      if (!isBiometricEnabled) {
        Alert.alert(
          'Enable Biometric Login',
          'Would you like to enable biometric login for future use?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: enableBiometric },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      const success = await loginWithBiometric();
      if (!success && !loading) {
        Alert.alert(
          'Login Failed',
          'Please try again or use email and password'
        );
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert(
        'Login Error',
        'Unable to complete biometric login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleBiometric = () => {
    if (isBiometricEnabled) {
      Alert.alert(
        'Disable Biometric Login',
        'Are you sure you want to disable biometric login?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', onPress: disableBiometric, style: 'destructive' },
        ]
      );
    } else {
      enableBiometric();
    }
  };

  const getBiometricButtonProps = () => {
    if (isBiometricEnabled) {
      return {
        title: "Use Biometric Login",
        icon: <Icon name="fingerprint" color={theme.lightColors.primary} style={styles.biometricIcon} />,
        type: "outline" as const,
        onPress: handleBiometricLogin
      };
    } else {
      return {
        title: "Enable Biometric Login",
        icon: <Icon name="fingerprint" color={theme.lightColors.grey3} style={styles.biometricIcon} />,
        type: "outline" as const,
        onPress: toggleBiometric
      };
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[globalStyles.container, { flexGrow: 1, justifyContent: 'center' }]} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Text h3 style={styles.title}>
          Welcome Back
        </Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Icon name="email" size={24} color={theme.lightColors.grey3} />}
          errorMessage={emailError}
          disabled={loading}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError('');
          }}
          secureTextEntry
          leftIcon={<Icon name="lock" size={24} color={theme.lightColors.grey3} />}
          errorMessage={passwordError}
          disabled={loading}
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          containerStyle={styles.buttonContainer}
        />

        <Button
          {...getBiometricButtonProps()}
          containerStyle={styles.biometricButton}
          disabled={loading}
        />

        {isBiometricEnabled && (
          <Button
            title="Disable Biometric Login"
            onPress={toggleBiometric}
            type="clear"
            containerStyle={styles.disableButton}
            titleStyle={styles.disableButtonText}
            disabled={loading}
          />
        )}

        <Button
          title="Don't have an account? Sign Up"
          type="clear"
          onPress={() => navigation.navigate('Register' as never)}
          containerStyle={styles.linkButton}
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.lightColors.primary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: '5%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: '10%',
  },
  title: {
    textAlign: 'center',
    marginBottom: '3%',
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.lightColors.primary,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.lightColors.grey3,
    marginBottom: '8%',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: '5%',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  biometricButton: {
    marginTop: '4%',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  biometricIcon: {
    marginRight: 8,
  },
  disableButton: {
    marginTop: '3%',
    width: '100%',
  },
  disableButtonText: {
    color: theme.lightColors.error,
  },
  linkButton: {
    marginTop: '6%',
    width: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 