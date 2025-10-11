// import { View, Text } from 'react-native'
// import React from 'react'

// export default function FinanceDashboard() {
//   return (
//     <View>
//       <Text>FinanceDashboard</Text>
//     </View>
//   )
// }




// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// export default function FinanceDashboard() {
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Finance Dashboard</Text>

//       <TouchableOpacity
//         style={styles.cta}
//         onPress={() => router.push("/(tabs)/ProjectCreate")}
//       >
//         <Ionicons name="add-circle-outline" size={18} color="#fff" />
//         <Text style={styles.ctaText}>Create Project</Text>
//       </TouchableOpacity>

//       {/* ...your dashboard content goes here... */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#111827", padding: 16 },
//   title: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 16 },
//   cta: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     alignSelf: "flex-start",
//     backgroundColor: "#16a34a",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//   },
//   ctaText: { color: "#fff", fontWeight: "700" },
// });


import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ManagerNavBar from "../../components/ManagerNavBar";

export default function FinanceDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finance Dashboard</Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity style={styles.cta} onPress={() => router.push("/(tabs)/ProjectCreate")}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.ctaText}>Create Project</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={() => router.push("/(tabs)/ProjectList")}>
          <Ionicons name="albums-outline" size={18} color="#16a34a" />
          <Text style={styles.secondaryText}>View Projects</Text>
        </TouchableOpacity>
      </View>
      <ManagerNavBar />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827", padding: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 16 },
  cta: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#16a34a",
         paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  ctaText: { color: "#fff", fontWeight: "700" },
  secondary: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#ecfdf5",
               paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  secondaryText: { color: "#16a34a", fontWeight: "700" },
});

