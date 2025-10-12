import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ManagerNavBar from "../../components/ManagerNavBar";
import { useRouter } from "expo-router";
import { me as fetchMe, getToken, clearToken } from "../../lib/auth";
import { API_BASE_URL } from "../../lib/api";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // API_BASE_URL includes /api - strip that to get server base for uploads
  return API_BASE_URL.replace(/\/api$/i, "") + path;
}

export default function ManagerProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const u = await fetchMe();
        if (!mounted) return;
        setUser(u || null);

        const token = await getToken();
        if (!token) return setLoading(false);

        const res = await fetch(`${API_BASE_URL}/ngo/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setProfile(data.profile || data);
        } else {
          // ignore non-fatal - profile may not exist yet
          const data = await res.json().catch(() => ({}));
          setError(data.message || "Failed to load org profile");
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const onLogout = async () => {
    await clearToken();
    router.replace("/(auth)");
  };

  const orgLogo = profile?.organization_logo && getImageUrl(profile.organization_logo);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Profile & Settings</Text>
        <Text style={styles.headerSub}>Manage your account preferences and settings</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 32 }} />
        ) : (
          <View style={styles.card}>
            {/* ...existing code... */}
            <View style={styles.row}>
              <Image
                source={orgLogo ? { uri: orgLogo } : require("../../assets/images/logo.png")}
                style={styles.avatar}
              />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.name}>{user?.fullName || "—"}</Text>
                <Text style={styles.email}>{user?.email || "—"}</Text>
                {user?.role === "NGO_MANAGER" && (
                  <View style={styles.rolePill}>
                    <Text style={styles.roleText}>NGO Manager</Text>
                  </View>
                )}
              </View>
            </View>
            {/* ...existing code... */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organization</Text>
              <Text style={styles.sectionText}>{profile?.organization_name || "Not provided"}</Text>
            </View>
            {/* ...existing code... */}
            {Array.isArray(profile?.sdgs) && profile.sdgs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SDGs</Text>
                  <View style={styles.sdgList}>
                    {profile.sdgs.map((s) => (
                      <View key={s} style={styles.sdgPill}>
                        <Text style={styles.sdgText}>{s}</Text>
                      </View>
                    ))}
                  </View>
              </View>
            )}
            {/* ...existing code... */}
            <View style={[styles.settings]}> 
              <TouchableOpacity style={styles.settingRow} onPress={() => router.push("/(tabs)/Language") }>
                <View>
                  <Text style={styles.settingTitle}>Language</Text>
                  <Text style={styles.settingSub}>Choose your preferred language</Text>
                </View>
                <View style={styles.langPill}>
                  <Text style={styles.langText}>English</Text>
                  <Ionicons name="checkmark" size={14} color="#16A34A" />
                </View>
              </TouchableOpacity>
              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSub}>Receive alerts and updates</Text>
                </View>
                <Switch value={notifEnabled} onValueChange={setNotifEnabled} />
              </View>
              <TouchableOpacity style={styles.settingRow} onPress={() => router.push("/(tabs)/FinanceDashboard") }>
                <View>
                  <Text style={styles.settingTitle}>Financial Account Settings</Text>
                  <Text style={styles.settingSub}>Manage payment methods and billing</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow} onPress={() => router.push("/(tabs)/HelpSupport") }>
                <View>
                  <Text style={styles.settingTitle}>Help & Support</Text>
                  <Text style={styles.settingSub}>Get assistance and contact support</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow} onPress={onLogout}>
                <View>
                  <Text style={[styles.settingTitle, { color: "#DC2626" }]}>Logout</Text>
                  <Text style={styles.settingSub}>Sign out of your account</Text>
                </View>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
            <Text style={styles.version}>Version 1.2.0 • © 2025 GoalVerse</Text>
          </View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <ManagerNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { padding: 20, paddingBottom: 120 },
  header: { color: "#111827", fontSize: 18, fontWeight: "800", marginBottom: 6 },
  headerSub: { color: "#6B7280", fontSize: 13, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#F3F4F6" },
  name: { fontSize: 18, fontWeight: "800", color: "#111827" },
  email: { color: "#6B7280", marginTop: 4 },
  rolePill: { alignSelf: "flex-start", marginTop: 8, backgroundColor: "#E6F9EF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  roleText: { color: "#16A34A", fontWeight: "700", fontSize: 12 },
  section: { marginTop: 16 },
  sectionTitle: { color: "#6B7280", fontSize: 12, marginBottom: 6 },
  sectionText: { color: "#111827", fontWeight: "700" },
  sdgList: { flexDirection: "row", flexWrap: "wrap" },
  sdgPill: { backgroundColor: "#F0FFF4", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8, minWidth: 34, alignItems: "center" },
  sdgText: { color: "#065F46", fontWeight: "700" },
  settings: { marginTop: 18 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  settingTitle: { fontWeight: "700", color: "#111827" },
  settingSub: { color: "#6B7280", marginTop: 4 },
  langButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  langPill: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E6F0EA", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: "#FFFFFF" },
  langText: { color: "#111827", marginRight: 8, fontWeight: "700" },
  version: { marginTop: 18, color: "#9CA3AF", fontSize: 12, textAlign: "center" },
  error: { color: "#F87171", marginTop: 12 },
});
