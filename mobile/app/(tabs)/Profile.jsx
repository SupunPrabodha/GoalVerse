import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { me, clearToken, getToken } from '../../lib/auth';
import { api, authHeaders } from '../../lib/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = await me();
      setUser(u);
    })();
  }, []);

  async function handleLogout() {
    try {
      await clearToken();
      Alert.alert('Logged out');
      router.replace('/(auth)');
    } catch (e) {
      Alert.alert('Logout error', String(e));
    }
  }

  async function refreshProfile() {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await api.get('/auth/me', authHeaders(token));
      setUser(data.user);
    } catch (e) {}
  }

  return (
    <View style={styles.page}>
      <View style={styles.headerCard}>
        <View style={styles.avatar} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerName}>{user?.fullName || '—'}</Text>
          <Text style={styles.headerSub}>{user?.role || '—'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoRow}><Text style={styles.infoKey}>Email:</Text> {user?.email || '—'}</Text>
        {user?.organizationName && (
          <Text style={styles.infoRow}><Text style={styles.infoKey}>Organization:</Text> {user.organizationName}</Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={refreshProfile}><Text style={styles.secondaryText}>Refresh</Text></TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}><Text style={{ color: '#fff', fontWeight: '700' }}>Logout</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: '#FAFAF9' },
  headerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14, marginTop: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#16a34a' },
  headerName: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  headerSub: { color: '#065f46', marginTop: 4, fontWeight: '600' },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 12 },
  infoRow: { color: '#334155', marginTop: 6 },
  infoKey: { fontWeight: '700', color: '#0f172a' },
  actionsRow: { flexDirection: 'row', marginTop: 16, gap: 8 },
  primaryBtn: { backgroundColor: '#16a34a', padding: 12, borderRadius: 8, alignItems: 'center' },
  secondaryBtn: { backgroundColor: '#fff', borderColor: '#e6f4ea', borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  secondaryText: { color: '#065f46', fontWeight: '600' },
});
