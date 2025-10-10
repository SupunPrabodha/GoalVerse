import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { me, getToken } from "../../lib/auth";
import { api, authHeaders, API_BASE_URL } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";

export default function NGOManagerHome() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // fetch current user and NGO profile (if available)
        const token = await getToken();
        let u = null;
        if (token) {
          const { data: meData } = await api.get("/auth/me", authHeaders(token));
          u = meData.user;
        }

        if (!mounted) return;
        setUser(u);

        // fetch NGO profile if manager
        if (u?.role === "NGO_MANAGER" && token) {
          try {
            const { data } = await api.get("/ngo/me", authHeaders(token));
            if (!mounted) return;
            setProfile(data.profile || null);
          } catch (e) {
            // ignore profile error
          }
        }
      } catch (e) {
        // silent
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

  const orgName = profile?.organization_name || user?.organizationName || user?.fullName || "SDG Progress Partners";
  const email = user?.email || "--";
  const logoUri = profile?.organization_logo
    ? // profile returns a path like /uploads/logos/filename
      (API_BASE_URL.replace(/\/api\/?$/, "") + profile.organization_logo)
    : null;

  // Sample metrics (replace with real API data later)
  const budgetUtil = 0.72;
  const partnerships = 1;
  const reportsDue = 2;

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={ logoUri ? { uri: logoUri } : require("../../assets/images/logo.png") } style={styles.headerLogo} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>{orgName}</Text>
            <Text style={styles.headerSubtitle}>{user?.fullName || "NGO Manager"} • NGO Manager</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAvatar}>
          <Ionicons name="person-circle" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Stat cards */}
      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: "#ECFDF5" }]}>
          <Text style={styles.statLabel}>Budget Utilization</Text>
          <Text style={styles.statValue}>72%</Text>
          <Text style={styles.statSmall}>$720K of $1M used</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#EFF6FF" }]}>
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

        <View style={styles.budgetRow}>
          <View style={styles.budgetLabelCol}>
            <Text style={styles.budgetLabel}>Program Implementation</Text>
            <Text style={styles.budgetSub}>$450K (45%)</Text>
          </View>
          <View style={styles.progressCol}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "45%" }]} />
            </View>
          </View>
        </View>

        <View style={styles.budgetRow}>
          <View style={styles.budgetLabelCol}>
            <Text style={styles.budgetLabel}>Administrative Costs</Text>
            <Text style={styles.budgetSub}>$180K (18%)</Text>
          </View>
          <View style={styles.progressCol}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "18%", backgroundColor: "#93C5FD" }]} />
            </View>
          </View>
        </View>

        <View style={styles.budgetRow}>
          <View style={styles.budgetLabelCol}>
            <Text style={styles.budgetLabel}>Emergency Fund</Text>
            <Text style={styles.budgetSub}>$90K (9%)</Text>
          </View>
          <View style={styles.progressCol}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "9%", backgroundColor: "#34D399" }]} />
            </View>
          </View>
        </View>

        <View style={styles.budgetRow}>
          <View style={styles.budgetLabelCol}>
            <Text style={styles.budgetLabel}>Available Budget</Text>
            <Text style={styles.budgetSub}>$280K (28%)</Text>
          </View>
          <View style={styles.progressCol}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "28%", backgroundColor: "#34D399" }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Upcoming Deadlines */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Deadlines</Text>
        <View style={styles.deadlineItem}>
          <View>
            <Text style={styles.deadlineTitle}>Q3 Financial Report</Text>
            <Text style={styles.deadlineSub}>WorldVision Donor • 3 days</Text>
          </View>
          <TouchableOpacity style={styles.ghostBtn}><Text style={{color: '#065f46'}}>Review</Text></TouchableOpacity>
        </View>

        <View style={styles.deadlineItem}>
          <View>
            <Text style={styles.deadlineTitle}>Impact Assessment</Text>
            <Text style={styles.deadlineSub}>UN Partnership • 5 days</Text>
          </View>
          <TouchableOpacity style={styles.ghostBtn}><Text style={{color: '#075985'}}>Prepare</Text></TouchableOpacity>
        </View>

        <View style={styles.deadlineItem}>
          <View>
            <Text style={styles.deadlineTitle}>Partnership Proposal</Text>
            <Text style={styles.deadlineSub}>Clean Water Initiative • Review</Text>
          </View>
          <TouchableOpacity style={styles.ghostBtn}><Text style={{color: '#065f46'}}>Open</Text></TouchableOpacity>
        </View>
      </View>

      {/* Bottom static nav preview (visual only) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Ionicons name="home" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Ionicons name="handshake-outline" size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Ionicons name="bar-chart-outline" size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Ionicons name="notifications-outline" size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Ionicons name="person-outline" size={22} color="#fff" /></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#FAFAF9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerLogo: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { color: "#6b7280", marginTop: 4 },
  headerAvatar: { backgroundColor: "#16a34a", padding: 8, borderRadius: 20 },

  statRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, padding: 12, borderRadius: 12, marginRight: 8 },
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

  bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", justifyContent: "space-around", backgroundColor: "#16a34a", paddingVertical: 12 },
  navItem: { alignItems: "center", justifyContent: "center" },
});
