import React, { useEffect, useState } from "react";
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { getToken } from "../../lib/auth";
import { api, authHeaders, API_BASE_URL } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";
import ManagerNavBar from "../../components/ManagerNavBar";
import { useRouter } from "expo-router";

export default function NGOManagerHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [evidence, setEvidence] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken();
        let u = null;
        if (token) {
          const { data: meData } = await api.get("/auth/me", authHeaders(token));
          u = meData.user;
        }
        if (!mounted) return;
        setUser(u);

        if (u?.role === "NGO_MANAGER" && token) {
          try {
            const [profileRes, dashRes, evidenceRes] = await Promise.all([
              api.get("/ngo/me", authHeaders(token)),
              api.get("/ngo/dashboard", authHeaders(token)),
              api.get("/ngo/evidence?limit=10", authHeaders(token)),
            ]);
            if (!mounted) return;
            setProfile(profileRes.data.profile || null);
            setDashboard(dashRes.data || null);
            setEvidence(evidenceRes.data.items || []);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* silent */
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const orgName =
    profile?.organization_name ||
    user?.organizationName ||
    user?.fullName ||
    "SDG Progress Partners";

  const logoUri = profile?.organization_logo
    ? isAbsolute(profile.organization_logo)
      ? profile.organization_logo
      : API_BASE_URL.replace(/\/api\/?$/, "") + profile.organization_logo
    : null;

  const partnerships = dashboard?.partnershipsCount ?? 0;
  const reportsDue = dashboard?.reportsDueCount ?? 0;

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={logoUri ? { uri: logoUri } : require("../../assets/images/logo.png")}
              style={styles.headerLogo}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.headerTitle}>{orgName}</Text>
              <Text style={styles.headerSubtitle}>
                {(user?.fullName || "Member") + " • " + formatRoleLabel(user?.role)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerAvatar}
            onPress={() => router.push("/(tabs)/Profile")}
            accessibilityLabel="Open profile"
          >
            <Ionicons name="person-circle" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stat cards */}
        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: "#ECFDF5", marginRight: 8 }]}>
            <Text style={styles.statLabel}>Budget Utilization</Text>
            <Text style={styles.statValue}>
              {dashboard ? `${dashboard.budgetUtilizationPercent}%` : "--"}
            </Text>
            <Text style={styles.statSmall}>
              {dashboard
                ? `$${(dashboard.budgetUsedCents / 1000).toFixed(0)}K of $${(
                    dashboard.budgetTotalCents / 1000
                  ).toFixed(0)}K used`
                : "--"}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#EFF6FF", marginRight: 8 }]}>
            <Text style={styles.statLabel}>Partnerships</Text>
            <Text style={styles.statValue}>{partnerships}</Text>
            <Text style={styles.statSmall}>New proposal received</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#FFFBEB" }]}>
            <Text style={styles.statLabel}>Donor Reports Due</Text>
            <Text style={styles.statValue}>{reportsDue}</Text>
            <Text style={styles.statSmall}>Due within 7 days</Text>
          </View>
        </View>

        {/* Budget Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Budget Breakdown</Text>
            <Ionicons name="cash-outline" size={20} color="#16a34a" />
          </View>

          {dashboard?.budgetBreakdown?.map((b, idx) => (
            <View style={styles.budgetRow} key={b.name + idx}>
              <View style={styles.budgetLabelCol}>
                <Text style={styles.budgetLabel}>{b.name}</Text>
                <Text style={styles.budgetSub}>{`$${(b.amountCents / 1000).toFixed(0)}K (${b.percent}%)`}</Text>
              </View>
              <View style={styles.progressCol}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${b.percent}%` }]} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Upcoming Deadlines */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Deadlines</Text>
          {dashboard?.upcomingDeadlines?.map((d) => (
            <View style={styles.deadlineItem} key={d.id}>
              <View>
                <Text style={styles.deadlineTitle}>{d.title}</Text>
                <Text style={styles.deadlineSub}>{`${d.donor} • ${d.dueInDays} days`}</Text>
              </View>
              <TouchableOpacity style={styles.ghostBtn}>
                <Text style={{ color: "#065f46" }}>{d.actionLabel}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      <ManagerNavBar />
    </View>
  );
}

function formatRoleLabel(role) {
  if (!role) return "Member";
  if (role === "NGO_MANAGER") return "NGO Manager";
  if (role === "DONOR") return "Donor";
  if (role === "VOLUNTEER") return "Volunteer";
  return role.replace(/_/g, " ").toLowerCase().replace(/(^|\s)\S/g, (t) => t.toUpperCase());
}

function isAbsolute(url) {
  return /^https?:\/\//i.test(url);
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#FAFAF9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerLogo: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { color: "#6b7280", marginTop: 4 },
  headerAvatar: { backgroundColor: "#16a34a", padding: 8, borderRadius: 20 },

  statRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  statCard: { flex: 1, padding: 12, borderRadius: 12 },

  statLabel: { color: "#475569", fontSize: 13 },
  statValue: { fontSize: 20, fontWeight: "800", marginTop: 6 },
  statSmall: { color: "#475569", marginTop: 6, fontSize: 12 },

  card: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: "#0f172a" },

  budgetRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  budgetLabelCol: { flex: 1 },
  budgetLabel: { color: "#0f172a", fontWeight: "700" },
  budgetSub: { color: "#6b7280", marginTop: 4 },
  progressCol: { flex: 1.4, paddingLeft: 12 },
  progressTrack: { height: 8, backgroundColor: "#F1F5F9", borderRadius: 8, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: "#16a34a" },

  deadlineItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  deadlineTitle: { fontWeight: "700", color: "#0f172a" },
  deadlineSub: { color: "#6b7280", marginTop: 4 },
  ghostBtn: { backgroundColor: "#fff", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e6f4ea" },
});
