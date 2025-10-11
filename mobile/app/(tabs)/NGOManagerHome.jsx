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
import { Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import SafeScreen from '../../components/SafeScreen';

export default function NGOManagerHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPicking, setIsPicking] = useState(false);

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

        // fetch NGO profile and dashboard if manager
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
          } catch (e) {
            // ignore profile/dashboard error
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

  async function refreshEvidence() {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await api.get('/ngo/evidence?limit=20', authHeaders(token));
      setEvidence(res.data.items || []);
    } catch (e) {
      // ignore
    }
  }

  async function handlePickAndUpload() {
    try {
      // dynamic import so app doesn't crash if dependency missing
      if (isPicking) return; // prevent concurrent pickers
      setIsPicking(true);
      let DocumentPicker;
      try { DocumentPicker = (await import('expo-document-picker')); } catch (e) {
        setIsPicking(false);
        return Alert.alert('Missing dependency', 'The Document Picker is not installed. Please run: npm install expo-document-picker');
      }

      let r;
      try {
        r = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      } catch (err) {
        // handle expo-document-picker concurrency error gracefully
        setIsPicking(false);
        const msg = err?.message || String(err);
        if (msg.includes('Different document picking in progress')) {
          return Alert.alert('Picker busy', 'Another document picker is already open. Please close it and try again.');
        }
        return Alert.alert('Picker error', msg);
      }
    setIsPicking(false);
    // small debounce to avoid concurrent picker warning on some devices
    await new Promise((res) => setTimeout(res, 50));
    if (r.type && r.type !== 'success') return;

    // support both shapes: { uri, name, mimeType } and { assets: [{...}] }
    const picked = (r && r.assets && r.assets[0]) ? r.assets[0] : r;

    // preview selection
    setSelectedFile({ uri: picked.uri, name: picked.name, mimeType: picked.mimeType });

      const token = await getToken();
      if (!token) return Alert.alert('Not authenticated');

  const uri = picked.uri;
  const filename = picked.name || (uri ? uri.split('/').pop() : '') || `upload-${Date.now()}`;
  let mimeType = picked.mimeType || 'application/octet-stream';
      // derive mime from extension if needed
      const ext = (filename.includes('.') ? filename.split('.').pop() : '').toLowerCase();
      if (mimeType === 'application/octet-stream' && ext) {
        if (['jpg','jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'heic') mimeType = 'image/heic';
        else if (ext === 'mp4') mimeType = 'video/mp4';
        else if (ext === 'pdf') mimeType = 'application/pdf';
      }

  // Build FormData. On Android Expo, file uri works in FormData.
      const form = new FormData();
      form.append('file', { uri, name: filename, type: mimeType });
      form.append('type', mimeType.startsWith('image/') ? 'photo' : 'document');

      // Use axios with onUploadProgress
      const uploadRes = await api.post('/ngo/evidence', form, {
        // Let axios set the correct multipart boundary automatically
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });

      if (!uploadRes || !uploadRes.data) return Alert.alert('Upload failed', 'Server returned an error');
      setUploadProgress(0);
      setSelectedFile(null);
      Alert.alert('Uploaded');
      refreshEvidence();
    } catch (err) {
      console.error(err);
      Alert.alert('Upload error', String(err));
    }
  }

  async function handleAnalyze(evidenceId) {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await api.post(`/ngo/evidence/${evidenceId}/analyze`, {}, authHeaders(token));
      Alert.alert('Analysis complete', `Status: ${res.data.evidence.status}`);
      refreshEvidence();
    } catch (err) {
      console.error(err);
      Alert.alert('Analysis failed');
    }
  }

  function openFile(filename) {
    // filename is a relative path like /uploads/evidence/xyz.jpg
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    const url = filename && filename.startsWith('/') ? base + filename : filename;
    // open in browser via Linking
    import('react-native').then(({ Linking }) => Linking.openURL(url).catch(() => Alert.alert('Unable to open')));
  }

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
      (profile.organization_logo.startsWith("http")
        ? profile.organization_logo
        : API_BASE_URL.replace(/\/api\/?$/, "") + profile.organization_logo)
    : null;

  const budgetUtil = dashboard ? dashboard.budgetUtilizationPercent / 100 : 0;
  const partnerships = dashboard ? dashboard.partnershipsCount : 0;
  const reportsDue = dashboard ? dashboard.reportsDueCount : 0;

  return (
    <SafeScreen>
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={ logoUri ? { uri: logoUri } : require("../../assets/images/logo.png") } style={styles.headerLogo} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>{orgName}</Text>
            <Text style={styles.headerSubtitle}>
              {user?.fullName || "Member"} • {formatRoleLabel(user?.role)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAvatar} onPress={() => router.push('/(tabs)/Profile')}>
          <Ionicons name="person-circle" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Stat cards */}
      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: "#ECFDF5" }]}>
          <Text style={styles.statLabel}>Budget Utilization</Text>
          <Text style={styles.statValue}>{dashboard ? `${dashboard.budgetUtilizationPercent}%` : "--"}</Text>
          <Text style={styles.statSmall}>{dashboard ? `$${(dashboard.budgetUsedCents/1000).toFixed(0)}K of $${(dashboard.budgetTotalCents/1000).toFixed(0)}K used` : "--"}</Text>
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

        {dashboard?.budgetBreakdown?.map((b, idx) => (
          <View style={styles.budgetRow} key={b.name + idx}>
            <View style={styles.budgetLabelCol}>
              <Text style={styles.budgetLabel}>{b.name}</Text>
              <Text style={styles.budgetSub}>{`$${(b.amountCents/1000).toFixed(0)}K (${b.percent}%)`}</Text>
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
            <TouchableOpacity style={styles.ghostBtn}><Text style={{color: '#065f46'}}>{d.actionLabel}</Text></TouchableOpacity>
          </View>
        ))}
      </View>

      {/* main tab bar is provided by expo-router Tabs; removed duplicate static bottom nav */}
      {/* Evidence upload card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload Evidence</Text>
        <Text style={{ color: '#6b7280', marginTop: 6 }}>Upload photos or documents to attach to a campaign or report.</Text>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity style={[styles.ghostBtn, { marginRight: 8 }]} onPress={handlePickAndUpload}>
            <Text style={{ color: '#065f46' }}>Pick & Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ghostBtn]} onPress={refreshEvidence}>
            <Text style={{ color: '#065f46' }}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {selectedFile && (
          <View style={{ marginTop: 12 }}>
            {selectedFile.mimeType && selectedFile.mimeType.startsWith('image/') ? (
              <Image source={{ uri: selectedFile.uri }} style={{ width: 140, height: 90, borderRadius: 8 }} />
            ) : (
              <Text style={{ marginTop: 6 }}>{selectedFile.name}</Text>
            )}
          </View>
        )}
        {uploadProgress > 0 && (
          <View style={{ marginTop: 10 }}>
            <View style={{ height: 8, backgroundColor: '#e6f4ea', borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ height: 8, backgroundColor: '#16a34a', width: `${uploadProgress}%` }} />
            </View>
            <Text style={{ marginTop: 6 }}>{uploadProgress}%</Text>
          </View>
        )}
      </View>

      {/* Evidence list */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Evidence</Text>
        {evidence.length === 0 && <Text style={{ color: '#6b7280', marginTop: 8 }}>No evidence yet.</Text>}
        {evidence.map((ev) => (
          <View key={ev._id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
            <Text style={{ fontWeight: '700' }}>{ev.originalname || ev.filename}</Text>
            <Text style={{ color: '#6b7280', marginTop: 6 }}>{ev.type} • {ev.status} • ${(ev.amountCents/100).toFixed(2)}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity style={[styles.ghostBtn, { marginRight: 8 }]} onPress={() => handleAnalyze(ev._id)}>
                <Text style={{ color: '#065f46' }}>Analyze</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => openFile(ev.filename)}>
                <Text style={{ color: '#065f46' }}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
    </SafeScreen>
  );
}

function formatRoleLabel(role) {
  if (!role) return "Member";
  if (role === "NGO_MANAGER") return "NGO Manager";
  if (role === "DONOR") return "Donor";
  if (role === "VOLUNTEER") return "Volunteer";
  // fallback prettify
  return role.replace(/_/g, " ").toLowerCase().replace(/(^|\s)\S/g, (t) => t.toUpperCase());
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
