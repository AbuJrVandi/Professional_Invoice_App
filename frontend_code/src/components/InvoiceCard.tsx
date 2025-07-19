import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InvoiceCardProps {
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  gradientColors: [string, string];
  onDownload?: () => void;
  onDelete?: () => void;
}

export const InvoiceCard = ({
  clientName,
  companyName,
  invoiceNumber,
  gradientColors,
  onDownload,
  onDelete
}: InvoiceCardProps) => {
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{clientName}</Text>
        <Text style={styles.subtitle}>{companyName}</Text>
        <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onDownload} style={styles.actionButton}>
          <Icon name="file-download" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
          <Icon name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    minHeight: 140,
  },
  content: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  invoiceNumber: {
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  actionButton: {
    opacity: 0.8,
  },
}); 