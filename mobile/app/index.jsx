import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from "../lib/auth";
import { api } from "../lib/api";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const onboarded = await AsyncStorage.getItem('onboardingDone');
        if (onboarded !== 'true') {
          router.replace('/onboarding');
          return;
        }
        const token = await getToken();
        if (!token) {
          router.replace('/(auth)');
          return;
        }
        // Validate token and route to appropriate home/setup
        try {
          const meRes = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
          const user = meRes.data?.user || meRes.data;
          if (user?.role === 'NGO_MANAGER' && !user?.isOrgProfileComplete) {
            router.replace('/(setup)/OrgProfileSetup');
          } else {
            router.replace('/(tabs)/HomeScreen');
          }
        } catch {
          router.replace('/(auth)');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  return <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}><ActivityIndicator /></View>;
}
