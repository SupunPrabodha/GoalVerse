import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { me } from "../../lib/auth";
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: COLORS.primary }}>
    <View style={{ flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 8, paddingBottom: 10, justifyContent: 'space-around', alignItems: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12, elevation: 8 }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });
        const icon = options.tabBarIcon ? options.tabBarIcon({ color: isFocused ? COLORS.onPrimary : '#d1fae5' }) : null;
        if (options.tabBarButton !== undefined) return <View key={route.key} style={{ width: 0, height: 0 }} />;
        return (
          <TouchableOpacity key={route.key} accessibilityRole="button" accessibilityState={isFocused ? { selected: true } : {}} accessibilityLabel={options.tabBarAccessibilityLabel} testID={options.tabBarTestID} onPress={onPress} onLongPress={onLongPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              {icon}
              {typeof label === 'string' && <Text style={{ color: isFocused ? COLORS.onPrimary : '#d1fae5', fontWeight: '700', fontSize: 12, marginTop: 4 }}>{label}</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  const [role, setRole] = useState(null);
  useEffect(() => {
    (async () => {
      try { const u = await me(); setRole(u?.role || null); } catch {}
    })();
  }, []);

  const allow = (screen) => {
    if (role === 'NGO_MANAGER') return new Set(['NGOManagerHome','Projects','Reports','Notifications','Profile']).has(screen);
  if (role === 'DONOR') return new Set(['DonorHome','DonorDonate','Projects','Notifications','Profile']).has(screen);
    if (role === 'VOLUNTEER') return new Set(['VolunteerHome','Notifications','Profile']).has(screen);
    return false;
  };

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.onPrimary,
        tabBarInactiveTintColor: "#d1fae5",
        tabBarLabelStyle: { fontWeight: '700' },
        tabBarItemStyle: { justifyContent: 'center', alignItems: 'center' },
        tabBarIcon: ({ color }) => {
          let name = "home-outline";
          if (route.name === "NGOManagerHome" || route.name === "DonorHome" || route.name === "VolunteerHome") name = "home-outline";
          else if (route.name === "Projects") name = "hand-left-outline";
          else if (route.name === "Reports") name = "bar-chart-outline";
          else if (route.name === "Notifications") name = "notifications-outline";
          else if (route.name === "Profile") name = "person-circle-outline";
          return <Ionicons name={name} size={22} color={color} />;
        },
      })}
    >
  {/* Always declare screens; hide unauthorized tabs using only tabBarButton (no href) */}
      <Tabs.Screen name="NGOManagerHome" options={{ title: "Home", ...(allow('NGOManagerHome') ? {} : { tabBarButton: () => null }) }} />
      <Tabs.Screen name="DonorHome" options={{ title: "Home", ...(allow('DonorHome') ? {} : { tabBarButton: () => null }) }} />
      <Tabs.Screen name="VolunteerHome" options={{ title: "Home", ...(allow('VolunteerHome') ? {} : { tabBarButton: () => null }) }} />
  <Tabs.Screen name="Projects" options={{ title: "Partnerships", ...(allow('Projects') ? {} : { tabBarButton: () => null }) }} />
      <Tabs.Screen name="Reports" options={{ title: "Reports", ...(allow('Reports') ? {} : { tabBarButton: () => null }) }} />
      <Tabs.Screen name="Notifications" options={{ title: "Alerts", ...(allow('Notifications') ? {} : { tabBarButton: () => null }) }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile", ...(allow('Profile') ? {} : { tabBarButton: () => null }) }} />
      {/* Hidden utility screen for initial redirect */}
      <Tabs.Screen name="HomeScreen" options={{ tabBarButton: () => null }} />
      {/* Hidden donor donate screen, accessible via navigation */}
      <Tabs.Screen name="DonorDonate" options={{ title: "Donate", tabBarButton: () => null }} />
    </Tabs>
  );
}
