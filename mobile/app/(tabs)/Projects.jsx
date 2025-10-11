import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api, authHeaders } from '../../lib/api';
import SafeScreen from '../../components/SafeScreen';
import COLORS from '../../constants/colors';
import { me, getToken } from '../../lib/auth';

export default function Projects() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [users, setUsers] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL | NGO | DONOR | GOVERNMENT
  const [tab, setTab] = useState('directory'); // directory | mine

  useEffect(() => { let m = true; (async () => {
    try {
      const u = await me(); if (m) setRole(u?.role || null);
      const res = await api.get('/partnerships/partners');
      if (!m) return;
      setPartners(res.data.partners || []);
      // Also load real users as potential partners (e.g., donors)
      try {
        const usersRes = await api.get('/partnerships/users?role=DONOR');
        if (m) setUsers(usersRes.data.users || []);
      } catch { if (m) setUsers([]); }
      // Load my partnerships if NGO manager
      try {
        if (u?.role === 'NGO_MANAGER') {
          const token = await getToken();
          if (token) {
            const myRes = await api.get('/partnerships/me', authHeaders(token));
            if (m) setMyItems(myRes.data.items || []);
          }
        }
      } catch { if (m) setMyItems([]); }
    } catch (e) {
      if (!m) return;
      setPartners([]);
    } finally { if (m) setLoading(false); }
  })(); return () => (m = false); }, []);

  async function requestPartnership(id) {
    try {
      const token = await getToken();
      if (!token) {
        alert('Please login again');
        return;
      }
      await api.post('/partnerships/request', { partnerId: id }, authHeaders(token));
      alert('Requested partnership');
    } catch (e) {
      alert(e?.response?.data?.message || 'Request failed');
    }
  }

  async function requestUserPartnership(userId) {
    try {
      const token = await getToken();
      if (!token) { alert('Please login again'); return; }
      await api.post('/partnerships/request-user', { userId }, authHeaders(token));
      alert('Requested partnership with user');
    } catch (e) { alert(e?.response?.data?.message || 'Request failed'); }
  }

  async function updateStatus(id, status) {
    try {
      const token = await getToken();
      if (!token) { alert('Please login again'); return; }
      await api.patch(`/partnerships/${id}/status`, { status }, authHeaders(token));
      // refresh my items
      const myRes = await api.get('/partnerships/me', authHeaders(token));
      setMyItems(myRes.data.items || []);
    } catch (e) {
      alert(e?.response?.data?.message || 'Update failed');
    }
  }

  if (loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator /></View>;

  return (
    <SafeScreen>
      <View style={styles.page}>
        <Text style={styles.title}>Partnerships</Text>

        {role === 'NGO_MANAGER' && (
          <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
            <TouchableOpacity onPress={() => setTab('directory')} style={[styles.switchBtn, tab==='directory' && styles.switchBtnActive]}>
              <Text style={[styles.switchText, tab==='directory' && styles.switchTextActive]}>Directory</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('mine')} style={[styles.switchBtn, tab==='mine' && styles.switchBtnActive]}>
              <Text style={[styles.switchText, tab==='mine' && styles.switchTextActive]}>My Partnerships</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'directory' && (
          <>
            {/* Filter chips */}
            <View style={{ flexDirection:'row', gap:8, marginTop:8, marginBottom:8, flexWrap:'wrap' }}>
              {['ALL','DONOR','NGO','GOVERNMENT'].map((t) => (
                <TouchableOpacity key={t} onPress={() => setFilter(t)} style={[styles.chip, filter===t && styles.chipActive]}>
                  <Text style={[styles.chipText, filter===t && styles.chipTextActive]}>
                    {t==='ALL' ? 'All Partners' : (t.charAt(0)+t.slice(1).toLowerCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FlatList data={partners.filter(p => filter==='ALL' ? true : p.type === filter)} keyExtractor={(i) => i._id} contentContainerStyle={{ paddingBottom: 100 }} renderItem={({item}) => (
              <View style={styles.card}>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                  <View style={{ flex:1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSub}>{item.type} • {item.focus}</Text>
                  </View>
                  {item.recommended && <Text style={styles.badgeRecommended}>Recommended</Text>}
                </View>
                <View style={{ flexDirection:'row', gap:8, marginTop:8, flexWrap:'wrap' }}>
                  {(item.tags || []).map((t) => (<Text key={t} style={styles.badge}>{t}</Text>))}
                </View>
                {role === 'NGO_MANAGER' && (
                  <View style={{ flexDirection:'row', gap:8, marginTop:12 }}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => requestPartnership(item._id)}>
                      <Text style={styles.primaryText}>Request Partnership</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ghostBtn}><Text style={styles.ghostText}>View Details</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            )} />
          </>
        )}

        {tab === 'directory' && role === 'NGO_MANAGER' && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.title}>Real Donor Accounts</Text>
            <FlatList data={users} keyExtractor={(i) => i._id} contentContainerStyle={{ paddingBottom: 140 }} renderItem={({item}) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.fullName}</Text>
                <Text style={styles.cardSub}>{item.email} • {item.role}</Text>
                <View style={{ flexDirection:'row', gap:8, marginTop:12 }}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => requestUserPartnership(item._id)}>
                    <Text style={styles.primaryText}>Request Partnership</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )} />
          </View>
        )}

        {tab === 'mine' && role === 'NGO_MANAGER' && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.subtitle}>Your partnership requests and active collaborations</Text>
            <FlatList
              data={myItems}
              keyExtractor={(i) => i._id}
              contentContainerStyle={{ paddingBottom: 140 }}
              renderItem={({ item }) => {
                const name = item.partner_id?.name || item.partner_user_id?.fullName || 'Partner';
                const meta = item.partner_user_id ? item.partner_user_id.email : (item.partner_id ? item.partner_id.type : '');
                const actions = [];
                if (item.status === 'REQUESTED') {
                  actions.push(
                    <TouchableOpacity key="accept" style={[styles.primaryBtn, { paddingVertical:6 }]} onPress={() => updateStatus(item._id, 'ACTIVE')}>
                      <Text style={styles.primaryText}>Accept</Text>
                    </TouchableOpacity>
                  );
                  actions.push(
                    <TouchableOpacity key="reject" style={[styles.ghostBtn, { paddingVertical:6 }]} onPress={() => updateStatus(item._id, 'REJECTED')}>
                      <Text style={styles.ghostText}>Reject</Text>
                    </TouchableOpacity>
                  );
                }
                if (item.status === 'ACTIVE') {
                  actions.push(
                    <TouchableOpacity key="pending" style={[styles.ghostBtn, { paddingVertical:6 }]} onPress={() => updateStatus(item._id, 'PENDING_REPORT')}>
                      <Text style={styles.ghostText}>Mark Pending Report</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <View style={styles.card}>
                    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                      <View style={{ flex:1 }}>
                        <Text style={styles.cardTitle}>{name}</Text>
                        <Text style={styles.cardSub}>{meta}</Text>
                      </View>
                      <Text style={[styles.badge, statusStyle(item.status)]}>{labelFor(item.status)}</Text>
                    </View>
                    {!!item.notes && <Text style={{ color:'#374151', marginTop:8 }}>{item.notes}</Text>}
                    {actions.length > 0 && (
                      <View style={{ flexDirection:'row', gap:8, marginTop:12, flexWrap:'wrap' }}>
                        {actions}
                      </View>
                    )}
                  </View>
                );
              }}
            />
          </View>
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex:1, padding:16, backgroundColor: COLORS.bg },
  title:{ fontSize:22, fontWeight:'800', marginTop:12, color: COLORS.text },
  subtitle:{ fontSize:14, color:'#6b7280', marginTop:6 },
  card:{ backgroundColor: COLORS.card, padding:14, borderRadius:12, marginTop:12 },
  cardTitle:{ fontWeight:'700', color: COLORS.text },
  cardSub:{ color:'#6b7280', marginTop:6 },
  primaryBtn:{ backgroundColor: COLORS.primary, borderRadius:8, paddingVertical:8, paddingHorizontal:12 },
  primaryText:{ color: '#fff', fontWeight:'700' },
  ghostBtn:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#e6f4ea', borderRadius:8, paddingVertical:8, paddingHorizontal:12 },
  ghostText:{ color:'#065f46', fontWeight:'700' },
  badge:{ backgroundColor:'#ECFDF5', color:'#065f46', paddingVertical:4, paddingHorizontal:8, borderRadius:6, fontWeight:'700' },
  badgeRecommended:{ backgroundColor:'#10b981', color:'#fff', paddingVertical:4, paddingHorizontal:8, borderRadius:6, fontWeight:'700' },
  chip:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', paddingVertical:6, paddingHorizontal:10, borderRadius:16 },
  chipActive:{ backgroundColor:'#10b981', borderColor:'#10b981' },
  chipText:{ color:'#374151', fontWeight:'600' },
  chipTextActive:{ color:'#fff' },
  switchBtn:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', paddingVertical:8, paddingHorizontal:12, borderRadius:10 },
  switchBtnActive:{ backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  switchText:{ color:'#374151', fontWeight:'700' },
  switchTextActive:{ color:'#fff' },
});

function labelFor(status) {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'PENDING_REPORT') return 'Pending Report';
  if (status === 'REJECTED') return 'Rejected';
  return 'Requested';
}

function statusStyle(status) {
  if (status === 'ACTIVE') return { backgroundColor:'#DCFCE7', color:'#065f46' };
  if (status === 'PENDING_REPORT') return { backgroundColor:'#FEF9C3', color:'#854d0e' };
  if (status === 'REJECTED') return { backgroundColor:'#FEE2E2', color:'#991b1b' };
  return { backgroundColor:'#E0E7FF', color:'#3730a3' };
}
