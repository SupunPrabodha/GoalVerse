import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function DonorHome() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Donor Dashboard</Text>
      <Text style={styles.subtitle}>Access donor reports, give feedback, and review impact summaries.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Donations</Text>
        <Text style={styles.cardText}>You haven't made any donations yet.</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Explore Projects</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#FAFAF9" },
  title: { fontSize: 22, fontWeight: "800", marginTop: 12 },
  subtitle: { color: "#6b7280", marginTop: 6 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginTop: 12 },
  cardTitle: { fontWeight: "700" },
  cardText: { color: "#6b7280", marginTop: 8 },
  primaryBtn: { marginTop: 20, backgroundColor: "#16a34a", padding: 12, borderRadius: 10, alignItems: "center" },
});
