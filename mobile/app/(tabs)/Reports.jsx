import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Reports() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Financial Reports</Text>
      <Text style={styles.subtitle}>Generate and view financial reports and charts.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#FAFAF9" },
  title: { fontSize: 22, fontWeight: "800", marginTop: 12 },
  subtitle: { color: "#6b7280", marginTop: 6 },
});
