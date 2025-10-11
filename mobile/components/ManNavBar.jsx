import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ManNavBar({ onHomePress, onProfilePress, style }) {
  const router = useRouter?.();

  const handleHome = () => {
    if (typeof onHomePress === 'function') return onHomePress();
    if (router && typeof router.push === 'function') return router.push('/(tabs)/FinanceDashboard');
  };

  const handleProfile = () => {
    if (typeof onProfilePress === 'function') return onProfilePress();
    if (router && typeof router.push === 'function') return router.push('/(tabs)/ManagerProfile');
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Home"
        onPress={handleHome}
        style={styles.iconWrapper}
        activeOpacity={0.7}
      >
        <Ionicons name="home" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Placeholder spots for future icons (center-left, center, center-right) */}
      <View style={styles.placeholder} />
      <View style={styles.placeholder} />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={handleProfile}
        style={styles.iconWrapper}
        activeOpacity={0.7}
      >
        <Ionicons name="person" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#0E9B4A', // green similar to the design
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    // Keep it visually above content when placed at bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});

