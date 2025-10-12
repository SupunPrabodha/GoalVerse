import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Partners() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partners</Text>
      {/* Add your partners UI and logic here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16a34a",
  },
});
