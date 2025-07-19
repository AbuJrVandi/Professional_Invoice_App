import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Input, Button, Text, Icon } from '@rneui/themed';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { theme, styles as globalStyles } from '../constants/theme';

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  username: yup.string().required('Username is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  phoneNumber: yup.string().optional(),
  address: yup.string().optional(),
});

interface RegisterForm {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  address?: string;
}

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...userData } = data;
      await register(userData);
      Alert.alert(
        'Success',
        'Registration successful! You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Please try again with different credentials'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text h1 style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Full Name"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.fullName?.message}
                disabled={isLoading}
                leftIcon={<Icon name="person" size={24} color={theme.lightColors.grey3} />}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
                disabled={isLoading}
                leftIcon={<Icon name="email" size={24} color={theme.lightColors.grey3} />}
              />
            )}
          />

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Username"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.username?.message}
                disabled={isLoading}
                leftIcon={<Icon name="account-circle" size={24} color={theme.lightColors.grey3} />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
                disabled={isLoading}
                leftIcon={<Icon name="lock" size={24} color={theme.lightColors.grey3} />}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirm Password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessage={errors.confirmPassword?.message}
                disabled={isLoading}
                leftIcon={<Icon name="lock" size={24} color={theme.lightColors.grey3} />}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Phone Number (Optional)"
                keyboardType="phone-pad"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.phoneNumber?.message}
                disabled={isLoading}
                leftIcon={<Icon name="phone" size={24} color={theme.lightColors.grey3} />}
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Address (Optional)"
                multiline
                numberOfLines={2}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.address?.message}
                disabled={isLoading}
                leftIcon={<Icon name="location-on" size={24} color={theme.lightColors.grey3} />}
              />
            )}
          />

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            containerStyle={styles.buttonContainer}
          />

          <Button
            title="Already have an account? Sign In"
            type="clear"
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.lightColors.primary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '8%',
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: '5%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    marginBottom: '6%',
    fontSize: 16,
    color: theme.lightColors.grey3,
  },
  buttonContainer: {
    marginVertical: '3%',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 