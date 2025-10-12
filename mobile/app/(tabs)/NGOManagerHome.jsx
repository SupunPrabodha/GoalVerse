// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { me, getToken } from "../../lib/auth";
// import { api, authHeaders, API_BASE_URL } from "../../lib/api";
// import { Ionicons } from "@expo/vector-icons";
// import ManagerNavBar from "../../components/ManagerNavBar";

// export default function NGOManagerHome() {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [dashboard, setDashboard] = useState(null);
//   const [evidence, setEvidence] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         // fetch current user and NGO profile (if available)
//         const token = await getToken();
//         let u = null;
//         if (token) {
//           const { data: meData } = await api.get("/auth/me", authHeaders(token));
//           u = meData.user;
//         }

//         if (!mounted) return;
//         setUser(u);

//         // fetch NGO profile and dashboard if manager
//         if (u?.role === "NGO_MANAGER" && token) {
//           try {
//             const [profileRes, dashRes, evidenceRes] = await Promise.all([
//               api.get("/ngo/me", authHeaders(token)),
//               api.get("/ngo/dashboard", authHeaders(token)),
//               api.get("/ngo/evidence?limit=10", authHeaders(token)),
//             ]);
//             if (!mounted) return;
//             setProfile(profileRes.data.profile || null);
//             setDashboard(dashRes.data || null);
//             setEvidence(evidenceRes.data.items || []);
//           } catch (e) {
//             // ignore profile/dashboard error
//           }
//         }
//       } catch (e) {
//         // silent
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => (mounted = false);
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#16a34a" />
//       </View>
//     );
//   }

//   const orgName = profile?.organization_name || user?.organizationName || user?.fullName || "SDG Progress Partners";
//   const email = user?.email || "--";
//   const logoUri = profile?.organization_logo
//     ? // profile returns a path like /uploads/logos/filename
//       (API_BASE_URL.replace(/\/api\/?$/, "") + profile.organization_logo)
//     : null;

//   const budgetUtil = dashboard ? dashboard.budgetUtilizationPercent / 100 : 0;
//   const partnerships = dashboard ? dashboard.partnershipsCount : 0;
//   const reportsDue = dashboard ? dashboard.reportsDueCount : 0;

//   return (
//     <View style={{ flex: 1, position: "relative" }}>
//       <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
//         {/* Header */}
//         <View style={styles.headerRow}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Image source={ logoUri ? { uri: logoUri } : require("../../assets/images/logo.png") } style={styles.headerLogo} />
//             <View style={{ marginLeft: 12 }}>
//               <Text style={styles.headerTitle}>{orgName}</Text>
//               <Text style={styles.headerSubtitle}>{user?.fullName || "NGO Manager"} • NGO Manager</Text>
//             </View>
//           </View>
//           <TouchableOpacity style={styles.headerAvatar}>
//             <Ionicons name="person-circle" size={28} color="#ffffff" />
//           </TouchableOpacity>
//         </View>

//         {/* Stat cards */}
//         <View style={styles.statRow}>
//           <View style={[styles.statCard, { backgroundColor: "#ECFDF5" }]}> 
//             <Text style={styles.statLabel}>Budget Utilization</Text>
//             <Text style={styles.statValue}>{dashboard ? `${dashboard.budgetUtilizationPercent}%` : "--"}</Text>
//             <Text style={styles.statSmall}>{dashboard ? `$${(dashboard.budgetUsedCents/1000).toFixed(0)}K of $${(dashboard.budgetTotalCents/1000).toFixed(0)}K used` : "--"}</Text>
//           </View>

//           <View style={[styles.statCard, { backgroundColor: "#EFF6FF" }]}> 
//             <Text style={styles.statLabel}>Partnerships</Text>
//             <Text style={styles.statValue}>{partnerships}</Text>
//             <Text style={styles.statSmall}>New proposal received</Text>
//           </View>

//           <View style={[styles.statCard, { backgroundColor: "#FFFBEB" }]}> 
//             <Text style={styles.statLabel}>Donor Reports Due</Text>
//             <Text style={styles.statValue}>{reportsDue}</Text>
//             <Text style={styles.statSmall}>Due within 7 days</Text>
//           </View>
//         </View>

//         {/* Budget Breakdown */}
//         <View style={styles.card}>
//           <View style={styles.cardHeaderRow}>
//             <Text style={styles.cardTitle}>Budget Breakdown</Text>
//             <Ionicons name="cash-outline" size={20} color="#16a34a" />
//           </View>

//           {dashboard?.budgetBreakdown?.map((b, idx) => (
//             <View style={styles.budgetRow} key={b.name + idx}>
//               <View style={styles.budgetLabelCol}>
//                 <Text style={styles.budgetLabel}>{b.name}</Text>
//                 <Text style={styles.budgetSub}>{`$${(b.amountCents/1000).toFixed(0)}K (${b.percent}%)`}</Text>
//               </View>
//               <View style={styles.progressCol}>
//                 <View style={styles.progressTrack}>
//                   <View style={[styles.progressFill, { width: `${b.percent}%` }]} />
//                 </View>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* Upcoming Deadlines */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Upcoming Deadlines</Text>
//           {dashboard?.upcomingDeadlines?.map((d) => (
//             <View style={styles.deadlineItem} key={d.id}>
//               <View>
//                 <Text style={styles.deadlineTitle}>{d.title}</Text>
//                 <Text style={styles.deadlineSub}>{`${d.donor} • ${d.dueInDays} days`}</Text>
//               </View>
//               <TouchableOpacity style={styles.ghostBtn}><Text style={{color: '#065f46'}}>{d.actionLabel}</Text></TouchableOpacity>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//       <ManagerNavBar />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   page: { backgroundColor: "#FAFAF9" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
//   headerLogo: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#fff" },
//   headerTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
//   headerSubtitle: { color: "#6b7280", marginTop: 4 },
//   headerAvatar: { backgroundColor: "#16a34a", padding: 8, borderRadius: 20 },

//   statRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 12 },
//   statCard: { flex: 1, padding: 12, borderRadius: 12, marginRight: 8 },
//   statLabel: { color: "#475569", fontSize: 13 },
//   statValue: { fontSize: 20, fontWeight: "800", marginTop: 6 },
//   statSmall: { color: "#475569", marginTop: 6, fontSize: 12 },

//   card: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12 },
//   cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
//   cardTitle: { fontWeight: "800", fontSize: 16, color: "#0f172a" },

//   budgetRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
//   budgetLabelCol: { flex: 1 },
//   budgetLabel: { color: "#0f172a", fontWeight: "700" },
//   budgetSub: { color: "#6b7280", marginTop: 4 },
//   progressCol: { flex: 1.4, paddingLeft: 12 },
//   progressTrack: { height: 8, backgroundColor: "#F1F5F9", borderRadius: 8, overflow: "hidden" },
//   progressFill: { height: 8, backgroundColor: "#16a34a" },

//   deadlineItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
//   deadlineTitle: { fontWeight: "700", color: "#0f172a" },
//   deadlineSub: { color: "#6b7280", marginTop: 4 },
//   ghostBtn: { backgroundColor: "#fff", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e6f4ea" },

//   bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", justifyContent: "space-around", backgroundColor: "#16a34a", paddingVertical: 12 },
//   navItem: { alignItems: "center", justifyContent: "center" },
// });






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

