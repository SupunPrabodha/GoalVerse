import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AISummaryBlock from "./AISummaryBlock";

/**
 * Reusable AI Summary section with its own toggle button
 * Props:
 * - projectId: string (required)
 * - defaultOpen?: boolean
 * - style?: ViewStyle
 */
export default function AISummarySection({ projectId, defaultOpen = false, style }) {
  const [open, setOpen] = React.useState(!!defaultOpen);

  return (
    <View style={style}>
      <TouchableOpacity style={s.primaryBtn} onPress={() => setOpen(v => !v)}>
        <Ionicons name="sparkles-outline" size={18} color="#fff" />
        <Text style={s.primaryText}>{open ? "Hide AI Summary" : "AI Summary"}</Text>
      </TouchableOpacity>

      {open && (
        <View style={s.card}>
          <AISummaryBlock projectId={projectId} scope="project" />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  primaryBtn: {
    backgroundColor: "#16a34a", paddingVertical: 12, alignItems: "center",
    borderRadius: 10, flexDirection: "row", gap: 8, justifyContent: "center",
    marginTop: 0, marginBottom: 25
  },
  primaryText: { color: "#fff", fontWeight: "800" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12 },
});
