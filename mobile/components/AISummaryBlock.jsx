import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { getAISummary } from "../lib/ai";
import { Ionicons } from "@expo/vector-icons";

export default function AISummaryBlock({ projectId, scope = "project" }) {
  const [loading, setLoading] = React.useState(false);
  const [text, setText] = React.useState("");

  const load = async (force = false) => {
    setLoading(true);
    try {
      const { summary } = await getAISummary({ scope, id: projectId, forceRefresh: force });
      setText(summary || "");
    } catch (e) {
      setText("AI summary not available.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(false); }, [projectId]);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>AI Summary</Text>
        <TouchableOpacity onPress={() => load(true)} style={s.refresh}>
          <Ionicons name="refresh-outline" size={18} color="#16a34a" />
          <Text style={s.refreshText}>Regenerate</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color="#16a34a" />
      ) : (
        <Text style={s.body}>{text}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontWeight: "800", color: "#0f172a" },
  refresh: { flexDirection: "row", alignItems: "center", gap: 6 },
  refreshText: { color: "#16a34a", fontWeight: "700" },
  body: { color: "#111827", lineHeight: 20 },
});
