import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listMyProjects } from "../../lib/projects";
import { useRouter } from "expo-router";

const sdgLabel = (n) => `SDG ${n}`;

export default function ProjectList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listMyProjects();
        setProjects(data);
      } catch (e) {
        console.warn(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}><ActivityIndicator color="#16a34a" /></View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.header}>All Projects</Text>
        <Text style={styles.subHeader}>
            Keep your project upto date
        </Text>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.muted}>{sdgLabel(item.sdg)} • {item.region || "No region"}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.btn} onPress={() => router.push(`/(tabs)/ProjectUpdate/${item._id}`)}>
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGhost} onPress={() => router.push(`/(tabs)/ProjectUpdate/${item._id}`)}>
                <Ionicons name="eye-outline" size={16} color="#16a34a" />
                <Text style={styles.btnGhostText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 20 }}>No projects yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#111827" },
  header: { fontWeight: "800", fontSize: 20, color: "#a7eec9ff", marginBottom: 4, marginTop: 16, marginLeft: 8 },
  card: { backgroundColor: "#fff", marginBottom: 12, borderRadius: 12, padding: 12 },
  name: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  muted: { color: "#6b7280", marginTop: 2 },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: { flexDirection: "row", gap: 6, backgroundColor: "#16a34a", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
  btnGhost: { flexDirection: "row", gap: 6, backgroundColor: "#ecfdf5", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btnGhostText: { color: "#16a34a", fontWeight: "700" },
});
