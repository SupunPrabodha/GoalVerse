import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import { useRouter } from 'expo-router';
import { api, authHeaders } from "../../lib/api";
import { getToken, me } from "../../lib/auth";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../../components/SafeScreen";

export default function DonorHome() {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [items, setItems] = useState([]);
  const [isPicking, setIsPicking] = useState(false);
  const [user, setUser] = useState(null);

  async function refreshEvidence() {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await api.get('/ngo/evidence?limit=10', authHeaders(token));
      setItems(data.items || []);
    } catch {}
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const u = await me(); if (mounted) setUser(u); } catch {}
      refreshEvidence();
    })();
    return () => { mounted = false; };
  }, []);

  async function handlePickAndUpload() {
    try {
      if (isPicking) return;
      setIsPicking(true);
      let DocumentPicker;
      try { DocumentPicker = (await import('expo-document-picker')); } catch (e) {
        setIsPicking(false);
        return Alert.alert('Missing dependency', 'Run: npm install expo-document-picker');
      }
      let r;
      try {
        r = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      } catch (err) {
        setIsPicking(false);
        const msg = err?.message || String(err);
        if (msg.includes('Different document picking in progress')) {
          return Alert.alert('Picker busy', 'Another document picker is already open. Please close it and try again.');
        }
        return Alert.alert('Picker error', msg);
      }
      setIsPicking(false);
      await new Promise((res) => setTimeout(res, 50));
      if (r.type && r.type !== 'success') return;
      const picked = (r && r.assets && r.assets[0]) ? r.assets[0] : r;
      setSelectedFile(picked);
      const token = await getToken();
      if (!token) return Alert.alert('Not authenticated');
      const uri = picked.uri;
      const filename = picked.name || uri.split('/').pop() || `upload-${Date.now()}`;
      let mimeType = picked.mimeType || 'application/octet-stream';
      const ext = (filename.includes('.') ? filename.split('.').pop() : '').toLowerCase();
      if (mimeType === 'application/octet-stream' && ext) {
        if (['jpg','jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'heic') mimeType = 'image/heic';
        else if (ext === 'mp4') mimeType = 'video/mp4';
        else if (ext === 'pdf') mimeType = 'application/pdf';
      }
      const form = new FormData();
      form.append('file', { uri, name: filename, type: mimeType });
      form.append('type', mimeType.startsWith('image/') ? 'photo' : 'document');
      await api.post('/ngo/evidence', form, {
        headers: { ...(authHeaders(token).headers), 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => { if (evt.total) setUploadProgress(Math.round((evt.loaded/evt.total)*100)); },
      });
      setUploadProgress(0);
      setSelectedFile(null);
      Alert.alert('Uploaded');
      refreshEvidence();
    } catch (e) {
      console.error(e);
      Alert.alert('Upload failed', String(e?.response?.data?.message || e.message || e));
    }
  }

  return (
    <SafeScreen>
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.headerLogoPlaceholder} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>{user?.fullName || 'Donor'}</Text>
            <Text style={styles.headerSubtitle}>Donor</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAvatar} onPress={() => router.push('/(tabs)/Profile')}>
          <Ionicons name="person-circle" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Access donor reports, give feedback, and review impact summaries.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Share Evidence</Text>
        <Text style={styles.cardText}>Upload documents or photos that support a donation claim.</Text>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity style={[styles.secondaryBtn, isPicking && { opacity: 0.6 }]} onPress={handlePickAndUpload} disabled={isPicking}><Text style={styles.secondaryText}>Pick & Upload</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { marginLeft: 8 }]} onPress={() => router.push('/(tabs)/Reports')}><Text style={styles.secondaryText}>View Reports</Text></TouchableOpacity>
        </View>
        {selectedFile?.mimeType?.startsWith('image/') && (
          <Image source={{ uri: selectedFile.uri }} style={{ width: 140, height: 90, borderRadius: 8, marginTop: 10 }} />
        )}
        {uploadProgress > 0 && (
          <View style={{ marginTop: 10 }}>
            <View style={{ height: 8, backgroundColor: '#e6f4ea', borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ height: 8, backgroundColor: '#16a34a', width: `${uploadProgress}%` }} />
            </View>
            <Text style={{ marginTop: 6 }}>{uploadProgress}%</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Donations</Text>
        <Text style={styles.cardText}>You haven't made any donations yet.</Text>
      </View>

      <View style={{ flexDirection:'row', gap:8 }}>
        <TouchableOpacity style={[styles.primaryBtn, { flex:1 }]} onPress={() => router.push('/(tabs)/DonorDonate')}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Donate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor:'#10b981', flex:1 }]} onPress={() => router.push('/(tabs)/Projects')}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Explore Projects</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Recent Evidence</Text>
        {items.length === 0 && <Text style={styles.cardText}>No evidence yet.</Text>}
        {items.map((ev) => (
          <View key={ev._id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f1f5f9' }}>
            <Text style={{ fontWeight: '700' }}>{ev.originalname || ev.filename}</Text>
            <Text style={{ color: '#6b7280', marginTop: 4 }}>{ev.type} • {ev.status}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#FAFAF9" },
  title: { fontSize: 22, fontWeight: "800", marginTop: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLogoPlaceholder: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { color: '#6b7280', marginTop: 4 },
  headerAvatar: { backgroundColor: '#16a34a', padding: 8, borderRadius: 20 },
  subtitle: { color: "#6b7280", marginTop: 6 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginTop: 12 },
  cardTitle: { fontWeight: "700" },
  cardText: { color: "#6b7280", marginTop: 8 },
  primaryBtn: { marginTop: 20, backgroundColor: "#16a34a", padding: 14, borderRadius: 12, alignItems: "center", shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  secondaryBtn: { backgroundColor: "#fff", borderColor: "#e6f4ea", borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  secondaryText: { color: "#065f46", fontWeight: '600' },
});
