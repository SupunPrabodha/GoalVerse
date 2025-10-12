// app/(tabs)/HomeScreen.jsx
import React, { useEffect, useState } from "react";
// import {
//   View, Text, TouchableOpacity, SafeAreaView, StyleSheet,
//   ActivityIndicator, FlatList, Image, ScrollView
// } from "react-native";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet,
  ActivityIndicator, FlatList, Image, ScrollView, Modal, Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchOrgOverview } from "../../lib/public";
import { useRouter } from "expo-router";

const SDG_COLORS = [
  "#e5243b","#DDA63A","#4C9F38","#C5192D","#FF3A21","#26BDE2","#FCC30B",
  "#A21942","#FD6925","#DD1367","#FD9D24","#BF8B2E","#3F7E44","#0A97D9",
  "#56C02B","#00689D","#19486A"
];

const SDGS = [
  { id: 1,  title: "No Poverty" },
  { id: 2,  title: "Zero Hunger" },
  { id: 3,  title: "Good Health and Well-being" },
  { id: 4,  title: "Quality Education" },
  { id: 5,  title: "Gender Equality" },
  { id: 6,  title: "Clean Water and Sanitation" },
  { id: 7,  title: "Affordable and Clean Energy" },
  { id: 8,  title: "Decent Work and Economic Growth" },
  { id: 9,  title: "Industry, Innovation and Infrastructure" },
  { id: 10, title: "Reduced Inequalities" },
  { id: 11, title: "Sustainable Cities and Communities" },
  { id: 12, title: "Responsible Consumption and Production" },
  { id: 13, title: "Climate Action" },
  { id: 14, title: "Life Below Water" },
  { id: 15, title: "Life on Land" },
  { id: 16, title: "Peace, Justice and Strong Institutions" },
  { id: 17, title: "Partnerships for the Goals" },
];

const REGIONS = ["All Regions", "Central", "North", "South", "East", "West"];

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const [filter, setFilter] = useState({ sdg: null, region: null });
  const [totals, setTotals] = useState({ projects: 0, impact: 0, orgs: 0 });
  const [sdgOpen, setSdgOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const router = useRouter();

  const load = async (f = filter) => {
    setLoading(true);
    try {
      const data = await fetchOrgOverview(f);
      setOrgs(data);
      const projects = data.reduce((s, x) => s + (x?.stats?.projects || 0), 0);
      const impact = data.reduce((s, x) => s + (x?.stats?.achievedBeneficiaries || 0), 0);
      setTotals({ projects, impact, orgs: data.length });
    } catch (e) {
      console.warn(e.message);
      setOrgs([]);
      setTotals({ projects: 0, impact: 0, orgs: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const clearFilters = () => {
    setFilter({ sdg: null, region: null });
    load({ sdg: null, region: null });
  };

  const renderCard = ({ item }) => {
    const { org, stats } = item;
    const util = stats.utilizationPct ?? 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            {org?.logo ? (
              <Image source={{ uri: org.logo }} style={styles.logo} />
            ) : (
              <View style={styles.logoFallback}><Ionicons name="business-outline" size={16} color="#16a34a" /></View>
            )}
            <Text style={styles.orgName}>{org?.name || "Organization"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {stats.sdgs.slice(0, 3).map((n) => (
              <View key={n} style={[styles.sdgChip, { backgroundColor: SDG_COLORS[(n-1)%17] }]}>
                <Text style={styles.sdgText}>{n}</Text>
              </View>
            ))}
            {stats.sdgs.length > 3 && (
              <View style={[styles.sdgChip, { backgroundColor: "#ddd" }]}>
                <Text style={[styles.sdgText, { color: "#111" }]}>+{stats.sdgs.length - 3}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Budget</Text>
            <Text style={styles.metricValue}>
              ${Number(stats.budgetTotal || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Utilization</Text>
            <Text style={[styles.metricValue, { color: util >= 85 ? "#16a34a" : "#eab308" }]}>
              {util}% 
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Impact</Text>
            <Text style={styles.metricValue}>
              {Number(stats.achievedBeneficiaries || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(util, 100)}%` }]} />
        </View>

        {/* <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewText}>View Details</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => router.push(`/OrgProjects/${item.organizationId}`)}
        >      
            <Text style={styles.viewText}>View Projects</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={styles.hero}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="globe-outline" size={18} color="#fff" />
            <Text style={styles.heroTitle}>Global SDG Finance</Text>
          </View>
          <Text style={styles.heroSub}>Multi-Organization Impact</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterChip}
            // onPress={async () => {
            //   // quick cycle filter for demo; swap with modal picker if you want
            //   const next = filter.sdg ? (filter.sdg % 17) + 1 : 1;
            //   const sdg = next > 17 ? null : next;
            //   const f = { ...filter, sdg };
            //   setFilter(f);
            //   await load(f);
            // }}
            onPress={() => setSdgOpen(true)} 
          >
            <Ionicons name="filter-outline" size={16} color="#16a34a" />
            <Text style={styles.filterText}>{filter.sdg ? `SDG ${filter.sdg}` : "All Goals"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChip}
            // onPress={async () => {
            //   const f = { ...filter, region: filter.region ? null : "Central" }; // demo toggle
            //   setFilter(f);
            //   await load(f);
            // }}
            onPress={() => setRegionOpen(true)}
          >
            <Ionicons name="location-outline" size={16} color="#16a34a" />
            <Text style={styles.filterText}>{filter.region || "All Regions"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip} onPress={clearFilters}>
            <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
            <Text style={styles.filterText}>Reset</Text>
          </TouchableOpacity>
        </View>


        {/* 🆕 SDG dropdown */}
        <Modal transparent visible={sdgOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSdgOpen(false)}>
            <View style={[styles.modalSheet, { maxHeight: "70%" }]}>
            <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 8 }}>Filter by SDG</Text>
            <ScrollView>
                <TouchableOpacity
                style={styles.modalItem}
                onPress={async () => {
                    const f = { ...filter, sdg: null };
                    setFilter(f); setSdgOpen(false); await load(f);
                }}
                >
                <Text style={{ fontSize: 16 }}>All Goals</Text>
                {!filter.sdg && <Ionicons name="checkmark" size={18} color="#16a34a" />}
                </TouchableOpacity>

                {SDGS.map((g) => (
                <TouchableOpacity
                    key={g.id}
                    style={styles.modalItem}
                    onPress={async () => {
                    const f = { ...filter, sdg: g.id };
                    setFilter(f); setSdgOpen(false); await load(f);
                    }}
                >
                    <Text style={{ fontSize: 16 }}>{`SDG ${g.id} — ${g.title}`}</Text>
                    {filter.sdg === g.id && <Ionicons name="checkmark" size={18} color="#16a34a" />}
                </TouchableOpacity>
                ))}
            </ScrollView>
            </View>
        </Pressable>
        </Modal>

        {/* 🆕 Region dropdown */}
        <Modal transparent visible={regionOpen} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setRegionOpen(false)}>
            <View style={styles.modalSheet}>
            <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 8 }}>Filter by Region</Text>

            {REGIONS.map((r) => {
                const val = r === "All Regions" ? null : r;
                const active = (filter.region || null) === val;
                return (
                <TouchableOpacity
                    key={r}
                    style={styles.modalItem}
                    onPress={async () => {
                    const f = { ...filter, region: val };
                    setFilter(f); setRegionOpen(false); await load(f);
                    }}
                >
                    <Text style={{ fontSize: 16 }}>{r}</Text>
                    {active && <Ionicons name="checkmark" size={18} color="#16a34a" />}
                </TouchableOpacity>
                );
            })}
            </View>
        </Pressable>
        </Modal>



        <Text style={styles.sectionTitle}>Global Overview</Text>
        {loading ? (
          <View style={{ paddingVertical: 16, alignItems: "center" }}>
            <ActivityIndicator color="#16a34a" />
          </View>
        ) : (
          <View style={styles.overviewRow}>
            {/* Active Projects */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewLabel}>Active Projects</Text>
                <Ionicons name="document-text-outline" size={18} color="#16a34a" />
              </View>
              <Text style={styles.overviewValue}>{totals.projects}</Text>
              <Text style={styles.overviewSub}>{totals.orgs} Organizations</Text>
            </View>
            {/* Total Impact */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewLabel}>Total Impact</Text>
                <Ionicons name="people-outline" size={18} color="#2563eb" />
              </View>
              <Text style={styles.overviewValue}>
                {Number(totals.impact).toLocaleString()}
              </Text>
              <Text style={styles.overviewSub}>Beneficiaries</Text>
            </View>
          </View>
        )}


        <Text style={styles.sectionTitle}>Explore Organizations</Text>
        {/* Overview top cards (simplified) */}
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color="#16a34a" />
          </View>
        ) : (
          <FlatList
            data={orgs}
            keyExtractor={(item, idx) => item?.org?._id || String(idx)}
            renderItem={renderCard}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {  padding: 14, marginBottom: 12 },
  heroTitle: { color: "#a7eec9ff", fontSize: 22, fontWeight: "800" },
  heroSub: { color: "#d1fae5", marginTop: 2, marginLeft: 30 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ecfdf5",
                paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  filterText: { color: "#065f46", fontWeight: "700" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 28, height: 28, borderRadius: 6 },
  logoFallback: { width: 28, height: 28, borderRadius: 6, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" },
  orgName: { fontWeight: "800", color: "#0f172a", flexShrink: 1 },

  metricsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  metricBox: { flex: 1 },
  metricLabel: { color: "#6b7280", fontSize: 12 },
  metricValue: { color: "#0f172a", fontWeight: "800" },

  progressTrack: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 6, marginTop: 10, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: "#16a34a" },

  viewBtn: { backgroundColor: "#F3F4F6", marginTop: 10, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  viewText: { color: "#111827", fontWeight: "700" },

  sdgChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  sdgText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  sectionTitle: { color: "#e5e7eb", fontWeight: "800", marginBottom: 8, fontSize: 19, marginTop: 14 },
  overviewRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  overviewCard: {
    flex: 1, backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  overviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  overviewLabel: { color: "#6b7280", fontWeight: "700" },
  overviewValue: { marginTop: 6, color: "#0f172a", fontSize: 20, fontWeight: "900" },
  overviewSub: { color: "#6b7280", marginTop: 2 },

     overviewSub: { color: "#6b7280", marginTop: 2 },
  // 🆕 modal styles
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalItem: {
    paddingVertical: 14, paddingHorizontal: 6, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    borderBottomWidth: 1, borderColor: "#F2F4F7",
  },

});

