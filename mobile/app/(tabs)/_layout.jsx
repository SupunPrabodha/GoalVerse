import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from "expo-router";

export default function Tabs_layout() {
  return <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="FinanceDashboard" options={{ title: "Finance Dashboard" }} />
      <Stack.Screen name="ProjectCreate" options={{ title: "New Project" }} />
      {/* test start here */}
      <Stack.Screen name="ProjectList" options={{ title: "Projects" }} />
      <Stack.Screen name="ProjectUpdate/[id]" options={{ title: "Update Project" }} />
        {/* test end here */}
      <Stack.Screen name="OrgProjects/[orgId]" options={{ title: "Projects" }} />
      <Stack.Screen name="ProjectDetails/[id]" options={{ title: "Project Details" }} />

    </Stack>
}