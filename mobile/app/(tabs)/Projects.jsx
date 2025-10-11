import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api, API_BASE_URL } from '../../lib/api';
import SafeScreen from '../../components/SafeScreen';
import COLORS from '../../constants/colors';

export default function Projects() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { let m = true; (async () => {
    try {
      const res = await api.get('/campaigns');
      if (!m) return;
      setCampaigns(res.data.campaigns || []);
    } catch (e) {
      // show fallback sample data
      if (!m) return;
      setCampaigns([
        { _id: 's1', title: 'Clean Water Initiative', category: 'Water', budgetCents: 5000000 },
        { _id: 's2', title: 'School Supplies Drive', category: 'Education', budgetCents: 1200000 },
      ]);
    } finally { if (m) setLoading(false); }
  })(); return () => (m = false); }, []);

  if (loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator /></View>;

  return (
    <SafeScreen>
      <View style={styles.page}>
        <Text style={styles.title}>Partnerships</Text>
        <FlatList data={campaigns} keyExtractor={(i) => i._id} contentContainerStyle={{ paddingBottom: 100 }} renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.category} • ${(item.budgetCents/100).toFixed(2)}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryText}>Open</Text></TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn}><Text style={styles.ghostText}>View Reports</Text></TouchableOpacity>
            </View>
          </View>
        )} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex:1, padding:16, backgroundColor: COLORS.bg },
  title:{ fontSize:22, fontWeight:'800', marginTop:12, color: COLORS.text },
  card:{ backgroundColor: COLORS.card, padding:14, borderRadius:12, marginTop:12 },
  cardTitle:{ fontWeight:'700', color: COLORS.text },
  cardSub:{ color:'#6b7280', marginTop:6 },
  primaryBtn:{ backgroundColor: COLORS.primary, borderRadius:8, paddingVertical:8, paddingHorizontal:12 },
  primaryText:{ color: '#fff', fontWeight:'700' },
  ghostBtn:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#e6f4ea', borderRadius:8, paddingVertical:8, paddingHorizontal:12 },
  ghostText:{ color:'#065f46', fontWeight:'700' },
});
