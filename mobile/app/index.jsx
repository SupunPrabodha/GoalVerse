// import { Link } from "expo-router";
// import { Text, View } from "react-native";

// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Bruhh! This is sick!!!</Text>

//       <Link href="/(auth)">Login page</Link>
//       <Link href="(auth)/signup">signup page</Link>
      
//     </View>
//   );
// }


// app/index.jsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { me, getToken } from "../lib/auth"; // uses your existing helpers

export default function SplashScreen() {
  const router = useRouter();
  const [dot, setDot] = useState(0);

  // little "..." pulse for Loading…
  useEffect(() => {
    const t = setInterval(() => setDot((d) => (d + 1) % 3), 400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // tiny delay so the splash is visible
        await new Promise((r) => setTimeout(r, 800));

        const token = await getToken();
        if (!token) {
          router.replace("/(auth)"); // your AuthScreen stack
          return;
        }

        const user = await me().catch(() => null);
        if (!user) {
          router.replace("/(auth)");
          return;
        }

        // route by role + setup status
        if (user.role === "NGO_MANAGER") {
          if (!user.isOrgProfileComplete) {
            router.replace("/(setup)/OrgProfileSetup");
          } else {
            router.replace("/(tabs)/NGOManagerHome"); // your manager dashboard
          }
        } else {
          // donors + volunteers
          router.replace("/(tabs)/HomeScreen");
        }
      } catch (e) {
        console.warn(e?.message || e);
        router.replace("/(auth)");
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.wrap}>
        <View style={{ flex: 1 }} />
        <Image
          source={require("../assets/images/splash-image.png")} // 👈 replace with your file
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={styles.title}>SDG Progress Partners</Text>
        <Text style={styles.subtitle}>Financial Transparency for{"\n"}Sustainable Development</Text>

        <View style={{ height: 24 }} />

        {/* dots + spinner */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, dot === 0 && styles.dotActive]} />
          <View style={[styles.dot, dot === 1 && styles.dotActive]} />
          <View style={[styles.dot, dot === 2 && styles.dotActive]} />
        </View>
        <Text style={styles.loadingText}>Loading…</Text>

        <View style={{ height: 12 }} />
        <ActivityIndicator color="#16a34a" />

        <View style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", paddingHorizontal: 24 },
  illustration: { width: 260, height: 260, marginTop: 40, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "900", color: "#111827", marginTop: 6 },
  subtitle: { marginTop: 6, textAlign: "center", color: "#6b7280", lineHeight: 20 },
  dotsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#e5e7eb" },
  dotActive: { backgroundColor: "#a7f3d0" },
  loadingText: { marginTop: 6, color: "#6b7280" },
});
