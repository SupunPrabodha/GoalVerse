import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api, API_BASE_URL } from '../../lib/api';

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
    <View style={styles.page}>
      <Text style={styles.title}>Projects</Text>
      <FlatList data={campaigns} keyExtractor={(i) => i._id} renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={{fontWeight:'700'}}>{item.title}</Text>
          <Text style={{color:'#6b7280', marginTop:6}}>{item.category} • ${(item.budgetCents/100).toFixed(2)}</Text>
          <TouchableOpacity style={{marginTop:8, backgroundColor:'#16a34a', padding:8, borderRadius:8, alignItems:'center'}}>
            <Text style={{color:'#fff'}}>View</Text>
          </TouchableOpacity>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({ page: { flex:1, padding:16, backgroundColor:'#FAFAF9' }, title:{ fontSize:22, fontWeight:'800', marginTop:12 }, card:{ backgroundColor:'#fff', padding:12, borderRadius:10, marginTop:12 } });
