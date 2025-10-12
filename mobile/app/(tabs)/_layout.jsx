import React from 'react'
import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="FinanceDashboard" options={{ title: "Finance Dashboard" }} />
      <Stack.Screen name="ProjectCreate" options={{ title: "New Project" }} />
      <Stack.Screen name="ProjectList" options={{ title: "Projects" }} />
      <Stack.Screen name="ProjectUpdate/[id]" options={{ title: "Update Project" }} />
      <Stack.Screen name="OrgProjects/[orgId]" options={{ title: "Projects" }} />
      <Stack.Screen name="ProjectDetails/[id]" options={{ title: "Project Details" }} />
      <Stack.Screen name="ProjectDashboard" options={{ title: "Project Dashboard" }} />
      <Stack.Screen name="NGOManagerHome" options={{ title: "Home" }} />
      <Stack.Screen name="DonorHome" options={{ title: "Partners" }} />
      <Stack.Screen name="DonorProfile" options={{ title: "Donor Profile" }} />
      <Stack.Screen name="Reports" options={{ title: "Reports" }} />
      <Stack.Screen name="Notifications" options={{ title: "Alerts" }} />
      <Stack.Screen name="VolunteerHome" options={{ title: "Profile" }} />
      <Stack.Screen name="VolunteerProfile" options={{ title: "Volunteer Profile" }} />
      <Stack.Screen name="AllProjects" options={{ title: "All Projects" }} />
      <Stack.Screen name="DonorDonate" options={{ title: "Donate" }} />
    </Stack>
  )
}
