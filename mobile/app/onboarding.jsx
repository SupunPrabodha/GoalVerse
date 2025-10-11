import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import SafeScreen from '../components/SafeScreen';
import COLORS from '../constants/colors';

const slides = [
  { key: 's1', title: 'Track Real Impact', subtitle: 'Upload evidence and analyze outcomes for transparent reporting.' },
  { key: 's2', title: 'Donate With Confidence', subtitle: 'Support verified campaigns and see where funds go.' },
  { key: 's3', title: 'Build Partnerships', subtitle: 'Connect NGOs and donors to accelerate sustainability goals.' },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const s = slides[index];

  const next = async () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      await AsyncStorage.setItem('onboardingDone', 'true');
      router.replace('/(auth)');
    }
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <SafeScreen>
      <View style={styles.wrap}>
        <View style={styles.imageWrap}>
          <View style={styles.illustration} />
        </View>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.subtitle}>{s.subtitle}</Text>

        <View style={styles.dotsWrap}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity onPress={prev} disabled={index === 0} style={[styles.ghostBtn, index === 0 && { opacity: 0.4 }]}> 
            <Text style={styles.ghostText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={next} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>{index === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: COLORS.bg, alignItems: 'center' },
  imageWrap: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  illustration: { width: width * 0.7, height: width * 0.7, borderRadius: 20, backgroundColor: '#e6f4ea' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginTop: 12 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 8 },
  dotsWrap: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: COLORS.primary },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, width: '100%', marginTop: 22, marginBottom: 10 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, flex: 1, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  ghostBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, flex: 1, alignItems: 'center' },
  ghostText: { color: '#065f46', fontWeight: '700' },
});
