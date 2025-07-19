import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Dimensions, Animated, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Text, Button, Input, Icon, Avatar, Overlay } from '@rneui/themed';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

// Professional avatar options
const avatarOptions = [
  { id: 1, icon: '👨‍💼' },
  { id: 2, icon: '👩‍💼' },
  { id: 3, icon: '👨‍💻' },
  { id: 4, icon: '👩‍💻' },
  { id: 5, icon: '👨‍⚖️' },
  { id: 6, icon: '👩‍⚖️' },
  { id: 7, icon: '👨‍🏫' },
  { id: 8, icon: '👩‍🏫' },
  { id: 9, icon: '👨‍🔧' },
  { id: 10, icon: '👩‍🔧' },
  { id: 11, icon: '👨‍💰' },
  { id: 12, icon: '👩‍💰' },
];

const colorOptions = [
  '#4F46E5', // Indigo
  '#0EA5E9', // Sky Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Blue
  '#064E3B', // Dark Green
  '#7C3AED', // Violet
  '#2563EB', // Royal Blue
  '#DC2626', // Dark Red
];

export function ProfileScreen() {
  const { user, updateProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedColor, setSelectedColor] = useState(theme.lightColors.primary);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: '',
    avatarColor: theme.lightColors.primary,
  });

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
        avatarColor: user.avatarColor || theme.lightColors.primary,
      }));
      setSelectedAvatar(user.avatar || '');
      setSelectedColor(user.avatarColor || theme.lightColors.primary);
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        Alert.alert('Error', 'Current password is required to set a new password');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }
      if (formData.newPassword.length < 8) {
        Alert.alert('Error', 'New password must be at least 8 characters long');
        return;
      }
    }

    try {
      setLoading(true);
      await updateProfile({
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        avatar: selectedAvatar,
        avatarColor: selectedColor,
      });
      Alert.alert('Success', 'Profile updated successfully');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const renderAvatarModal = () => (
    <Overlay
      isVisible={showAvatarModal}
      onBackdropPress={() => setShowAvatarModal(false)}
      overlayStyle={styles.modalContainer}
    >
      <View>
        <Text style={styles.modalTitle}>Choose Your Avatar</Text>
        
        <View style={styles.avatarGrid}>
          {avatarOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.avatarOption,
                selectedAvatar === option.icon && styles.selectedAvatarOption,
              ]}
              onPress={() => setSelectedAvatar(option.icon)}
            >
              <Text style={styles.avatarEmoji}>{option.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.modalTitle, { marginTop: 20 }]}>Choose Color</Text>
        <View style={styles.colorGrid}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColorOption,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <Button
          title="Apply"
          onPress={() => {
            setFormData((prev) => ({
              ...prev,
              avatar: selectedAvatar,
              avatarColor: selectedColor,
            }));
            setShowAvatarModal(false);
          }}
          containerStyle={styles.modalButton}
          buttonStyle={{ backgroundColor: selectedColor }}
        />
      </View>
    </Overlay>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: selectedColor }]}>
        <TouchableOpacity
          onPress={() => setShowAvatarModal(true)}
          style={styles.avatarContainer}
        >
          {selectedAvatar ? (
            <Text style={styles.avatarText}>{selectedAvatar}</Text>
          ) : (
            <Avatar
              size={100}
              title={getInitials(formData.name)}
              containerStyle={styles.avatar}
              rounded
              overlayContainerStyle={{ backgroundColor: selectedColor }}
            />
          )}
          <View style={styles.editAvatarButton}>
            <Icon name="edit" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{formData.name}</Text>
        <Text style={styles.headerSubtitle}>{formData.email}</Text>
      </View>

      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <Input
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            leftIcon={
              <Icon
                name="person"
                type="material"
                size={24}
                color={theme.lightColors.grey3}
              />
            }
            containerStyle={styles.inputContainer}
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <Icon
                name="email"
                type="material"
                size={24}
                color={theme.lightColors.grey3}
              />
            }
            containerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Input
            placeholder="Current Password"
            value={formData.currentPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, currentPassword: text })
            }
            secureTextEntry={!showPassword}
            leftIcon={
              <Icon
                name="lock"
                type="material"
                size={24}
                color={theme.lightColors.grey3}
              />
            }
            rightIcon={
              <Icon
                name={showPassword ? 'visibility-off' : 'visibility'}
                type="material"
                size={24}
                color={theme.lightColors.grey3}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            containerStyle={styles.inputContainer}
          />
          <Input
            placeholder="New Password"
            value={formData.newPassword}
            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
            secureTextEntry={!showPassword}
            leftIcon={
              <Icon
                name="lock-outline"
                type="material"
                size={24}
                color={theme.lightColors.grey3}
              />
            }
            containerStyle={styles.inputContainer}
          />
          <Input
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
            secureTextEntry={!showPassword}
            leftIcon={
              <Icon
                name="lock-outline"
                type="material"
                size={24}
                color={theme.lightColors.grey3}
              />
            }
            containerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Update Profile"
            onPress={handleUpdateProfile}
            loading={loading}
            disabled={loading}
            containerStyle={styles.updateButtonContainer}
            buttonStyle={styles.updateButton}
            titleStyle={styles.updateButtonTitle}
            loadingProps={{ color: '#ffffff' }}
            icon={{
              name: 'check',
              type: 'material',
              size: 20,
              color: '#ffffff',
              style: { marginRight: 8 }
            }}
          />

          <Button
            title="Sign Out"
            onPress={signOut}
            containerStyle={styles.signOutButtonContainer}
            buttonStyle={styles.signOutButton}
            titleStyle={styles.signOutButtonTitle}
            icon={{
              name: 'logout',
              type: 'material',
              size: 20,
              color: theme.lightColors.error,
              style: { marginRight: 8 }
            }}
          />
        </View>
      </Animated.View>

      {renderAvatarModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: theme.lightColors.primary,
    paddingTop: 40,
    paddingBottom: 80,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  formContainer: {
    marginTop: -50,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.lightColors.black,
    marginBottom: 16,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  buttonSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  updateButtonContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  updateButton: {
    backgroundColor: theme.lightColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  updateButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  signOutButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  signOutButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.lightColors.error,
  },
  signOutButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.lightColors.error,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.lightColors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarOption: {
    borderColor: theme.lightColors.primary,
    backgroundColor: '#e5e7eb',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#000',
  },
  modalButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 60,
    width: 100,
    height: 100,
    textAlign: 'center',
    lineHeight: 100,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.lightColors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
}); 