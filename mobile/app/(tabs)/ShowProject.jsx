// app/(tabs)/ShowProject.jsx
import React, { useEffect, useState } from "react";
import {
  View, Text, SafeAreaView, StyleSheet,
  ActivityIndicator, ScrollView, TouchableOpacity
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { fetchPublicProject } from "../../lib/public";
import BudgetVsActualChart from "../../components/BudgetVsActualChart";
import DonutCostPerBeneficiary from "../../components/DonutCostPerBeneficiary";
import ExpenseCategoriesCard from "../../components/ExpenseCategoriesCard";

const SDG_COLORS = [
  "#e5243b","#DDA63A","#4C9F38","#C5192D","#FF3A21","#26BDE2","#FCC30B",
  "#A21942","#FD6925","#DD1367","#FD9D24","#BF8B2E","#3F7E44","#0A97D9",
  "#56C02B","#00689D","#19486A"
];

export default function ShowProject() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const data = await fetchPublicProject(id);
        setP(data);
      } catch (e) {
        console.warn(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator color="#16a34a" />
      </SafeAreaView>
    );
  }
  if (!p) {
    return (
      <SafeAreaView style={s.center}>
        <Text style={{ color: "#fff" }}>Project not found</Text>
      </SafeAreaView>
    );
  }

  const util = p.target_beneficiaries
    ? Math.round((p.achieved_beneficiaries / p.target_beneficiaries) * 100)
    : 0;

  const chartData = (p?.expenses || []).map((e) => ({
    name: e.name,
    budget: Number(e.allocated || 0),
    actual: Number(e.actual || 0),
  }));

  const donutRows = (p?.expenses || []).map((e) => ({
    name: e.name,
    actual: Number(e.actual || 0),
    beneficiaries: Number(e.beneficiaries || 0),
  }));
  const donutMetric = donutRows.some((r) => r.beneficiaries > 0) ? "cpb" : "actual";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {/* Header */}
        <View style={s.headerCard}>
          <View style={s.headerTop}>
            <Text style={s.orgText}>{p.organization?.name || "Organization"}</Text>
            <View style={s.statusPill}>
              <Text style={s.statusText}>{readableStatus(p.status)}</Text>
            </View>
          </View>

          <Text style={s.projectTitle}>{p.name}</Text>

          <View style={s.sdgRow}>
            <View style={[s.sdgPill, { backgroundColor: SDG_COLORS[(p.sdg - 1) % 17] }]}>
              <Ionicons name="leaf-outline" size={14} color="#fff" />
              <Text style={s.sdgText}>SDG {p.sdg}</Text>
            </View>
            <View style={s.lightPill}>
              <Ionicons name="sparkles-outline" size={14} color="#16a34a" />
              <Text style={s.lightPillText}>{sdgTitle(p.sdg)}</Text>
            </View>
          </View>
        </View>

        {/* Project details */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Project Details</Text>
          <DetailRow icon="calendar-outline" label="Start Date" value={dateStr(p.start_date)} />
          <DetailRow icon="calendar-outline" label="End Date" value={dateStr(p.end_date)} />
          <DetailRow icon="location-outline" label="Region" value={p.region || "—"} />
          <DetailRow icon="cash-outline" label="Total Budget" value={`$ ${num(p.budget?.amount)}`} />

          {Array.isArray(p.donors) && p.donors.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={s.smallLabel}>Donors</Text>
              <View style={s.chipsWrap}>
                {p.donors.map((d) => (
                  <View key={d} style={s.chip}>
                    <Text style={s.chipText}>{d}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Impact metrics */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Impact Metrics</Text>
          <View style={s.metricsRow}>
            <MetricBox icon="people-outline" label="Target Beneficiaries" value={num(p.target_beneficiaries)} />
            <MetricBox icon="checkmark-done-outline" label="Achieved" value={num(p.achieved_beneficiaries)} />
          </View>

          <Text style={s.smallLabel}>Beneficiary Achievement</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${Math.min(util, 100)}%` }]} />
          </View>
          <Text style={{ color: "#6b7280", marginTop: 4 }}>{util}%</Text>
        </View>

        {!!p.description && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>About this Project</Text>
            <Text style={s.aboutText}>{p.description}</Text>
          </View>
        )}

        {/* Stats toggle (read-only visuals) */}
        <TouchableOpacity style={s.primaryBtn} onPress={() => setShowStats(v => !v)}>
          <Ionicons name="bar-chart-outline" size={18} color="#fff" />
          <Text style={s.primaryText}>{showStats ? "Hide Statistics" : "See Statistics"}</Text>
        </TouchableOpacity>

        {showStats && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Budget vs Actual</Text>
            {chartData.length > 0 ? (
              <BudgetVsActualChart
                data={chartData}
                currency="$"
                title="Budget vs Actual"
                subtitle="Comparison of planned budget against actual expenditures"
              />
            ) : (
              <Text style={{ color: "#6b7280" }}>No expense data for this project.</Text>
            )}

            <View style={{ height: 14 }} />
            <Text style={s.sectionTitle}>Cost per Beneficiary Breakdown</Text>
            {donutRows.length > 0 ? (
              <DonutCostPerBeneficiary
                data={donutRows}
                currency="$"
                metric={donutMetric}
                title="Cost per Beneficiary Breakdown"
                subtitle="Distribution of beneficiary-related costs"
              />
            ) : (
              <Text style={{ color: "#6b7280" }}>No expense data for this project.</Text>
            )}

            <View style={{ height: 14 }} />
            <ExpenseCategoriesCard
              title="Expense Categories"
              categories={(p?.expenses || []).map(e => ({ name: e.name, actual: e.actual }))}
              currency={p?.budget?.currency || "$"}
              onReportPress={() => {}}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={s.detailRow}>
      <View style={s.detailIcon}><Ionicons name={icon} size={16} color="#16a34a" /></View>
      <View style={{ flex: 1 }}>
        <Text style={s.smallLabel}>{label}</Text>
        <Text style={s.detailValue}>{value}</Text>
      </View>
    </View>
  );
}
function MetricBox({ icon, label, value }) {
  return (
    <View style={s.metricBox}>
      <Ionicons name={icon} size={18} color="#065f46" />
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}
const num = (n) => Number(n || 0).toLocaleString();
const dateStr = (d) => (d ? new Date(d).toDateString().slice(4) : "—");
const sdgTitle = (n) => [
  "No Poverty","Zero Hunger","Good Health and Well-being","Quality Education","Gender Equality",
  "Clean Water and Sanitation","Affordable and Clean Energy","Decent Work and Economic Growth",
  "Industry, Innovation and Infrastructure","Reduced Inequalities","Sustainable Cities and Communities",
  "Responsible Consumption and Production","Climate Action","Life Below Water","Life on Land",
  "Peace, Justice and Strong Institutions","Partnerships for the Goals"
][(n - 1) % 17];
const readableStatus = (s) => ({ ON_GOING: "Ongoing", PLANNED: "Planned", COMPLETED: "Completed" }[s] || "Ongoing");

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center" },
  headerCard: { borderRadius: 12, padding: 12, marginBottom: 12 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orgText: { color: "#ffffffff", fontSize: 17 },
  statusPill: { backgroundColor: "#ecfdf5", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999 },
  statusText: { color: "#16a34a", fontWeight: "700" },
  projectTitle: { marginTop: 6, fontSize: 20, fontWeight: "900", color: "#a7eec9ff" },
  sdgRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  sdgPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  sdgText: { color: "#fff", fontWeight: "800" },
  lightPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F1F5F9", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  lightPillText: { color: "#111827", fontWeight: "700" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12 },
  sectionTitle: { fontWeight: "800", color: "#0f172a", marginBottom: 8, fontSize: 18 },

  detailRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  detailIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  smallLabel: { color: "#6b7280", fontSize: 12 },
  detailValue: { color: "#0f172a", fontWeight: "700" },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  chip: { backgroundColor: "#E0F2FE", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: "#0C4A6E", fontWeight: "700" },

  metricsRow: { flexDirection: "row", gap: 10 },
  metricBox: { flex: 1, backgroundColor: "#E5F9EF", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 },
  metricValue: { color: "#065f46", fontSize: 18, fontWeight: "900" },
  metricLabel: { color: "#065f46", fontSize: 12 },

  progressTrack: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 6, marginTop: 8, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: "#16a34a" },

  aboutText: { color: "#374151", lineHeight: 20 },

  primaryBtn: {
    backgroundColor: "#16a34a", paddingVertical: 12, alignItems: "center",
    borderRadius: 10, flexDirection: "row", gap: 8, justifyContent: "center",
    marginTop: 8, marginBottom: 25
  },
  primaryText: { color: "#fff", fontWeight: "800" },
});
