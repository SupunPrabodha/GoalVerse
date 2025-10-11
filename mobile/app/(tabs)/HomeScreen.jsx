import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { me } from "../../lib/auth";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await me();
        if (!mounted) return;
        setUser(u);
        if (!u) {
          router.replace("/(auth)");
          return;
        }

        // If NGO manager and profile incomplete, go to setup
        if (u.role === "NGO_MANAGER" && !u.isOrgProfileComplete) {
          router.replace("/(setup)/OrgProfileSetup");
          return;
        }

        // Route to role-specific home
        if (u.role === "NGO_MANAGER") {
          router.replace("/(tabs)/NGOManagerHome");
        } else if (u.role === "DONOR") {
          router.replace("/(tabs)/DonorHome");
        } else if (u.role === "VOLUNTEER") {
          router.replace("/(tabs)/VolunteerHome");
        } else {
          // Fallback
          router.replace("/(tabs)/NGOManagerHome");
        }
      } catch (e) {
        router.replace("/(auth)");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Redirecting...</Text>
    </View>
  );
}

// Hide this redirect helper from the tab bar and deep links within the tabs group
export const options = {
  tabBarButton: () => null,
};