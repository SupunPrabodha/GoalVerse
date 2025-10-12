// app/(tabs)/NGOManagerHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ManagerNavBar from "../../components/ManagerNavBar";

import { me } from "../../lib/auth";                   // current user
import { listMyProjects } from "../../lib/projects";   // all projects I own / my org
import BudgetBreakdownCard from "../../components/BudgetBreakdownCard"; // you already created this

export default function NGOManagerHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const u = await me();
        setUser(u || null);
        const list = await listMyProjects(); // must return projects with budget + expenses
        setProjects(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn(e?.message || e);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- totals & synthetic project for the breakdown ----------
  const { totalBudget, totalAllocated, totalActual, currency, coreAgg } = useMemo(() => {
    const cur = projects[0]?.budget?.currency || "USD";
    let tBudget = 0;
    let tAllocated = 0;
    let tActual = 0;
    const agg = {
      PROGRAM_IMPLEMENTATION: { allocated: 0, actual: 0 },
      ADMINISTRATIVE_COSTS:   { allocated: 0, actual: 0 },
      EMERGENCY_FUND:         { allocated: 0, actual: 0 },
    };

    for (const p of projects) {
      tBudget += Number(p?.budget?.amount || 0);
      for (const e of p?.expenses || []) {
        tAllocated += Number(e?.allocated || 0);
        tActual    += Number(e?.actual || 0);
        if (e.type === "CORE" && e.code && agg[e.code]) {
          agg[e.code].allocated += Number(e.allocated || 0);
          agg[e.code].actual    += Number(e.actual || 0);
        }
      }
    }
    return {
      totalBudget: tBudget,
      totalAllocated: tAllocated,
      totalActual: tActual,
      currency: cur,
      coreAgg: agg,
    };
  }, [projects]);

  // Build a "synthetic project" so BudgetBreakdownCard can be reused
  const syntheticProject = useMemo(() => {
    return {
      budget: { amount: totalBudget, currency },
      expenses: [
        {
          type: "CORE",
          code: "PROGRAM_IMPLEMENTATION",
          name: "Program Implementation",
          allocated: coreAgg.PROGRAM_IMPLEMENTATION.allocated,
          actual: coreAgg.PROGRAM_IMPLEMENTATION.actual,
          isLocked: true,
        },
        {
          type: "CORE",
          code: "ADMINISTRATIVE_COSTS",
          name: "Administrative Costs",
          allocated: coreAgg.ADMINISTRATIVE_COSTS.allocated,
          actual: coreAgg.ADMINISTRATIVE_COSTS.actual,
          isLocked: true,
        },
        {
          type: "CORE",
          code: "EMERGENCY_FUND",
          name: "Emergency Fund",
          allocated: coreAgg.EMERGENCY_FUND.allocated,
          actual: coreAgg.EMERGENCY_FUND.actual,
          isLocked: true,
        },
      ],
    };
  }, [totalBudget, currency, coreAgg]);

  const utilPct =
    totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 100) : 0;

  const money = (n) =>
    Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator color="#16a34a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        {/* Header bar */}
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={s.logoBox}>
              <Ionicons name="business-outline" size={18} color="#059669" />
            </View>
            <View>
              <Text style={s.orgName}>
                {user?.organization?.name || "Your Organization"}
              </Text>
              {/* <Text style={styles.headerSubtitle}>{user?.fullName || "NGO Manager"} • NGO Manager</Text> */}
              <Text style={s.headerSub}>Finance Dashboard</Text>
            </View>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.userName}>{user?.fullName || "NGO Manager"}</Text>
            <Text style={s.userRole}>NGO Manager</Text>
          </View>
        </View>

        <View style={s.container}>
              <Text style={s.title}>Organization Overview</Text>
        
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity style={s.cta} onPress={() => router.push("/(tabs)/ProjectCreate")}> 
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={s.ctaText}>Create Project</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.secondary} onPress={() => router.push("/(tabs)/ProjectList")}> 
                  <Ionicons name="albums-outline" size={18} color="#16a34a" />
                  <Text style={s.secondaryText}>View Projects</Text>
                </TouchableOpacity>
              </View>
              {/* <ManagerNavBar /> */}
            </View>

        {/* KPI cards */}
        <View style={s.kpiRow}>
          {/* Budget Utilization */}
          <View style={s.kpiCard}>
            <View style={s.kpiHeader}>
              <Text style={s.kpiLabel}>Budget Utilization</Text>
              <Ionicons name="time-outline" size={16} color="#10b981" />
            </View>
            <Text style={s.kpiValue}>{utilPct}%</Text>
            <Text style={s.kpiSub}>
              {currency}{money(totalAllocated)} of {currency}{money(totalBudget)} used
            </Text>
          </View>

          {/* Partnerships (static for now) */}
          <View style={s.kpiCard}>
            <View style={s.kpiHeader}>
              <Text style={s.kpiLabel}>Partnerships</Text>
              <Ionicons name="git-compare-outline" size={16} color="#3b82f6" />
            </View>
            <Text style={s.kpiValue}>1</Text>
            <Text style={s.kpiSub}>New proposal received</Text>
          </View>
        </View>

        {/* Budget Breakdown (aggregated) */}
        <View style={s.cardWrap}>
          <BudgetBreakdownCard project={syntheticProject} />
        </View>
      </ScrollView>
      <ManagerNavBar />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },

  header: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoBox: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginTop: 20, marginLeft: -10
  },
  orgName: { color: "#3abbb0ff", fontWeight: "900", fontSize: 20, marginTop: 20 },
  headerSub: { color: "#d7dadfff" },
  userName: { color: "#939394ff", fontWeight: "800", marginTop: 22 },
  userRole: { color: "#6b7280" },

  sectionTitle: { marginTop: -35, marginBottom: 10, color: "#111827", fontWeight: "900", fontSize: 16 },

  kpiRow: { flexDirection: "row", gap: 12 },
  kpiCard: {
    flex: 1,
    backgroundColor: "#ffffffaf",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20
  },
  kpiHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kpiLabel: { color: "#3c4047ff", fontWeight: "700" },
  kpiValue: { color: "#111827", fontWeight: "900", fontSize: 22, marginTop: 6 },
  kpiSub: { color: "#505358ff", marginTop: 2 },

  cardWrap: { marginTop: 16 },



  container: { flex: 1, backgroundColor: "#111827", padding: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 25, marginLeft: -12 },
  cta: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#16a34a",
         paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginLeft: -15 },
  ctaText: { color: "#fff", fontWeight: "700" },
  secondary: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#ecfdf5",
               paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  secondaryText: { color: "#16a34a", fontWeight: "700" },
});

