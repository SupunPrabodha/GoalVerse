import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SafeScreen from '../../components/SafeScreen';
import { createDonation, listMyDonations } from '../../lib/donations';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function DonorDonate() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  async function refresh() {
    try { setItems(await listMyDonations()); } catch (e) {}
  }
  useEffect(() => {
    refresh();
    (async () => {
      try {
        const res = await api.get('/projects/all');
        setProjects(res.data.projects || []);
        if (params?.projectId) setSelectedProjectId(String(params.projectId));
      } catch (e) {
        setProjects([]);
      }
    })();
  }, []);

  async function submit() {
    const cents = Math.round(parseFloat(amount || '0') * 100);
    if (!cents || cents <= 0) return Alert.alert('Enter a valid amount');
  if (!selectedProjectId) return Alert.alert('Select a project');
    try {
      setSubmitting(true);
  await createDonation({ amountCents: cents, note, projectId: selectedProjectId });
      setAmount(''); setNote('');
      Alert.alert('Thank you!', 'Your donation was recorded.');
      refresh();
    } catch (e) {
      Alert.alert('Failed', e?.response?.data?.message || e.message || 'Error');
    } finally { setSubmitting(false); }
  }

  return (
    <SafeScreen>
      <View style={styles.page}>
        <Text style={styles.title}>Make a Donation</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Select Project</Text>
          <View style={{ marginTop: 8 }}>
            {projects.length === 0 && <Text style={{ color:'#6b7280' }}>No active projects available. Please try again later.</Text>}
            {projects.map((p) => (
              <TouchableOpacity key={p._id} style={[styles.optionRow, selectedProjectId === p._id && styles.optionSelected]} onPress={() => setSelectedProjectId(p._id)}>
                <View style={{ flex:1 }}>
                  <Text style={{ fontWeight:'700', color:'#0f172a' }}>{p.name}</Text>
                  <Text style={{ color:'#6b7280', marginTop:4 }}>{p.category}</Text>
                </View>
                {selectedProjectId === p._id ? <Ionicons name="radio-button-on" size={22} color="#16a34a"/> : <Ionicons name="radio-button-off" size={22} color="#9ca3af"/>}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Amount (USD)</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="50.00" style={styles.input} />
          <Text style={styles.label}>Note</Text>
          <TextInput value={note} onChangeText={setNote} placeholder="Optional message" style={[styles.input, { height: 80 }]} multiline />
          <TouchableOpacity style={[styles.primaryBtn, submitting && { opacity: 0.6 }]} disabled={submitting} onPress={submit}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Donate</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { marginTop: 16 }]}>My Donations</Text>
        <FlatList data={items} keyExtractor={(i) => i._id} contentContainerStyle={{ paddingBottom: 120 }} renderItem={({item}) => (
          <View style={styles.row}>
            <Text style={{ fontWeight:'700' }}>${(item.amountCents/100).toFixed(2)}</Text>
            <Text style={{ color:'#6b7280' }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        )} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  page:{ flex:1, padding:16, backgroundColor:'#FAFAF9' },
  title:{ fontSize:22, fontWeight:'800', color:'#0f172a' },
  card:{ backgroundColor:'#fff', padding:12, borderRadius:12, marginTop:12 },
  label:{ marginTop:8, color:'#374151', fontWeight:'600' },
  input:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#e6e6e6', borderRadius:8, padding:10, marginTop:6 },
  primaryBtn:{ marginTop:12, backgroundColor:'#16a34a', padding:12, borderRadius:10, alignItems:'center' },
  row:{ backgroundColor:'#fff', padding:12, borderRadius:12, marginTop:8, flexDirection:'row', justifyContent:'space-between' },
  optionRow:{ flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'#f1f5f9' },
  optionSelected:{ backgroundColor:'#F0FDF4', borderRadius:8, paddingHorizontal:8 },
});