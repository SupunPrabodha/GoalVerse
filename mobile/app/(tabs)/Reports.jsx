import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { getToken } from '../../lib/auth';
import { api, authHeaders, API_BASE_URL } from '../../lib/api';
import * as Linking from 'expo-linking';
import COLORS from '../../constants/colors';
import SafeScreen from '../../components/SafeScreen';

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await api.get('/ngo/reports', authHeaders(token));
        if (!mounted) return;
        setReports(res.data.items || []);
      } catch (e) {
        // ignore
      }
    })();
    return () => (mounted = false);
  }, []);

  async function handleExport(id) {
    try {
      // open CSV export in browser
      const url = API_BASE_URL.replace(/\/api\/?$/, '') + `/api/ngo/reports/${id}/export`;
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Export failed');
    }
  }

  // Simple bars for demo charts
  const Bar = ({ value, color = COLORS.primary }) => (
    <View style={{ height: 120, width: 18, marginHorizontal: 6, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' }}>
      <View style={{ height: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }} />
    </View>
  );

  const Chip = ({ label, active = false }) => (
    <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: active ? '#E6F4EA' : '#F3F4F6', marginRight: 8 }}>
      <Text style={{ color: active ? '#065f46' : '#374151', fontWeight: '600' }}>{label}</Text>
    </View>
  );

  return (
    <SafeScreen>
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>Financial Reports</Text>
      <Text style={styles.subtitle}>Generate comprehensive financial reports with data visualization and analysis.</Text>

      {/* Actions */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <TouchableOpacity style={styles.ghostBtn}><Text style={styles.ghostText}>Export PDF</Text></TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn}><Text style={styles.ghostText}>Export Excel</Text></TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryText}>Evidence</Text></TouchableOpacity>
        <TouchableOpacity style={styles.primaryOutline}><Text style={styles.primaryText}>View Summary</Text></TouchableOpacity>
      </View>

      {/* Report Configuration */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Report Configuration</Text>
        <Text style={styles.cardSub}>Select the type of financial report to generate</Text>
        <View style={{ marginTop: 10 }}>
          <View style={styles.configItem}>
            <Text style={styles.configTitle}>Detailed Donor Compliance Report</Text>
            <Text style={styles.configDesc}>Comprehensive financial reporting for donor requirements and audit purposes</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configTitle}>Quarterly Budget vs Actual</Text>
            <Text style={styles.configDesc}>Compare planned budget against actual expenditures</Text>
          </View>
        </View>
      </View>

      {/* Budget vs Actual */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Budget vs Actual</Text>
        <Text style={styles.cardSub}>Comparison of planned budget against actual expenditures</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 }}>
          {/* Blue = budget, Green = actual */}
          <Bar value={80} color="#60A5FA" />
          <Bar value={65} />
          <Bar value={50} color="#60A5FA" />
          <Bar value={40} />
          <Bar value={20} color="#60A5FA" />
          <Bar value={15} />
          <Bar value={82} color="#60A5FA" />
          <Bar value={78} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Chip label="Budget" active />
          <Chip label="Actual" />
        </View>
      </View>

      {/* Cost breakdown donuts (placeholder rings) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cost per Hectare Breakdown</Text>
        <Text style={styles.cardSub}>Distribution of costs by activity type</Text>
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF' }} />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cost per Beneficiary Breakdown</Text>
        <Text style={styles.cardSub}>Distribution of beneficiary-related costs</Text>
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF' }} />
          </View>
        </View>
      </View>

      {/* Cost Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cost Metrics</Text>
        <Text style={styles.cardSub}>Cost per hectare and cost per beneficiary analysis</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Cost per Beneficiary</Text>
            <Text style={styles.metricValue}>$2,640</Text>
            <Text style={styles.metricDelta}>↑ 8% vs target</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Cost per Hectare</Text>
            <Text style={styles.metricValue}>$900</Text>
            <Text style={styles.metricDelta}>↓ 12% vs target</Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: '800', marginTop: 12, color: COLORS.text },
  subtitle: { color: COLORS.textMuted, marginTop: 6 },
  card: { backgroundColor: COLORS.card, padding: 14, borderRadius: 12, marginTop: 12 },
  cardTitle: { fontWeight: '800', color: COLORS.text, fontSize: 16 },
  cardSub: { color: COLORS.textMuted, marginTop: 6 },
  ghostBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6f4ea', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  ghostText: { color: '#065f46', fontWeight: '700' },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  primaryOutline: { backgroundColor: '#e6f4ea', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  primaryText: { color: '#065f46', fontWeight: '700' },
  configItem: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginTop: 10 },
  configTitle: { fontWeight: '700', color: COLORS.text },
  configDesc: { color: COLORS.textMuted, marginTop: 4 },
  metricCard: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12 },
  metricLabel: { color: COLORS.textMuted },
  metricValue: { color: COLORS.text, fontWeight: '800', fontSize: 18, marginTop: 4 },
  metricDelta: { color: '#059669', marginTop: 4, fontWeight: '600' },
});
