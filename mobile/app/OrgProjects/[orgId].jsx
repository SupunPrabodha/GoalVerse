import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchOrgProjects } from "../../lib/public";
import { Ionicons } from "@expo/vector-icons";

const sdgLabel = (n) => `SDG ${n}`;

export default function OrgProjects() {
  const { orgId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      try { setProjects(await fetchOrgProjects(orgId)); }
      catch (e) { console.warn(e.message); }
      finally { setLoading(false); }
    })();
  }, [orgId]);

  if (loading) {
    return <SafeAreaView style={s.center}><ActivityIndicator color="#16a34a" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={s.wrap}>
      <FlatList
        contentContainerStyle={{ padding: 12 }}
        data={projects}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.title}>{item.name}</Text>
            <Text style={s.sub}>{sdgLabel(item.sdg)} • {item.region || "—"}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={s.btn}
                onPress={() => router.push(`/(tabs)/ProjectDetails/${item._id}`)}
              >
                <Ionicons name="eye-outline" size={16} color="#fff" />
                <Text style={s.btnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 20 }}>No projects</Text>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#111827" },
  center: { flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12 },
  title: { fontWeight: "800", color: "#0f172a", fontSize: 16 },
  sub: { color: "#6b7280", marginTop: 2 },
  btn: { backgroundColor: "#16a34a", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", gap: 6, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
