import React from 'react'
import { Stack } from "expo-router";

export default function Auth_layout() {
  // Use file-based routes; don't declare screens that don't exist
  return <Stack screenOptions={{ headerShown: false }} />
}