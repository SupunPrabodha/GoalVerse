import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#16a34a", height: 64, paddingBottom: 8 },
        tabBarIcon: ({ color, size }) => {
          let name = "home";
          if (route.name === "NGOManagerHome") name = "home";
          if (route.name === "DonorHome") name = "people-outline";
          if (route.name === "VolunteerHome") name = "people-outline";
          if (route.name === "Reports") name = "bar-chart-outline";
          if (route.name === "Notifications") name = "notifications-outline";
          return <Ionicons name={name} size={22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="NGOManagerHome" options={{ title: "Home" }} />
      <Tabs.Screen name="DonorHome" options={{ title: "Partners" }} />
      <Tabs.Screen name="Reports" options={{ title: "Reports" }} />
      <Tabs.Screen name="Notifications" options={{ title: "Alerts" }} />
      <Tabs.Screen name="VolunteerHome" options={{ title: "Profile" }} />
    </Tabs>
  );
}
