import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api, authHeaders } from '../../lib/api';
import SafeScreen from '../../components/SafeScreen';
import COLORS from '../../constants/colors';
import { me, getToken } from '../../lib/auth';

export default function AllProjects() {
	const router = useRouter();
	const [projects, setProjects] = useState([]);
	const [role, setRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('ALL'); // ALL | ACTIVE | COMPLETED | PENDING

	useEffect(() => { let m = true; (async () => {
		try {
			const u = await me(); if (m) setRole(u?.role || null);
			const res = await api.get('/projects/all');
			if (!m) return;
			setProjects(res.data.projects || []);
		} catch (e) {
			if (!m) return;
			setProjects([]);
		} finally { if (m) setLoading(false); }
	})(); return () => (m = false); }, []);

	if (loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator /></View>;

	return (
		<SafeScreen>
			<View style={styles.page}>
				<Text style={styles.title}>All Projects</Text>

				{/* Filter chips */}
				<View style={{ flexDirection:'row', gap:8, marginTop:8, marginBottom:8, flexWrap:'wrap' }}>
					{['ALL','ACTIVE','COMPLETED','PENDING'].map((t) => (
						<TouchableOpacity key={t} onPress={() => setFilter(t)} style={[styles.chip, filter===t && styles.chipActive]}>
							<Text style={[styles.chipText, filter===t && styles.chipTextActive]}>
								{t==='ALL' ? 'All Projects' : (t.charAt(0)+t.slice(1).toLowerCase())}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<FlatList
					data={projects.filter(p => filter==='ALL' ? true : p.status === filter)}
					keyExtractor={(i) => i._id}
					contentContainerStyle={{ paddingBottom: 100 }}
					renderItem={({item}) => (
						<View style={styles.card}>
							<View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
								<View style={{ flex:1 }}>
									<Text style={styles.cardTitle}>{item.name}</Text>
									<Text style={styles.cardSub}>{item.status} • {item.category}</Text>
								</View>
								<Text style={[styles.badge, statusStyle(item.status)]}>{labelFor(item.status)}</Text>
							</View>
							<View style={{ flexDirection:'row', gap:8, marginTop:8, flexWrap:'wrap' }}>
								{(item.tags || []).map((t) => (<Text key={t} style={styles.badge}>{t}</Text>))}
							</View>
							<View style={{ flexDirection:'row', gap:8, marginTop:12 }}>
								<TouchableOpacity style={styles.primaryBtn} onPress={() => router.push(`/ProjectDashboard?id=${item._id}`)}>
									<Text style={styles.primaryText}>View Details</Text>
								</TouchableOpacity>
								{role === 'DONOR' && (
									<TouchableOpacity style={styles.ghostBtn} onPress={() => router.push(`/DonorDonate?id=${item._id}`)}>
										<Text style={styles.ghostText}>Donate</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
					)}
				/>
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
	badge:{ backgroundColor:'#ECFDF5', color:'#065f46', paddingVertical:4, paddingHorizontal:8, borderRadius:6, fontWeight:'700' },
	chip:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', paddingVertical:6, paddingHorizontal:10, borderRadius:16 },
	chipActive:{ backgroundColor:'#10b981', borderColor:'#10b981' },
	chipText:{ color:'#374151', fontWeight:'600' },
	chipTextActive:{ color:'#fff' },
});

function labelFor(status) {
	if (status === 'ACTIVE') return 'Active';
	if (status === 'COMPLETED') return 'Completed';
	if (status === 'PENDING') return 'Pending';
	return 'Unknown';
}

function statusStyle(status) {
	if (status === 'ACTIVE') return { backgroundColor:'#DCFCE7', color:'#065f46' };
	if (status === 'COMPLETED') return { backgroundColor:'#E0E7FF', color:'#3730a3' };
	if (status === 'PENDING') return { backgroundColor:'#FEF9C3', color:'#854d0e' };
	return { backgroundColor:'#F3F4F6', color:'#374151' };
}
