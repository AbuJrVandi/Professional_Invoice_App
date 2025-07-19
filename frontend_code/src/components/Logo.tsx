import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  textColor?: string;
  variant?: 'header' | 'default';
}

const SIZES = {
  small: 35,
  medium: 50,
  large: 80,
};

export function Logo({ 
  size = 'medium', 
  showText = true, 
  textColor = '#1A365D',
  variant = 'default'
}: LogoProps) {
  const logoSize = SIZES[size];

  if (variant === 'header') {
    return (
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/Invoice_logo.jpg')}
          style={[
            styles.headerLogo,
            { width: 40, height: 40 }
          ]}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>
          Invoice App
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Invoice_logo.jpg')}
        style={[
          styles.logo,
          { width: logoSize, height: logoSize },
          styles.logoImage
        ]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { color: textColor }]}>
          Invoice App
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  logo: {
    marginBottom: 8,
  },
  headerLogo: {
    marginRight: 8,
    borderRadius: 8,
  },
  logoImage: {
    borderRadius: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A365D',
  },
}); 