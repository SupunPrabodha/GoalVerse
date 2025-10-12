import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import { useRouter } from "expo-router";
import { listReceivedPartnershipRequests } from "../../lib/partners";

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await listReceivedPartnershipRequests();
        setRequests(data);
      } catch (err) {
        setError("Failed to load partnership requests");
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  return (
    <SafeScreen>
      <ScrollView style={styles.page} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{requests.length} partnership requests received</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" />
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : requests.length === 0 ? (
          <Text style={{ color: "#6b7280" }}>No partnership requests received.</Text>
        ) : (
          requests.map((req) => (
            <View key={req._id} style={styles.card}>
              <Text style={styles.cardTitle}>Partnership Request from {req.requester?.fullName || "Unknown"}</Text>
              <Text style={styles.desc}>Project: {req.projectId?.name || req.projectId}</Text>
              <Text style={styles.desc}>Type: {req.partnerType}</Text>
              <Text style={styles.desc}>Status: {req.status}</Text>
              <Text style={styles.timeText}>{new Date(req.createdAt).toLocaleString()}</Text>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => {
                  const pid = req.projectId?._id || req.projectId;
                  if (pid) {
                    router.push(`/ProjectDetails/${pid}`);
                  }
                }}
              >
                <Text style={styles.viewBtnText}>View Project</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#111827" },
  title: { fontSize: 22, fontWeight: "800", marginTop: 12, color: "#a7eec9ff" },
  subtitle: { color: "#d1fae5", marginTop: 6 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginTop: 12 },
  cardTitle: { fontWeight: "700", color: "#0f172a" },
  desc: { color: "#6b7280", marginTop: 6 },
  timeText: { color: "#6b7280", fontSize: 12 },
  viewBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  viewBtnText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
  },
});
