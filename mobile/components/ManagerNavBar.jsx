import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ManagerNavBar() {
  const router = useRouter();
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/NGOManagerHome")}> 
        <Ionicons name="home-outline" size={28} color="#fff" />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/ProjectList")}> 
        <Ionicons name="folder-outline" size={28} color="#fff" />
        <Text style={styles.label}>Project</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/Reports")}> 
        <Ionicons name="document-text-outline" size={28} color="#fff" />
        <Text style={styles.label}>Report</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/Notifications")}> 
        <Ionicons name="notifications-outline" size={28} color="#fff" />
        <Text style={styles.label}>Notification</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/ManagerProfile")}> 
        <Ionicons name="person-outline" size={28} color="#fff" />
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    height: 64,
    paddingBottom: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },
});
