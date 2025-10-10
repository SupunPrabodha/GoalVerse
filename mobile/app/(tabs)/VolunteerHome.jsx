import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function VolunteerHome() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Volunteer Dashboard</Text>
      <Text style={styles.subtitle}>Manage assignments, check upcoming events, and log activity.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Events</Text>
        <Text style={styles.cardText}>No upcoming events scheduled.</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Find Opportunities</Text>
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
