import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import COLORS from "../../constants/colors";

const DATA = [
  { id: '1', title: '2 Donor Reports Due Soon', time: '2 hours ago', desc: 'Financial reports for Green Future Lanka and Ocean Conservation Project are due within 48 hours.', action: 'Respond', priority: 'High' },
  { id: '2', title: 'Report Submitted for Review', time: '4 hours ago', desc: 'Green Future Lanka has submitted their quarterly financial report for the Clean Water Initiative project.', action: 'Review', priority: 'Medium' },
  { id: '3', title: 'Funds Under-utilized', time: '6 hours ago', desc: 'Current utilization rate is 40% for allocated SDG funds. Consider reallocation or extension of deadline.', action: 'Reallocate', priority: 'Medium' },
  { id: '4', title: 'Project Funding Approved', time: '1 day ago', desc: 'Your funding proposal for Rural Education Initiative has been approved for $50,000.', action: 'View Details', priority: 'Low' },
  { id: '5', title: 'Impact Report Submitted', time: '1 day ago', desc: 'Monthly impact report for Community Health Program has been submitted and is pending review.', action: 'Track Status', priority: 'Low' },
  { id: '6', title: 'Budget Review Meeting', time: '2 days ago', desc: 'Quarterly budget review meeting with district coordinators scheduled for tomorrow at 2 PM.', action: 'Prepare', priority: 'Low' },
];

export default function Notifications() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'High Priority', 'Medium Priority', 'Low Priority'];
  const items = DATA.filter((d) => filter === 'All' || `${d.priority} Priority` === filter);
  return (
    <SafeScreen>
      <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>{items.length} active alerts</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {filters.map((f) => (
            <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {items.map((n) => (
          <View key={n.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.cardTitle}>{n.title}</Text>
              <Text style={styles.timeText}>{n.time}</Text>
            </View>
            <Text style={styles.desc}>{n.desc}</Text>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>{n.action}</Text></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: '800', marginTop: 12, color: COLORS.text },
  subtitle: { color: COLORS.textMuted, marginTop: 6 },
  filterBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  filterText: { color: '#111827', fontWeight: '700' },
  chip: { backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, marginRight: 8 },
  chipActive: { backgroundColor: '#E6F4EA' },
  chipText: { color: '#374151', fontWeight: '600' },
  chipTextActive: { color: '#065f46' },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginTop: 12 },
  cardTitle: { fontWeight: '700', color: COLORS.text },
  desc: { color: COLORS.textMuted, marginTop: 6 },
  actionBtn: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6f4ea', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  actionText: { color: '#065f46', fontWeight: '700' },
  timeText: { color: COLORS.textMuted, fontSize: 12 },
});
